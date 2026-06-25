import { Router } from "express";
import { getPublicBrand, getPublicBrands } from "../../controllers/brandController";
import { validateParams, validateQuery } from "../../middleware/validate";
import { slugParamSchema } from "../../validators/common";
import { publicBrandQuerySchema } from "../../validators/brandValidator";

const router = Router();

router.get("/", validateQuery(publicBrandQuerySchema), getPublicBrands);
router.get("/:slug", validateParams(slugParamSchema), getPublicBrand);

export default router;
