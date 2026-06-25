"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCouponQuerySchema = exports.updateCouponSchema = exports.createCouponSchema = exports.validateCouponSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.validateCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    subtotal: zod_1.z.coerce.number().min(0),
});
exports.createCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    discountType: zod_1.z.enum(["percentage", "fixed"]),
    discountValue: zod_1.z.coerce.number().min(0),
    minOrderAmount: zod_1.z.coerce.number().min(0).optional(),
    maxUses: zod_1.z.coerce.number().int().min(1).optional(),
    expiryDate: zod_1.z.coerce.date().optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
exports.updateCouponSchema = exports.createCouponSchema.partial();
exports.adminCouponQuerySchema = common_1.paginationQuerySchema.extend({
    q: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
