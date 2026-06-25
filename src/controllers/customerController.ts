import { Request, Response } from "express";
import { listCustomers, updateCustomerStatus } from "../services/customerService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import {
  AdminCustomerQuery,
  UpdateCustomerStatusInput,
} from "../validators/authValidator";

export const getAdminCustomers = asyncHandler(async (req: Request, res: Response) => {
  const result = await listCustomers(req.query as unknown as AdminCustomerQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const patchAdminCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await updateCustomerStatus(
    req.params.id,
    req.body as UpdateCustomerStatusInput,
  );
  sendSuccess(res, customer);
});
