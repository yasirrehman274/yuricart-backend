import { z } from "zod";
import { paginationQuerySchema, sortQuerySchema } from "./common";

export const orderItemInputSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  quantity: z.coerce.number().int().min(1),
  options: z.record(z.string()).optional(),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  county: z.string().optional(),
  postalCode: z.string().optional(),
  items: z.array(orderItemInputSchema).min(1),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["cod", "whatsapp", "mpesa", "card"]),
  notes: z.string().optional(),
  shippingRegion: z.string().optional(),
});

export const trackOrderParamsSchema = z.object({
  orderNumber: z.string().min(1),
});

export const trackOrderQuerySchema = z.object({
  email: z.string().email(),
});

export const adminOrderQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  orderStatus: z
    .enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  paymentMethod: z.enum(["cod", "whatsapp", "mpesa", "card"]).optional(),
  sort: sortQuerySchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z
    .enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  trackingNumber: z.string().optional(),
  mpesaReceiptNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const orderNumberParamSchema = z.object({
  orderNumber: z.string().min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
