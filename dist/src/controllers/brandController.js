"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminBrand = exports.updateAdminBrand = exports.createAdminBrand = exports.getAdminBrand = exports.getAdminBrands = exports.getPublicBrand = exports.getPublicBrands = void 0;
const brandService_1 = require("../services/brandService");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
exports.getPublicBrands = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, brandService_1.listPublicBrands)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getPublicBrand = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const brand = await (0, brandService_1.getPublicBrandBySlug)(req.params.slug);
    (0, response_1.sendSuccess)(res, brand);
});
exports.getAdminBrands = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, brandService_1.listAdminBrands)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getAdminBrand = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const brand = await (0, brandService_1.getAdminBrandById)(req.params.id);
    (0, response_1.sendSuccess)(res, brand);
});
exports.createAdminBrand = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const brand = await (0, brandService_1.createBrand)(req.body);
    (0, response_1.sendSuccess)(res, brand, 201);
});
exports.updateAdminBrand = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const brand = await (0, brandService_1.updateBrand)(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, brand);
});
exports.deleteAdminBrand = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, brandService_1.deleteBrand)(req.params.id);
    (0, response_1.sendSuccess)(res, result);
});
