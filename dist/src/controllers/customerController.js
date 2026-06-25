"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchAdminCustomer = exports.getAdminCustomers = void 0;
const customerService_1 = require("../services/customerService");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
exports.getAdminCustomers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, customerService_1.listCustomers)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.patchAdminCustomer = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const customer = await (0, customerService_1.updateCustomerStatus)(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, customer);
});
