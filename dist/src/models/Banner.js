"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bannerSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    sortOrder: { type: Number, default: 0 },
    placement: {
        type: String,
        enum: ["hero", "promo"],
        default: "hero",
    },
}, { timestamps: true });
bannerSchema.index({ status: 1, placement: 1, sortOrder: 1 });
exports.Banner = mongoose_1.default.model("Banner", bannerSchema);
