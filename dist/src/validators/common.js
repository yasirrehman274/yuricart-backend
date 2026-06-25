"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productVariantSchema = exports.imageSchema = exports.booleanStringSchema = exports.sortQuerySchema = exports.idParamSchema = exports.slugParamSchema = exports.paginationQuerySchema = void 0;
const zod_1 = require("zod");
exports.paginationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
});
exports.slugParamSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID"),
});
exports.sortQuerySchema = zod_1.z.enum([
    "createdAt_desc",
    "createdAt_asc",
    "updatedAt_desc",
    "updatedAt_asc",
    "price_asc",
    "price_desc",
    "title_asc",
    "title_desc",
    "name_asc",
    "name_desc",
    "sortOrder_asc",
    "sortOrder_desc",
]);
exports.booleanStringSchema = zod_1.z.enum(["true", "false", "1", "0"]).optional();
exports.imageSchema = zod_1.z.object({
    url: zod_1.z.string().url().or(zod_1.z.string().min(1)),
    alt: zod_1.z.string().optional(),
    publicId: zod_1.z.string().optional(),
    isPrimary: zod_1.z.boolean().optional(),
});
exports.productVariantSchema = zod_1.z.object({
    sku: zod_1.z.string().optional(),
    options: zod_1.z.record(zod_1.z.string()).optional(),
    price: zod_1.z.coerce.number().min(0).optional(),
    salePrice: zod_1.z.coerce.number().min(0).optional(),
    stock: zod_1.z.coerce.number().int().min(0).optional(),
});
