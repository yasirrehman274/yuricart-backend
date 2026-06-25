import mongoose, { Document } from "mongoose";

export type CouponDiscountType = "percentage" | "fixed";
export type CouponStatus = "active" | "inactive";

export interface ICoupon extends Document {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxUses?: number;
  usedCount: number;
  expiryDate?: Date;
  status: CouponStatus;
}

const couponSchema = new mongoose.Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

couponSchema.index({ status: 1, code: 1 });

export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
