"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = exports.adminProductQuerySchema = exports.publicProductQuerySchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.publicProductQuerySchema = common_1.paginationQuerySchema.extend({
    q: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().min(0).optional(),
    maxPrice: zod_1.z.coerce.number().min(0).optional(),
    sort: common_1.sortQuerySchema.optional(),
    featured: common_1.booleanStringSchema,
    newArrival: common_1.booleanStringSchema,
    bestSeller: common_1.booleanStringSchema,
    tags: zod_1.z.string().optional(),
});
exports.adminProductQuerySchema = exports.publicProductQuerySchema.extend({
    status: zod_1.z.enum(["draft", "active", "archived"]).optional(),
});
exports.createProductSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    shortDescription: zod_1.z.string().optional(),
    price: zod_1.z.coerce.number().min(0),
    salePrice: zod_1.z.coerce.number().min(0).optional(),
    sku: zod_1.z.string().optional(),
    stock: zod_1.z.coerce.number().int().min(0).optional(),
    category: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    brand: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    images: zod_1.z.array(common_1.imageSchema).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    colors: zod_1.z.array(zod_1.z.string()).optional(),
    sizes: zod_1.z.array(zod_1.z.string()).optional(),
    variants: zod_1.z.array(common_1.productVariantSchema).optional(),
    status: zod_1.z.enum(["draft", "active", "archived"]).optional(),
    featured: zod_1.z.boolean().optional(),
    newArrival: zod_1.z.boolean().optional(),
    bestSeller: zod_1.z.boolean().optional(),
    ribbon: zod_1.z.string().optional(),
    currency: zod_1.z.string().length(3).optional(),
});
exports.updateProductSchema = exports.createProductSchema.partial();
