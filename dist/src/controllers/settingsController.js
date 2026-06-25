"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchAdminSettings = exports.getAdminSettings = void 0;
const settingsService_1 = require("../services/settingsService");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
exports.getAdminSettings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const settings = await (0, settingsService_1.getSettingsByGroup)(req.query.group);
    (0, response_1.sendSuccess)(res, settings);
});
exports.patchAdminSettings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const results = await (0, settingsService_1.upsertSettings)(req.body);
    (0, response_1.sendSuccess)(res, results);
});
