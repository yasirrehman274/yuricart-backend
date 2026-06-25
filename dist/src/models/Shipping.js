"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shipping = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const shippingSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, min: 0 },
    freeAbove: { type: Number, min: 0 },
    regions: { type: [String], default: [] },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, { timestamps: true });
shippingSchema.index({ status: 1, name: 1 });
exports.Shipping = mongoose_1.default.model("Shipping", shippingSchema);
