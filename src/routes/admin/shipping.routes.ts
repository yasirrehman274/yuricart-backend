import { Router } from "express";
import {
  createAdminShippingRule,
  deleteAdminShippingRule,
  getAdminShippingRule,
  getAdminShippingRules,
  updateAdminShippingRule,
} from "../../controllers/shippingController";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate";
import { idParamSchema } from "../../validators/common";
import {
  adminShippingQuerySchema,
  createShippingSchema,
  updateShippingSchema,
} from "../../validators/shippingValidator";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", validateQuery(adminShippingQuerySchema), getAdminShippingRules);
router.get("/:id", validateParams(idParamSchema), getAdminShippingRule);
router.post("/", validateBody(createShippingSchema), createAdminShippingRule);
router.patch(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateShippingSchema),
  updateAdminShippingRule,
);
router.delete("/:id", validateParams(idParamSchema), deleteAdminShippingRule);

export default router;
