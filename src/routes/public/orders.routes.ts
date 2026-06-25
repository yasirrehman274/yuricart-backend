import { Router } from "express";
import {
  createPublicOrder,
  getMyOrders,
  trackPublicOrder,
} from "../../controllers/orderController";
import {
  authenticate,
  optionalAuthenticate,
  requireCustomer,
} from "../../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate";
import { paginationQuerySchema } from "../../validators/common";
import {
  createOrderSchema,
  orderNumberParamSchema,
  trackOrderQuerySchema,
} from "../../validators/orderValidator";

const router = Router();

router.post("/", optionalAuthenticate, validateBody(createOrderSchema), createPublicOrder);
router.get(
  "/track/:orderNumber",
  validateParams(orderNumberParamSchema),
  validateQuery(trackOrderQuerySchema),
  trackPublicOrder,
);
router.get(
  "/my",
  authenticate,
  requireCustomer,
  validateQuery(paginationQuerySchema),
  getMyOrders,
);

export default router;
