import { Request, Response } from "express";
import { getDashboardStats } from "../services/dashboardService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const getAdminDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getDashboardStats();
  sendSuccess(res, stats);
});
