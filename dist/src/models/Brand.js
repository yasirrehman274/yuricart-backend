"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Brand = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const brandSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String, trim: true },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, { timestamps: true });
brandSchema.index({ name: "text" });
brandSchema.index({ status: 1, name: 1 });
exports.Brand = mongoose_1.default.model("Brand", brandSchema);
