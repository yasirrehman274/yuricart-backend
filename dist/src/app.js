"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.set("trust proxy", 1);
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.FRONTEND_URL,
        credentials: true,
    }));
    app.use((0, morgan_1.default)(env_1.env.NODE_ENV === "development" ? "dev" : "combined"));
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, express_mongo_sanitize_1.default)());
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: env_1.env.NODE_ENV === "production" ? 300 : 1000,
        standardHeaders: true,
        legacyHeaders: false,
    }));
    app.use("/api/v1", routes_1.default);
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
