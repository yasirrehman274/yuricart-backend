"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboard = void 0;
const dashboardService_1 = require("../services/dashboardService");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
exports.getAdminDashboard = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const stats = await (0, dashboardService_1.getDashboardStats)();
    (0, response_1.sendSuccess)(res, stats);
});
