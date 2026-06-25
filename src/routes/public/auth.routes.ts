import { Router } from "express";
import {
  customerLogin,
  customerLogout,
  customerRegister,
  getCustomerMe,
} from "../../controllers/authController";
import { authenticate, requireCustomer } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import {
  customerLoginSchema,
  customerRegisterSchema,
} from "../../validators/authValidator";

const router = Router();

router.post("/register", validateBody(customerRegisterSchema), customerRegister);
router.post("/login", validateBody(customerLoginSchema), customerLogin);
router.post("/logout", customerLogout);
router.get("/me", authenticate, requireCustomer, getCustomerMe);

export default router;
