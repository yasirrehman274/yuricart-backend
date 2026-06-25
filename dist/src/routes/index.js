"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const banners_routes_1 = __importDefault(require("./admin/banners.routes"));
const brands_routes_1 = __importDefault(require("./admin/brands.routes"));
const categories_routes_1 = __importDefault(require("./admin/categories.routes"));
const coupons_routes_1 = __importDefault(require("./admin/coupons.routes"));
const customers_routes_1 = __importDefault(require("./admin/customers.routes"));
const dashboard_routes_1 = __importDefault(require("./admin/dashboard.routes"));
const orders_routes_1 = __importDefault(require("./admin/orders.routes"));
const products_routes_1 = __importDefault(require("./admin/products.routes"));
const settings_routes_1 = __importDefault(require("./admin/settings.routes"));
const shipping_routes_1 = __importDefault(require("./admin/shipping.routes"));
const auth_routes_1 = __importDefault(require("./public/auth.routes"));
const banners_routes_2 = __importDefault(require("./public/banners.routes"));
const brands_routes_2 = __importDefault(require("./public/brands.routes"));
const categories_routes_2 = __importDefault(require("./public/categories.routes"));
const coupons_routes_2 = __importDefault(require("./public/coupons.routes"));
const orders_routes_2 = __importDefault(require("./public/orders.routes"));
const products_routes_2 = __importStar(require("./public/products.routes"));
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const router = (0, express_1.Router)();
router.get("/health", authController_1.healthCheck);
router.post("/admin/auth/login", (0, validate_1.validateBody)(loginSchema), authController_1.adminLogin);
router.post("/admin/auth/logout", authController_1.adminLogout);
router.get("/admin/auth/me", auth_1.authenticate, auth_1.requireAdmin, authController_1.getAdminMe);
router.use("/auth", auth_routes_1.default);
router.use("/orders", orders_routes_2.default);
router.use("/coupons", coupons_routes_2.default);
router.use("/products", products_routes_2.default);
router.use("/categories", categories_routes_2.default);
router.use("/categories", products_routes_2.categoryProductsRouter);
router.use("/brands", brands_routes_2.default);
router.use("/banners", banners_routes_2.default);
router.use("/admin/dashboard", dashboard_routes_1.default);
router.use("/admin/products", products_routes_1.default);
router.use("/admin/categories", categories_routes_1.default);
router.use("/admin/brands", brands_routes_1.default);
router.use("/admin/banners", banners_routes_1.default);
router.use("/admin/orders", orders_routes_1.default);
router.use("/admin/coupons", coupons_routes_1.default);
router.use("/admin/settings", settings_routes_1.default);
router.use("/admin/shipping", shipping_routes_1.default);
router.use("/admin/customers", customers_routes_1.default);
exports.default = router;
