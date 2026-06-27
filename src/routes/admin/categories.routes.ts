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
import { uploadSingleImage, handleUploadError } from "../../middleware/upload";
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
router.post("/", uploadSingleImage, handleUploadError, validateBody(createCategorySchema), createAdminCategory);
router.patch("/:id", validateParams(idParamSchema), uploadSingleImage, handleUploadError, validateBody(updateCategorySchema), updateAdminCategory);
router.delete("/:id", validateParams(idParamSchema), deleteAdminCategory);

export default router;
