import { Router } from "express";
import {
  getAdminSettings,
  patchAdminSettings,
} from "../../controllers/settingsController";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../middleware/validate";
import {
  settingsQuerySchema,
  upsertSettingsSchema,
} from "../../validators/settingsValidator";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", validateQuery(settingsQuerySchema), getAdminSettings);
router.patch("/", validateBody(upsertSettingsSchema), patchAdminSettings);

export default router;
