"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const ApiError_1 = require("../utils/ApiError");
function validate(schema, source) {
    return (req, _res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            return next(new ApiError_1.BadRequestError("Validation failed", result.error.flatten().fieldErrors));
        }
        if (source === "body") {
            req.body = result.data;
        }
        else if (source === "query") {
            req.query = result.data;
        }
        else {
            req.params = result.data;
        }
        next();
    };
}
function validateBody(schema) {
    return validate(schema, "body");
}
function validateQuery(schema) {
    return validate(schema, "query");
}
function validateParams(schema) {
    return validate(schema, "params");
}
