"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireAdmin = requireAdmin;
exports.requireCustomer = requireCustomer;
exports.optionalAuthenticate = optionalAuthenticate;
const ApiError_1 = require("../utils/ApiError");
const jwt_1 = require("../utils/jwt");
function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }
    const cookieToken = req.cookies?.admin_token || req.cookies?.customer_token;
    return cookieToken || null;
}
function authenticate(req, _res, next) {
    const token = extractToken(req);
    if (!token) {
        return next(new ApiError_1.UnauthorizedError("Authentication required"));
    }
    req.user = (0, jwt_1.verifyToken)(token);
    next();
}
function requireAdmin(req, _res, next) {
    if (!req.user) {
        return next(new ApiError_1.UnauthorizedError("Authentication required"));
    }
    if (req.user.role !== "admin") {
        return next(new ApiError_1.ForbiddenError("Admin access required"));
    }
    next();
}
function requireCustomer(req, _res, next) {
    if (!req.user) {
        return next(new ApiError_1.UnauthorizedError("Authentication required"));
    }
    if (req.user.role !== "customer") {
        return next(new ApiError_1.ForbiddenError("Customer access required"));
    }
    next();
}
function optionalAuthenticate(req, _res, next) {
    const token = extractToken(req);
    if (!token)
        return next();
    try {
        req.user = (0, jwt_1.verifyToken)(token);
    }
    catch {
        // Ignore invalid tokens for optional auth routes
    }
    next();
}
