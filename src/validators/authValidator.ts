import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const customerRegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export const customerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const adminCustomerQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  status: z.enum(["active", "blocked"]).optional(),
});

export const updateCustomerStatusSchema = z.object({
  status: z.enum(["active", "blocked"]),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
export type AdminCustomerQuery = z.infer<typeof adminCustomerQuerySchema>;
export type UpdateCustomerStatusInput = z.infer<typeof updateCustomerStatusSchema>;
