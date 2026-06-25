import { Router } from "express";
import { getAdminDashboard } from "../../controllers/dashboardController";
import { authenticate, requireAdmin } from "../../middleware/auth";

const router = Router();

router.use(authenticate, requireAdmin);
router.get("/", getAdminDashboard);

export default router;
