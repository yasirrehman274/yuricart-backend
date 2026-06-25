import { Router } from "express";
import { z } from "zod";
import {
  adminLogin,
  adminLogout,
  getAdminMe,
  healthCheck,
} from "../controllers/authController";
import { authenticate, requireAdmin } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import adminBannersRoutes from "./admin/banners.routes";
import adminBrandsRoutes from "./admin/brands.routes";
import adminCategoriesRoutes from "./admin/categories.routes";
import adminCouponsRoutes from "./admin/coupons.routes";
import adminCustomersRoutes from "./admin/customers.routes";
import adminDashboardRoutes from "./admin/dashboard.routes";
import adminOrdersRoutes from "./admin/orders.routes";
import adminProductsRoutes from "./admin/products.routes";
import adminSettingsRoutes from "./admin/settings.routes";
import adminShippingRoutes from "./admin/shipping.routes";
import publicAuthRoutes from "./public/auth.routes";
import publicBannersRoutes from "./public/banners.routes";
import publicBrandsRoutes from "./public/brands.routes";
import publicCategoriesRoutes from "./public/categories.routes";
import publicCouponsRoutes from "./public/coupons.routes";
import publicOrdersRoutes from "./public/orders.routes";
import publicProductsRoutes, {
  categoryProductsRouter,
} from "./public/products.routes";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const router = Router();

router.get("/health", healthCheck);

router.post("/admin/auth/login", validateBody(loginSchema), adminLogin);
router.post("/admin/auth/logout", adminLogout);
router.get("/admin/auth/me", authenticate, requireAdmin, getAdminMe);

router.use("/auth", publicAuthRoutes);
router.use("/orders", publicOrdersRoutes);
router.use("/coupons", publicCouponsRoutes);

router.use("/products", publicProductsRoutes);
router.use("/categories", publicCategoriesRoutes);
router.use("/categories", categoryProductsRouter);
router.use("/brands", publicBrandsRoutes);
router.use("/banners", publicBannersRoutes);

router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/admin/products", adminProductsRoutes);
router.use("/admin/categories", adminCategoriesRoutes);
router.use("/admin/brands", adminBrandsRoutes);
router.use("/admin/banners", adminBannersRoutes);
router.use("/admin/orders", adminOrdersRoutes);
router.use("/admin/coupons", adminCouponsRoutes);
router.use("/admin/settings", adminSettingsRoutes);
router.use("/admin/shipping", adminShippingRoutes);
router.use("/admin/customers", adminCustomersRoutes);

export default router;
