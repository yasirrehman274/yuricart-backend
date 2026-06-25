import { FilterQuery, SortOrder } from "mongoose";
import { IOrder, Order, OrderItem } from "../models/Order";
import { IProduct, Product, ProductVariant } from "../models/Product";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/query";
import { incrementCouponUsage, validateCoupon } from "./couponService";
import { calculateShippingCost } from "./shippingService";
import {
  AdminOrderQuery,
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "../validators/orderValidator";

function getProductPrice(product: IProduct): number {
  return product.salePrice ?? product.price;
}

function matchVariant(
  variants: ProductVariant[],
  options?: Record<string, string>,
): ProductVariant | undefined {
  if (!options || !Object.keys(options).length) return undefined;

  return variants.find((variant) => {
    if (!variant.options) return false;
    const variantOptions =
      variant.options instanceof Map
        ? Object.fromEntries(variant.options)
        : (variant.options as Record<string, string>);

    return Object.entries(options).every(
      ([key, value]) => variantOptions[key]?.toLowerCase() === value.toLowerCase(),
    );
  });
}

function getPrimaryImage(product: IProduct): string | undefined {
  const images = product.images as unknown as
    | Array<{ url: string; isPrimary?: boolean }>
    | { primary?: { url: string }; gallery?: Array<{ url: string }> }
    | undefined;
  if (!images) return undefined;
  if (Array.isArray(images)) {
    const primary = images.find((img) => img.isPrimary);
    return primary?.url || images[0]?.url;
  }
  return (images as { primary?: { url: string } })?.primary?.url || undefined;
}

export async function generateOrderNumber(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `YC-${dateStr}-`;

  const lastOrder = await Order.findOne({
    orderNumber: new RegExp(`^${prefix}`),
  })
    .sort({ orderNumber: -1 })
    .select("orderNumber")
    .lean();

  let seq = 1;
  if (lastOrder?.orderNumber) {
    const match = lastOrder.orderNumber.match(/(\d+)$/);
    if (match) seq = parseInt(match[1], 10) + 1;
  }

  return `${prefix}${String(seq).padStart(4, "0")}`;
}

interface ResolvedLineItem {
  orderItem: OrderItem;
  stockUpdates: Array<{
    productId: string;
    variantIndex?: number;
    quantity: number;
  }>;
}

async function resolveLineItems(
  items: CreateOrderInput["items"],
): Promise<{ lineItems: ResolvedLineItem[]; subtotal: number }> {
  const lineItems: ResolvedLineItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || product.status !== "active") {
      throw new BadRequestError(`Product not available: ${item.productId}`);
    }

    const variant = matchVariant(product.variants, item.options);
    const unitPrice = variant?.salePrice ?? variant?.price ?? getProductPrice(product);
    const availableStock = variant?.stock ?? product.stock;

    if (availableStock < item.quantity) {
      throw new BadRequestError(
        `Insufficient stock for "${product.title}". Available: ${availableStock}`,
      );
    }

    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    const variantIndex =
      variant !== undefined ? product.variants.indexOf(variant) : undefined;

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

async function applyStockUpdates(
  stockUpdates: ResolvedLineItem["stockUpdates"],
) {
  for (const update of stockUpdates) {
    const product = await Product.findById(update.productId);
    if (!product) continue;

    if (update.variantIndex !== undefined) {
      const variant = product.variants[update.variantIndex];
      if (variant) {
        variant.stock = Math.max(0, (variant.stock ?? 0) - update.quantity);
      }
    } else {
      product.stock = Math.max(0, product.stock - update.quantity);
    }

    await product.save();
  }
}

export async function createOrder(
  input: CreateOrderInput,
  customerId?: string,
) {
  const { lineItems, subtotal } = await resolveLineItems(input.items);

  let discount = 0;
  let couponId: string | undefined;
  let couponCode: string | undefined;

  if (input.couponCode) {
    const couponResult = await validateCoupon({
      code: input.couponCode,
      subtotal,
    });
    discount = couponResult.discount;
    couponId = couponResult.couponId;
    couponCode = couponResult.couponCode;
  }

  const region = input.shippingRegion || input.county || input.city;
  const shipping = await calculateShippingCost(subtotal, region);
  const total = Math.max(0, subtotal + shipping - discount);

  const orderNumber = await generateOrderNumber();

  const order = await Order.create({
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
    await incrementCouponUsage(couponId);
  }

  return order.toObject();
}

export async function getOrderByNumber(orderNumber: string) {
  const order = await Order.findOne({ orderNumber })
    .populate("customer", "name email phone")
    .lean();

  if (!order) throw new NotFoundError("Order not found");
  return order;
}

export async function trackOrder(orderNumber: string, email: string) {
  const order = await Order.findOne({
    orderNumber,
    email: email.toLowerCase(),
  })
    .select(
      "orderNumber orderStatus paymentStatus paymentMethod trackingNumber items subtotal shipping discount total createdAt updatedAt",
    )
    .lean();

  if (!order) {
    throw new NotFoundError("Order not found. Check order number and email.");
  }

  return order;
}

export async function getUserOrders(userId: string, query: { page?: number; limit?: number }) {
  const { page, limit, skip } = getPagination(query);
  const filter: FilterQuery<IOrder> = { customer: userId };

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

function buildAdminOrderFilter(query: AdminOrderQuery): FilterQuery<IOrder> {
  const filter: FilterQuery<IOrder> = {};

  if (query.orderStatus) filter.orderStatus = query.orderStatus;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;

  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = query.from;
    if (query.to) filter.createdAt.$lte = query.to;
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

export async function listAdminOrders(query: AdminOrderQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter = buildAdminOrderFilter(query);
  const sort = parseSort(query.sort, { createdAt: -1 } as Record<string, SortOrder>);

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate("customer", "name email phone")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function getAdminOrderById(id: string) {
  const order = await Order.findById(id)
    .populate("customer", "name email phone status")
    .populate("couponId", "code discountType discountValue")
    .lean();

  if (!order) throw new NotFoundError("Order not found");
  return order;
}

export async function updateOrderStatus(id: string, input: UpdateOrderStatusInput) {
  const order = await Order.findById(id);
  if (!order) throw new NotFoundError("Order not found");

  if (input.orderStatus) order.orderStatus = input.orderStatus;
  if (input.paymentStatus) order.paymentStatus = input.paymentStatus;
  if (input.trackingNumber !== undefined) order.trackingNumber = input.trackingNumber;
  if (input.mpesaReceiptNumber !== undefined) {
    order.mpesaReceiptNumber = input.mpesaReceiptNumber;
  }
  if (input.notes !== undefined) order.notes = input.notes;

  await order.save();

  return Order.findById(order._id)
    .populate("customer", "name email phone")
    .lean();
}

export async function assertOrderBelongsToUser(orderId: string, userId: string) {
  const order = await Order.findById(orderId);
  if (!order) throw new NotFoundError("Order not found");

  if (!order.customer || order.customer.toString() !== userId) {
    throw new UnauthorizedError("You do not have access to this order");
  }

  return order;
}
