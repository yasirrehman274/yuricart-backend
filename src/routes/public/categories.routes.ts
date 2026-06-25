import { Router } from "express";
import {
  getPublicCategories,
  getPublicCategory,
} from "../../controllers/categoryController";
import { validateParams, validateQuery } from "../../middleware/validate";
import { slugParamSchema } from "../../validators/common";
import { publicCategoryQuerySchema } from "../../validators/categoryValidator";

const router = Router();

router.get("/", validateQuery(publicCategoryQuerySchema), getPublicCategories);
router.get("/:slug", validateParams(slugParamSchema), getPublicCategory);

export default router;
