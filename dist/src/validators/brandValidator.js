"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBrandSchema = exports.createBrandSchema = exports.adminBrandQuerySchema = exports.publicBrandQuerySchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.publicBrandQuerySchema = common_1.paginationQuerySchema.extend({
    q: zod_1.z.string().optional(),
    sort: common_1.sortQuerySchema.optional(),
});
exports.adminBrandQuerySchema = exports.publicBrandQuerySchema.extend({
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
exports.createBrandSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1).optional(),
    logo: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
exports.updateBrandSchema = exports.createBrandSchema.partial();
