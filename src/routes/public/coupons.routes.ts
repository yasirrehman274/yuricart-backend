import { Router } from "express";
import { validatePublicCoupon } from "../../controllers/couponController";
import { validateBody } from "../../middleware/validate";
import { validateCouponSchema } from "../../validators/couponValidator";

const router = Router();

router.post("/validate", validateBody(validateCouponSchema), validatePublicCoupon);

export default router;
