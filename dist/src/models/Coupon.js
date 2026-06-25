"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coupon = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const couponSchema = new mongoose_1.default.Schema({
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
}, { timestamps: true });
couponSchema.index({ status: 1, code: 1 });
exports.Coupon = mongoose_1.default.model("Coupon", couponSchema);
