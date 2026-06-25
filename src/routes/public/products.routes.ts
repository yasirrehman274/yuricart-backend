import { Router } from "express";
import {
  getCategoryProducts,
  getPublicProduct,
  getPublicProducts,
  getPublicRelatedProducts,
} from "../../controllers/productController";
import { validateParams, validateQuery } from "../../middleware/validate";
import { slugParamSchema } from "../../validators/common";
import { publicProductQuerySchema } from "../../validators/productValidator";

const router = Router();

router.get("/", validateQuery(publicProductQuerySchema), getPublicProducts);
router.get("/:slug/related", validateParams(slugParamSchema), getPublicRelatedProducts);
router.get("/:slug", validateParams(slugParamSchema), getPublicProduct);

export default router;

export const categoryProductsRouter = Router();
categoryProductsRouter.get(
  "/:slug/products",
  validateParams(slugParamSchema),
  validateQuery(publicProductQuerySchema),
  getCategoryProducts,
);
