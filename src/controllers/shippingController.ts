import { Request, Response } from "express";
import {
  createShipping,
  deleteShipping,
  getShippingById,
  listAdminShipping,
  updateShipping,
} from "../services/shippingService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import {
  AdminShippingQuery,
  CreateShippingInput,
  UpdateShippingInput,
} from "../validators/shippingValidator";

export const getAdminShippingRules = asyncHandler(async (req: Request, res: Response) => {
  const result = await listAdminShipping(req.query as unknown as AdminShippingQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const getAdminShippingRule = asyncHandler(async (req: Request, res: Response) => {
  const rule = await getShippingById(req.params.id);
  sendSuccess(res, rule);
});

export const createAdminShippingRule = asyncHandler(async (req: Request, res: Response) => {
  const rule = await createShipping(req.body as CreateShippingInput);
  sendSuccess(res, rule, 201);
});

export const updateAdminShippingRule = asyncHandler(async (req: Request, res: Response) => {
  const rule = await updateShipping(req.params.id, req.body as UpdateShippingInput);
  sendSuccess(res, rule);
});

export const deleteAdminShippingRule = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteShipping(req.params.id);
  sendSuccess(res, result);
});
