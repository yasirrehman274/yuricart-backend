"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    errors;
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = "ApiError";
    }
}
exports.ApiError = ApiError;
class NotFoundError extends ApiError {
    constructor(message = "Resource not found") {
        super(404, message);
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends ApiError {
    constructor(message = "Unauthorized") {
        super(401, message);
        this.name = "UnauthorizedError";
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ApiError {
    constructor(message = "Forbidden") {
        super(403, message);
        this.name = "ForbiddenError";
    }
}
exports.ForbiddenError = ForbiddenError;
class BadRequestError extends ApiError {
    constructor(message = "Bad request", errors) {
        super(400, message, errors);
        this.name = "BadRequestError";
    }
}
exports.BadRequestError = BadRequestError;
