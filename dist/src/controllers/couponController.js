"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminCoupon = exports.updateAdminCoupon = exports.createAdminCoupon = exports.getAdminCoupon = exports.getAdminCoupons = exports.validatePublicCoupon = void 0;
const couponService_1 = require("../services/couponService");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
exports.validatePublicCoupon = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, couponService_1.validateCoupon)(req.body);
    (0, response_1.sendSuccess)(res, {
        valid: true,
        code: result.couponCode,
        discountType: result.coupon.discountType,
        discountValue: result.coupon.discountValue,
        discount: result.discount,
        couponId: result.couponId,
    });
});
exports.getAdminCoupons = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, couponService_1.listAdminCoupons)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getAdminCoupon = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const coupon = await (0, couponService_1.getCouponById)(req.params.id);
    (0, response_1.sendSuccess)(res, coupon);
});
exports.createAdminCoupon = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const coupon = await (0, couponService_1.createCoupon)(req.body);
    (0, response_1.sendSuccess)(res, coupon, 201);
});
exports.updateAdminCoupon = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const coupon = await (0, couponService_1.updateCoupon)(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, coupon);
});
exports.deleteAdminCoupon = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, couponService_1.deleteCoupon)(req.params.id);
    (0, response_1.sendSuccess)(res, result);
});
