"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const categorySchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, trim: true },
    description: { type: String, trim: true },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });
categorySchema.index({ name: "text", description: "text" });
categorySchema.index({ status: 1, sortOrder: 1 });
exports.Category = mongoose_1.default.model("Category", categorySchema);
