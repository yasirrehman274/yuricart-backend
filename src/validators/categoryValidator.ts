import { z } from "zod";
import { paginationQuerySchema, sortQuerySchema } from "./common";

export const publicCategoryQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  sort: sortQuerySchema.optional(),
});

export const adminCategoryQuerySchema = publicCategoryQuerySchema.extend({
  status: z.enum(["active", "inactive"]).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type PublicCategoryQuery = z.infer<typeof publicCategoryQuerySchema>;
export type AdminCategoryQuery = z.infer<typeof adminCategoryQuerySchema>;
