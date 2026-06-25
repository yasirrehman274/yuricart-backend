"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminShippingRule = exports.updateAdminShippingRule = exports.createAdminShippingRule = exports.getAdminShippingRule = exports.getAdminShippingRules = void 0;
const shippingService_1 = require("../services/shippingService");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
exports.getAdminShippingRules = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, shippingService_1.listAdminShipping)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getAdminShippingRule = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const rule = await (0, shippingService_1.getShippingById)(req.params.id);
    (0, response_1.sendSuccess)(res, rule);
});
exports.createAdminShippingRule = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const rule = await (0, shippingService_1.createShipping)(req.body);
    (0, response_1.sendSuccess)(res, rule, 201);
});
exports.updateAdminShippingRule = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const rule = await (0, shippingService_1.updateShipping)(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, rule);
});
exports.deleteAdminShippingRule = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, shippingService_1.deleteShipping)(req.params.id);
    (0, response_1.sendSuccess)(res, result);
});
