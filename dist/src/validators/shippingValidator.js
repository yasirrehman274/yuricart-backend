"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminShippingQuerySchema = exports.updateShippingSchema = exports.createShippingSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.createShippingSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    rate: zod_1.z.coerce.number().min(0),
    freeAbove: zod_1.z.coerce.number().min(0).optional(),
    regions: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
exports.updateShippingSchema = exports.createShippingSchema.partial();
exports.adminShippingQuerySchema = common_1.paginationQuerySchema.extend({
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
