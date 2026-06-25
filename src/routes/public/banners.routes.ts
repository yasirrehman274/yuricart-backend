import { Router } from "express";
import { getPublicBanner, getPublicBanners } from "../../controllers/bannerController";
import { validateParams, validateQuery } from "../../middleware/validate";
import { slugParamSchema } from "../../validators/common";
import { publicBannerQuerySchema } from "../../validators/bannerValidator";

const router = Router();

router.get("/", validateQuery(publicBannerQuerySchema), getPublicBanners);
router.get("/:slug", validateParams(slugParamSchema), getPublicBanner);

export default router;
