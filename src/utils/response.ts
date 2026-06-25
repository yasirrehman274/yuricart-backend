import { Response } from "express";
import { ApiError } from "../utils/ApiError";
import { PaginationMeta } from "../utils/pagination";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: Record<string, unknown> | PaginationMeta;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown> | PaginationMeta,
) {
  const body: ApiSuccessResponse<T> = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown,
) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}

export function handleError(err: unknown, res: Response) {
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  console.error(err);
  return sendError(res, 500, "Internal server error");
}
