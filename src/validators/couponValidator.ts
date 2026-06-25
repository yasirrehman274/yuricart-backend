import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  subtotal: z.coerce.number().min(0),
});

export const createCouponSchema = z.object({
  code: z.string().min(1),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().int().min(1).optional(),
  expiryDate: z.coerce.date().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const adminCouponQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type AdminCouponQuery = z.infer<typeof adminCouponQuerySchema>;
