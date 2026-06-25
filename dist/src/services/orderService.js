"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderNumber = generateOrderNumber;
exports.createOrder = createOrder;
exports.getOrderByNumber = getOrderByNumber;
exports.trackOrder = trackOrder;
exports.getUserOrders = getUserOrders;
exports.listAdminOrders = listAdminOrders;
exports.getAdminOrderById = getAdminOrderById;
exports.updateOrderStatus = updateOrderStatus;
exports.assertOrderBelongsToUser = assertOrderBelongsToUser;
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const ApiError_1 = require("../utils/ApiError");
const pagination_1 = require("../utils/pagination");
const query_1 = require("../utils/query");
const couponService_1 = require("./couponService");
const shippingService_1 = require("./shippingService");
function getProductPrice(product) {
    return product.salePrice ?? product.price;
}
function matchVariant(variants, options) {
    if (!options || !Object.keys(options).length)
        return undefined;
    return variants.find((variant) => {
        if (!variant.options)
            return false;
        const variantOptions = variant.options instanceof Map
            ? Object.fromEntries(variant.options)
            : variant.options;
        return Object.entries(options).every(([key, value]) => variantOptions[key]?.toLowerCase() === value.toLowerCase());
    });
}
function getPrimaryImage(product) {
    const images = product.images;
    if (!images)
        return undefined;
    if (Array.isArray(images)) {
        const primary = images.find((img) => img.isPrimary);
        return primary?.url || images[0]?.url;
    }
    return images?.primary?.url || undefined;
}
async function generateOrderNumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `YC-${dateStr}-`;
    const lastOrder = await Order_1.Order.findOne({
        orderNumber: new RegExp(`^${prefix}`),
    })
        .sort({ orderNumber: -1 })
        .select("orderNumber")
        .lean();
    let seq = 1;
    if (lastOrder?.orderNumber) {
        const match = lastOrder.orderNumber.match(/(\d+)$/);
        if (match)
            seq = parseInt(match[1], 10) + 1;
    }
    return `${prefix}${String(seq).padStart(4, "0")}`;
}
async function resolveLineItems(items) {
    const lineItems = [];
    let subtotal = 0;
    for (const item of items) {
        const product = await Product_1.Product.findById(item.productId);
        if (!product || product.status !== "active") {
            throw new ApiError_1.BadRequestError(`Product not available: ${item.productId}`);
        }
        const variant = matchVariant(product.variants, item.options);
        const unitPrice = variant?.salePrice ?? variant?.price ?? getProductPrice(product);
        const availableStock = variant?.stock ?? product.stock;
        if (availableStock < item.quantity) {
            throw new ApiError_1.BadRequestError(`Insufficient stock for "${product.title}". Available: ${availableStock}`);
        }
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;
        const variantIndex = variant !== undefined ? product.variants.indexOf(variant) : undefined;
        lineItems.push({
            orderItem: {
                productId: product._id,
                title: product.title,
                slug: product.slug,
                sku: variant?.sku || product.sku,
                image: getPrimaryImage(product),
                price: unitPrice,
                quantity: item.quantity,
                options: item.options,
            },
            stockUpdates: [
                {
                    productId: product._id.toString(),
                    variantIndex: variantIndex !== undefined && variantIndex >= 0 ? variantIndex : undefined,
                    quantity: item.quantity,
                },
            ],
        });
    }
    return { lineItems, subtotal };
}
async function applyStockUpdates(stockUpdates) {
    for (const update of stockUpdates) {
        const product = await Product_1.Product.findById(update.productId);
        if (!product)
            continue;
        if (update.variantIndex !== undefined) {
            const variant = product.variants[update.variantIndex];
            if (variant) {
                variant.stock = Math.max(0, (variant.stock ?? 0) - update.quantity);
            }
        }
        else {
            product.stock = Math.max(0, product.stock - update.quantity);
        }
        await product.save();
    }
}
async function createOrder(input, customerId) {
    const { lineItems, subtotal } = await resolveLineItems(input.items);
    let discount = 0;
    let couponId;
    let couponCode;
    if (input.couponCode) {
        const couponResult = await (0, couponService_1.validateCoupon)({
            code: input.couponCode,
            subtotal,
        });
        discount = couponResult.discount;
        couponId = couponResult.couponId;
        couponCode = couponResult.couponCode;
    }
    const region = input.shippingRegion || input.county || input.city;
    const shipping = await (0, shippingService_1.calculateShippingCost)(subtotal, region);
    const total = Math.max(0, subtotal + shipping - discount);
    const orderNumber = await generateOrderNumber();
    const order = await Order_1.Order.create({
        orderNumber,
        customer: customerId || undefined,
        customerName: input.customerName,
        email: input.email.toLowerCase(),
        phone: input.phone,
        address: input.address,
        city: input.city,
        county: input.county,
        postalCode: input.postalCode,
        items: lineItems.map((li) => li.orderItem),
        subtotal,
        shipping,
        discount,
        total,
        couponCode,
        couponId,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "cod" ? "pending" : "pending",
        orderStatus: "pending",
        notes: input.notes,
    });
    const allStockUpdates = lineItems.flatMap((li) => li.stockUpdates);
    await applyStockUpdates(allStockUpdates);
    if (couponId) {
        await (0, couponService_1.incrementCouponUsage)(couponId);
    }
    return order.toObject();
}
async function getOrderByNumber(orderNumber) {
    const order = await Order_1.Order.findOne({ orderNumber })
        .populate("customer", "name email phone")
        .lean();
    if (!order)
        throw new ApiError_1.NotFoundError("Order not found");
    return order;
}
async function trackOrder(orderNumber, email) {
    const order = await Order_1.Order.findOne({
        orderNumber,
        email: email.toLowerCase(),
    })
        .select("orderNumber orderStatus paymentStatus paymentMethod trackingNumber items subtotal shipping discount total createdAt updatedAt")
        .lean();
    if (!order) {
        throw new ApiError_1.NotFoundError("Order not found. Check order number and email.");
    }
    return order;
}
async function getUserOrders(userId, query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = { customer: userId };
    const [items, total] = await Promise.all([
        Order_1.Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Order_1.Order.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
function buildAdminOrderFilter(query) {
    const filter = {};
    if (query.orderStatus)
        filter.orderStatus = query.orderStatus;
    if (query.paymentStatus)
        filter.paymentStatus = query.paymentStatus;
    if (query.paymentMethod)
        filter.paymentMethod = query.paymentMethod;
    if (query.from || query.to) {
        filter.createdAt = {};
        if (query.from)
            filter.createdAt.$gte = query.from;
        if (query.to)
            filter.createdAt.$lte = query.to;
    }
    if (query.q) {
        filter.$or = [
            { orderNumber: { $regex: query.q, $options: "i" } },
            { customerName: { $regex: query.q, $options: "i" } },
            { email: { $regex: query.q, $options: "i" } },
            { phone: { $regex: query.q, $options: "i" } },
        ];
    }
    return filter;
}
async function listAdminOrders(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = buildAdminOrderFilter(query);
    const sort = (0, query_1.parseSort)(query.sort, { createdAt: -1 });
    const [items, total] = await Promise.all([
        Order_1.Order.find(filter)
            .populate("customer", "name email phone")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Order_1.Order.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function getAdminOrderById(id) {
    const order = await Order_1.Order.findById(id)
        .populate("customer", "name email phone status")
        .populate("couponId", "code discountType discountValue")
        .lean();
    if (!order)
        throw new ApiError_1.NotFoundError("Order not found");
    return order;
}
async function updateOrderStatus(id, input) {
    const order = await Order_1.Order.findById(id);
    if (!order)
        throw new ApiError_1.NotFoundError("Order not found");
    if (input.orderStatus)
        order.orderStatus = input.orderStatus;
    if (input.paymentStatus)
        order.paymentStatus = input.paymentStatus;
    if (input.trackingNumber !== undefined)
        order.trackingNumber = input.trackingNumber;
    if (input.mpesaReceiptNumber !== undefined) {
        order.mpesaReceiptNumber = input.mpesaReceiptNumber;
    }
    if (input.notes !== undefined)
        order.notes = input.notes;
    await order.save();
    return Order_1.Order.findById(order._id)
        .populate("customer", "name email phone")
        .lean();
}
async function assertOrderBelongsToUser(orderId, userId) {
    const order = await Order_1.Order.findById(orderId);
    if (!order)
        throw new ApiError_1.NotFoundError("Order not found");
    if (!order.customer || order.customer.toString() !== userId) {
        throw new ApiError_1.UnauthorizedError("You do not have access to this order");
    }
    return order;
}
