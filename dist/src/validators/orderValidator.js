"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderNumberParamSchema = exports.updateOrderStatusSchema = exports.adminOrderQuerySchema = exports.trackOrderQuerySchema = exports.trackOrderParamsSchema = exports.createOrderSchema = exports.orderItemInputSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.orderItemInputSchema = zod_1.z.object({
    productId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
    quantity: zod_1.z.coerce.number().int().min(1),
    options: zod_1.z.record(zod_1.z.string()).optional(),
});
exports.createOrderSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(1),
    address: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    county: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.orderItemInputSchema).min(1),
    couponCode: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.enum(["cod", "whatsapp", "mpesa", "card"]),
    notes: zod_1.z.string().optional(),
    shippingRegion: zod_1.z.string().optional(),
});
exports.trackOrderParamsSchema = zod_1.z.object({
    orderNumber: zod_1.z.string().min(1),
});
exports.trackOrderQuerySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.adminOrderQuerySchema = common_1.paginationQuerySchema.extend({
    q: zod_1.z.string().optional(),
    orderStatus: zod_1.z
        .enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
        .optional(),
    paymentStatus: zod_1.z.enum(["pending", "paid", "failed", "refunded"]).optional(),
    paymentMethod: zod_1.z.enum(["cod", "whatsapp", "mpesa", "card"]).optional(),
    sort: common_1.sortQuerySchema.optional(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    orderStatus: zod_1.z
        .enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
        .optional(),
    paymentStatus: zod_1.z.enum(["pending", "paid", "failed", "refunded"]).optional(),
    trackingNumber: zod_1.z.string().optional(),
    mpesaReceiptNumber: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.orderNumberParamSchema = zod_1.z.object({
    orderNumber: zod_1.z.string().min(1),
});
