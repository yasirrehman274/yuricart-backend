"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBannerSchema = exports.createBannerSchema = exports.adminBannerQuerySchema = exports.publicBannerQuerySchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.publicBannerQuerySchema = common_1.paginationQuerySchema.extend({
    placement: zod_1.z.enum(["hero", "promo"]).optional(),
    sort: common_1.sortQuerySchema.optional(),
});
exports.adminBannerQuerySchema = exports.publicBannerQuerySchema.extend({
    q: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
exports.createBannerSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    subtitle: zod_1.z.string().optional(),
    slug: zod_1.z.string().min(1).optional(),
    image: zod_1.z.string().min(1),
    link: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
    sortOrder: zod_1.z.coerce.number().int().optional(),
    placement: zod_1.z.enum(["hero", "promo"]).optional(),
});
exports.updateBannerSchema = exports.createBannerSchema.partial();
