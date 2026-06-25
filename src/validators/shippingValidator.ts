import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const createShippingSchema = z.object({
  name: z.string().min(1),
  rate: z.coerce.number().min(0),
  freeAbove: z.coerce.number().min(0).optional(),
  regions: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const updateShippingSchema = createShippingSchema.partial();

export const adminShippingQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateShippingInput = z.infer<typeof createShippingSchema>;
export type UpdateShippingInput = z.infer<typeof updateShippingSchema>;
export type AdminShippingQuery = z.infer<typeof adminShippingQuerySchema>;
