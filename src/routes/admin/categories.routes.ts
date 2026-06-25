import { Router } from "express";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  getAdminCategory,
  updateAdminCategory,
} from "../../controllers/categoryController";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate";
import { idParamSchema } from "../../validators/common";
import {
  adminCategoryQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/categoryValidator";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", validateQuery(adminCategoryQuerySchema), getAdminCategories);
router.get("/:id", validateParams(idParamSchema), getAdminCategory);
router.post("/", validateBody(createCategorySchema), createAdminCategory);
router.patch("/:id", validateParams(idParamSchema), validateBody(updateCategorySchema), updateAdminCategory);
router.delete("/:id", validateParams(idParamSchema), deleteAdminCategory);

export default router;
