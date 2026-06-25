import { Router } from "express";
import {
  getAdminOrder,
  getAdminOrders,
  patchAdminOrder,
} from "../../controllers/orderController";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate";
import { idParamSchema } from "../../validators/common";
import {
  adminOrderQuerySchema,
  updateOrderStatusSchema,
} from "../../validators/orderValidator";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", validateQuery(adminOrderQuerySchema), getAdminOrders);
router.get("/:id", validateParams(idParamSchema), getAdminOrder);
router.patch(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateOrderStatusSchema),
  patchAdminOrder,
);

export default router;
