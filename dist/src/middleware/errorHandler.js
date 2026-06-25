"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const ApiError_1 = require("../utils/ApiError");
const response_1 = require("../utils/response");
function notFoundHandler(req, _res, next) {
    next(new ApiError_1.ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}
function errorHandler(err, _req, res, _next) {
    return (0, response_1.handleError)(err, res);
}
