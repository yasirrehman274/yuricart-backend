import { Request, Response } from "express";
import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  listAdminCoupons,
  updateCoupon,
  validateCoupon,
} from "../services/couponService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import {
  AdminCouponQuery,
  CreateCouponInput,
  UpdateCouponInput,
  ValidateCouponInput,
} from "../validators/couponValidator";

export const validatePublicCoupon = asyncHandler(async (req: Request, res: Response) => {
  const result = await validateCoupon(req.body as ValidateCouponInput);
  sendSuccess(res, {
    valid: true,
    code: result.couponCode,
    discountType: result.coupon.discountType,
    discountValue: result.coupon.discountValue,
    discount: result.discount,
    couponId: result.couponId,
  });
});

export const getAdminCoupons = asyncHandler(async (req: Request, res: Response) => {
  const result = await listAdminCoupons(req.query as unknown as AdminCouponQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const getAdminCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await getCouponById(req.params.id);
  sendSuccess(res, coupon);
});

export const createAdminCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await createCoupon(req.body as CreateCouponInput);
  sendSuccess(res, coupon, 201);
});

export const updateAdminCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await updateCoupon(req.params.id, req.body as UpdateCouponInput);
  sendSuccess(res, coupon);
});

export const deleteAdminCoupon = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteCoupon(req.params.id);
  sendSuccess(res, result);
});
