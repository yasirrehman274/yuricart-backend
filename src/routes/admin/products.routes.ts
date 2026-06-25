import { Router } from "express";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from "../../controllers/productController";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validateParams, validateQuery } from "../../middleware/validate";
import { uploadProductImages, handleUploadError } from "../../middleware/upload";
import { idParamSchema } from "../../validators/common";
import { adminProductQuerySchema } from "../../validators/productValidator";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", validateQuery(adminProductQuerySchema), getAdminProducts);
router.get("/:id", validateParams(idParamSchema), getAdminProduct);
router.post(
  "/",
  uploadProductImages,
  handleUploadError,
  createAdminProduct,
);
router.patch(
  "/:id",
  validateParams(idParamSchema),
  uploadProductImages,
  handleUploadError,
  updateAdminProduct,
);
router.delete("/:id", validateParams(idParamSchema), deleteAdminProduct);

export default router;
