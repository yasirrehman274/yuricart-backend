import { Router } from "express";
import {
  createAdminBrand,
  deleteAdminBrand,
  getAdminBrand,
  getAdminBrands,
  updateAdminBrand,
} from "../../controllers/brandController";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate";
import { idParamSchema } from "../../validators/common";
import {
  adminBrandQuerySchema,
  createBrandSchema,
  updateBrandSchema,
} from "../../validators/brandValidator";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", validateQuery(adminBrandQuerySchema), getAdminBrands);
router.get("/:id", validateParams(idParamSchema), getAdminBrand);
router.post("/", validateBody(createBrandSchema), createAdminBrand);
router.patch("/:id", validateParams(idParamSchema), validateBody(updateBrandSchema), updateAdminBrand);
router.delete("/:id", validateParams(idParamSchema), deleteAdminBrand);

export default router;
