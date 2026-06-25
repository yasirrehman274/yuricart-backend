import { z } from "zod";
import { paginationQuerySchema, sortQuerySchema } from "./common";

export const publicBannerQuerySchema = paginationQuerySchema.extend({
  placement: z.enum(["hero", "promo"]).optional(),
  sort: sortQuerySchema.optional(),
});

export const adminBannerQuerySchema = publicBannerQuerySchema.extend({
  q: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const createBannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  slug: z.string().min(1).optional(),
  image: z.string().min(1),
  link: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sortOrder: z.coerce.number().int().optional(),
  placement: z.enum(["hero", "promo"]).optional(),
});

export const updateBannerSchema = createBannerSchema.partial();

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
export type PublicBannerQuery = z.infer<typeof publicBannerQuerySchema>;
export type AdminBannerQuery = z.infer<typeof adminBannerQuerySchema>;
