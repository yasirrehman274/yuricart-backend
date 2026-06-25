"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.signAdminToken = signAdminToken;
exports.signCustomerToken = signCustomerToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const ApiError_1 = require("./ApiError");
function signToken(payload, expiresIn = env_1.env.JWT_EXPIRES_IN) {
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, options);
}
function signAdminToken(payload) {
    return signToken(payload, env_1.env.ADMIN_JWT_EXPIRES_IN);
}
function signCustomerToken(payload) {
    return signToken(payload, env_1.env.JWT_EXPIRES_IN);
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    catch {
        throw new ApiError_1.UnauthorizedError("Invalid or expired token");
    }
}
