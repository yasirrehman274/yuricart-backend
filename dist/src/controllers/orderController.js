"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchAdminOrder = exports.getAdminOrder = exports.getAdminOrders = exports.getMyOrders = exports.trackPublicOrder = exports.createPublicOrder = void 0;
const orderService_1 = require("../services/orderService");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
exports.createPublicOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const customerId = req.user?.role === "customer" ? req.user.sub : undefined;
    const order = await (0, orderService_1.createOrder)(req.body, customerId);
    (0, response_1.sendSuccess)(res, order, 201);
});
exports.trackPublicOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await (0, orderService_1.trackOrder)(req.params.orderNumber, req.query.email);
    (0, response_1.sendSuccess)(res, order);
});
exports.getMyOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, orderService_1.getUserOrders)(req.user.sub, req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getAdminOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, orderService_1.listAdminOrders)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getAdminOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await (0, orderService_1.getAdminOrderById)(req.params.id);
    (0, response_1.sendSuccess)(res, order);
});
exports.patchAdminOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await (0, orderService_1.updateOrderStatus)(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, order);
});
