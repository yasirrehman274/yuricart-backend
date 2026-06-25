import { Router } from "express";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupon,
  getAdminCoupons,
  updateAdminCoupon,
} from "../../controllers/couponController";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate";
import { idParamSchema } from "../../validators/common";
import {
  adminCouponQuerySchema,
  createCouponSchema,
  updateCouponSchema,
} from "../../validators/couponValidator";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", validateQuery(adminCouponQuerySchema), getAdminCoupons);
router.get("/:id", validateParams(idParamSchema), getAdminCoupon);
router.post("/", validateBody(createCouponSchema), createAdminCoupon);
router.patch(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateCouponSchema),
  updateAdminCoupon,
);
router.delete("/:id", validateParams(idParamSchema), deleteAdminCoupon);

export default router;
