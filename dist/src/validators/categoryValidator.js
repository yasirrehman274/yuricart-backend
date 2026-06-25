"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = exports.adminCategoryQuerySchema = exports.publicCategoryQuerySchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.publicCategoryQuerySchema = common_1.paginationQuerySchema.extend({
    q: zod_1.z.string().optional(),
    sort: common_1.sortQuerySchema.optional(),
});
exports.adminCategoryQuerySchema = exports.publicCategoryQuerySchema.extend({
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1).optional(),
    image: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
    sortOrder: zod_1.z.coerce.number().int().optional(),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
