"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerStatusSchema = exports.adminCustomerQuerySchema = exports.customerLoginSchema = exports.customerRegisterSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.customerRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    phone: zod_1.z.string().optional(),
});
exports.customerLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.adminCustomerQuerySchema = common_1.paginationQuerySchema.extend({
    q: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "blocked"]).optional(),
});
exports.updateCustomerStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["active", "blocked"]),
});
