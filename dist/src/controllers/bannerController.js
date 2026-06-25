"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminBanner = exports.updateAdminBanner = exports.createAdminBanner = exports.getAdminBanner = exports.getAdminBanners = exports.getPublicBanner = exports.getPublicBanners = void 0;
const bannerService_1 = require("../services/bannerService");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
exports.getPublicBanners = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, bannerService_1.listPublicBanners)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getPublicBanner = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const banner = await (0, bannerService_1.getPublicBannerBySlug)(req.params.slug);
    (0, response_1.sendSuccess)(res, banner);
});
exports.getAdminBanners = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, bannerService_1.listAdminBanners)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getAdminBanner = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const banner = await (0, bannerService_1.getAdminBannerById)(req.params.id);
    (0, response_1.sendSuccess)(res, banner);
});
exports.createAdminBanner = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const banner = await (0, bannerService_1.createBanner)(req.body);
    (0, response_1.sendSuccess)(res, banner, 201);
});
exports.updateAdminBanner = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const banner = await (0, bannerService_1.updateBanner)(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, banner);
});
exports.deleteAdminBanner = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, bannerService_1.deleteBanner)(req.params.id);
    (0, response_1.sendSuccess)(res, result);
});
