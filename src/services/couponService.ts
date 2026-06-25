import { FilterQuery } from "mongoose";
import { Coupon, ICoupon } from "../models/Coupon";
import { BadRequestError, NotFoundError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import {
  AdminCouponQuery,
  CreateCouponInput,
  UpdateCouponInput,
  ValidateCouponInput,
} from "../validators/couponValidator";

export interface CouponValidationResult {
  coupon: ICoupon;
  discount: number;
  couponId: string;
  couponCode: string;
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function assertCouponUsable(coupon: ICoupon, subtotal: number) {
  if (coupon.status !== "active") {
    throw new BadRequestError("Coupon is not active");
  }

  if (coupon.expiryDate && coupon.expiryDate < new Date()) {
    throw new BadRequestError("Coupon has expired");
  }

  if (coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
    throw new BadRequestError("Coupon usage limit reached");
  }

  if (subtotal < coupon.minOrderAmount) {
    throw new BadRequestError(
      `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`,
    );
  }
}

export function calculateDiscount(coupon: ICoupon, subtotal: number): number {
  if (coupon.discountType === "percentage") {
    return Math.min(subtotal, (subtotal * coupon.discountValue) / 100);
  }
  return Math.min(subtotal, coupon.discountValue);
}

export async function validateCoupon(
  input: ValidateCouponInput,
): Promise<CouponValidationResult> {
  const code = normalizeCode(input.code);
  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    throw new NotFoundError("Coupon not found");
  }

  assertCouponUsable(coupon, input.subtotal);

  const discount = calculateDiscount(coupon, input.subtotal);

  return {
    coupon: coupon.toObject() as ICoupon,
    discount,
    couponId: coupon._id.toString(),
    couponCode: coupon.code,
  };
}

export async function listAdminCoupons(query: AdminCouponQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter: FilterQuery<ICoupon> = {};

  if (query.status) filter.status = query.status;
  if (query.q) {
    filter.code = { $regex: query.q, $options: "i" };
  }

  const [items, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function getCouponById(id: string) {
  const coupon = await Coupon.findById(id).lean();
  if (!coupon) throw new NotFoundError("Coupon not found");
  return coupon;
}

export async function createCoupon(input: CreateCouponInput) {
  const code = normalizeCode(input.code);
  const existing = await Coupon.findOne({ code });
  if (existing) {
    throw new BadRequestError("Coupon code already exists");
  }

  return Coupon.create({ ...input, code });
}

export async function updateCoupon(id: string, input: UpdateCouponInput) {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new NotFoundError("Coupon not found");

  if (input.code) {
    const code = normalizeCode(input.code);
    const existing = await Coupon.findOne({ code, _id: { $ne: id } });
    if (existing) {
      throw new BadRequestError("Coupon code already exists");
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

export async function deleteCoupon(id: string) {
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw new NotFoundError("Coupon not found");
  return { id };
}

export async function incrementCouponUsage(couponId: string) {
  await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
}
