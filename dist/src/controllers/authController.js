"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerMe = exports.customerLogout = exports.customerLogin = exports.customerRegister = exports.getAdminMe = exports.adminLogout = exports.adminLogin = exports.healthCheck = void 0;
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const customerCookieOptions = {
    httpOnly: true,
    secure: env_1.env.NODE_ENV === "production",
    sameSite: env_1.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
const adminCookieOptions = {
    httpOnly: true,
    secure: env_1.env.NODE_ENV === "production",
    sameSite: env_1.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 8 * 60 * 60 * 1000,
};
exports.healthCheck = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    (0, response_1.sendSuccess)(res, {
        status: "ok",
        service: "yuricart-api",
        timestamp: new Date().toISOString(),
    });
});
exports.adminLogin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.User.findByEmail(email);
    if (!user || user.role !== "admin" || user.status !== "active") {
        throw new ApiError_1.UnauthorizedError("Invalid email or password");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError_1.UnauthorizedError("Invalid email or password");
    }
    const token = (0, jwt_1.signAdminToken)({
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    res.cookie("admin_token", token, adminCookieOptions);
    (0, response_1.sendSuccess)(res, {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});
exports.adminLogout = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.clearCookie("admin_token");
    (0, response_1.sendSuccess)(res, { message: "Logged out successfully" });
});
exports.getAdminMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.user.sub).select("-password");
    if (!user || user.role !== "admin") {
        throw new ApiError_1.UnauthorizedError("Admin not found");
    }
    (0, response_1.sendSuccess)(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
    });
});
exports.customerRegister = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password, phone } = req.body;
    const existing = await User_1.User.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new ApiError_1.BadRequestError("Email already registered");
    }
    const user = await User_1.User.create({
        name,
        email,
        password,
        phone,
        role: "customer",
        status: "active",
    });
    const token = (0, jwt_1.signCustomerToken)({
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    res.cookie("customer_token", token, customerCookieOptions);
    (0, response_1.sendSuccess)(res, {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
        },
    }, 201);
});
exports.customerLogin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.User.findByEmail(email);
    if (!user || user.role !== "customer") {
        throw new ApiError_1.UnauthorizedError("Invalid email or password");
    }
    if (user.status === "blocked") {
        throw new ApiError_1.UnauthorizedError("Account is blocked. Contact support.");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError_1.UnauthorizedError("Invalid email or password");
    }
    const token = (0, jwt_1.signCustomerToken)({
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    res.cookie("customer_token", token, customerCookieOptions);
    (0, response_1.sendSuccess)(res, {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
        },
    });
});
exports.customerLogout = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.clearCookie("customer_token");
    (0, response_1.sendSuccess)(res, { message: "Logged out successfully" });
});
exports.getCustomerMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.user.sub).select("-password");
    if (!user || user.role !== "customer") {
        throw new ApiError_1.UnauthorizedError("Customer not found");
    }
    (0, response_1.sendSuccess)(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
    });
});
