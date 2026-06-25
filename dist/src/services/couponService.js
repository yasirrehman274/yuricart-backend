"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDiscount = calculateDiscount;
exports.validateCoupon = validateCoupon;
exports.listAdminCoupons = listAdminCoupons;
exports.getCouponById = getCouponById;
exports.createCoupon = createCoupon;
exports.updateCoupon = updateCoupon;
exports.deleteCoupon = deleteCoupon;
exports.incrementCouponUsage = incrementCouponUsage;
const Coupon_1 = require("../models/Coupon");
const ApiError_1 = require("../utils/ApiError");
const pagination_1 = require("../utils/pagination");
function normalizeCode(code) {
    return code.trim().toUpperCase();
}
function assertCouponUsable(coupon, subtotal) {
    if (coupon.status !== "active") {
        throw new ApiError_1.BadRequestError("Coupon is not active");
    }
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        throw new ApiError_1.BadRequestError("Coupon has expired");
    }
    if (coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
        throw new ApiError_1.BadRequestError("Coupon usage limit reached");
    }
    if (subtotal < coupon.minOrderAmount) {
        throw new ApiError_1.BadRequestError(`Minimum order amount of ${coupon.minOrderAmount} required for this coupon`);
    }
}
function calculateDiscount(coupon, subtotal) {
    if (coupon.discountType === "percentage") {
        return Math.min(subtotal, (subtotal * coupon.discountValue) / 100);
    }
    return Math.min(subtotal, coupon.discountValue);
}
async function validateCoupon(input) {
    const code = normalizeCode(input.code);
    const coupon = await Coupon_1.Coupon.findOne({ code });
    if (!coupon) {
        throw new ApiError_1.NotFoundError("Coupon not found");
    }
    assertCouponUsable(coupon, input.subtotal);
    const discount = calculateDiscount(coupon, input.subtotal);
    return {
        coupon: coupon.toObject(),
        discount,
        couponId: coupon._id.toString(),
        couponCode: coupon.code,
    };
}
async function listAdminCoupons(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = {};
    if (query.status)
        filter.status = query.status;
    if (query.q) {
        filter.code = { $regex: query.q, $options: "i" };
    }
    const [items, total] = await Promise.all([
        Coupon_1.Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Coupon_1.Coupon.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function getCouponById(id) {
    const coupon = await Coupon_1.Coupon.findById(id).lean();
    if (!coupon)
        throw new ApiError_1.NotFoundError("Coupon not found");
    return coupon;
}
async function createCoupon(input) {
    const code = normalizeCode(input.code);
    const existing = await Coupon_1.Coupon.findOne({ code });
    if (existing) {
        throw new ApiError_1.BadRequestError("Coupon code already exists");
    }
    return Coupon_1.Coupon.create({ ...input, code });
}
async function updateCoupon(id, input) {
    const coupon = await Coupon_1.Coupon.findById(id);
    if (!coupon)
        throw new ApiError_1.NotFoundError("Coupon not found");
    if (input.code) {
        const code = normalizeCode(input.code);
        const existing = await Coupon_1.Coupon.findOne({ code, _id: { $ne: id } });
        if (existing) {
            throw new ApiError_1.BadRequestError("Coupon code already exists");
        }
        coupon.code = code;
    }
    Object.assign(coupon, {
        ...input,
        ...(input.code ? { code: normalizeCode(input.code) } : {}),
    });
    await coupon.save();
    return coupon.toObject();
}
async function deleteCoupon(id) {
    const coupon = await Coupon_1.Coupon.findByIdAndDelete(id);
    if (!coupon)
        throw new ApiError_1.NotFoundError("Coupon not found");
    return { id };
}
async function incrementCouponUsage(couponId) {
    await Coupon_1.Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
}
