import { Router } from "express";
import {
  createAdminBanner,
  deleteAdminBanner,
  getAdminBanner,
  getAdminBanners,
  updateAdminBanner,
} from "../../controllers/bannerController";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate";
import { idParamSchema } from "../../validators/common";
import {
  adminBannerQuerySchema,
  createBannerSchema,
  updateBannerSchema,
} from "../../validators/bannerValidator";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", validateQuery(adminBannerQuerySchema), getAdminBanners);
router.get("/:id", validateParams(idParamSchema), getAdminBanner);
router.post("/", validateBody(createBannerSchema), createAdminBanner);
router.patch("/:id", validateParams(idParamSchema), validateBody(updateBannerSchema), updateAdminBanner);
router.delete("/:id", validateParams(idParamSchema), deleteAdminBanner);

export default router;
