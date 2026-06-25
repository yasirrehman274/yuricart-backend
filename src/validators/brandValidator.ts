import { z } from "zod";
import { paginationQuerySchema, sortQuerySchema } from "./common";

export const publicBrandQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  sort: sortQuerySchema.optional(),
});

export const adminBrandQuerySchema = publicBrandQuerySchema.extend({
  status: z.enum(["active", "inactive"]).optional(),
});

export const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  logo: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const updateBrandSchema = createBrandSchema.partial();

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type PublicBrandQuery = z.infer<typeof publicBrandQuerySchema>;
export type AdminBrandQuery = z.infer<typeof adminBrandQuerySchema>;
