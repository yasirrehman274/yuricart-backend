"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminCategory = exports.updateAdminCategory = exports.createAdminCategory = exports.getAdminCategory = exports.getAdminCategories = exports.getPublicCategory = exports.getPublicCategories = void 0;
const categoryService_1 = require("../services/categoryService");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
exports.getPublicCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, categoryService_1.listPublicCategories)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getPublicCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = await (0, categoryService_1.getPublicCategoryBySlug)(req.params.slug);
    (0, response_1.sendSuccess)(res, category);
});
exports.getAdminCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, categoryService_1.listAdminCategories)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getAdminCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = await (0, categoryService_1.getAdminCategoryById)(req.params.id);
    (0, response_1.sendSuccess)(res, category);
});
exports.createAdminCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = await (0, categoryService_1.createCategory)(req.body);
    (0, response_1.sendSuccess)(res, category, 201);
});
exports.updateAdminCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = await (0, categoryService_1.updateCategory)(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, category);
});
exports.deleteAdminCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, categoryService_1.deleteCategory)(req.params.id);
    (0, response_1.sendSuccess)(res, result);
});
