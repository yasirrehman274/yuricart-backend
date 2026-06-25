import { Request, Response } from "express";
import {
  createOrder,
  getAdminOrderById,
  getUserOrders,
  listAdminOrders,
  trackOrder,
  updateOrderStatus,
} from "../services/orderService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import {
  AdminOrderQuery,
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "../validators/orderValidator";

export const createPublicOrder = asyncHandler(async (req: Request, res: Response) => {
  const customerId =
    req.user?.role === "customer" ? req.user.sub : undefined;

  const order = await createOrder(req.body as CreateOrderInput, customerId);
  sendSuccess(res, order, 201);
});

export const trackPublicOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await trackOrder(
    req.params.orderNumber,
    req.query.email as string,
  );
  sendSuccess(res, order);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await getUserOrders(req.user!.sub, req.query as { page?: number; limit?: number });
  sendSuccess(res, result.items, 200, result.meta);
});

export const getAdminOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await listAdminOrders(req.query as unknown as AdminOrderQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const getAdminOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await getAdminOrderById(req.params.id);
  sendSuccess(res, order);
});

export const patchAdminOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await updateOrderStatus(
    req.params.id,
    req.body as UpdateOrderStatusInput,
  );
  sendSuccess(res, order);
});
