import { Router } from "express";
import {
  getAdminCustomers,
  patchAdminCustomer,
} from "../../controllers/customerController";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate";
import { idParamSchema } from "../../validators/common";
import {
  adminCustomerQuerySchema,
  updateCustomerStatusSchema,
} from "../../validators/authValidator";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", validateQuery(adminCustomerQuerySchema), getAdminCustomers);
router.patch(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateCustomerStatusSchema),
  patchAdminCustomer,
);

export default router;
