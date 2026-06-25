"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const password_1 = require("../utils/password");
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true },
    role: {
        type: String,
        enum: ["admin", "customer"],
        default: "customer",
    },
    status: {
        type: String,
        enum: ["active", "blocked"],
        default: "active",
    },
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await (0, password_1.hashPassword)(this.password);
    next();
});
userSchema.methods.comparePassword = function (candidate) {
    return (0, password_1.comparePassword)(candidate, this.password);
};
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() }).select("+password");
};
exports.User = mongoose_1.default.model("User", userSchema);
