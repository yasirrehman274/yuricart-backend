import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { handleError } from "../utils/response";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  return handleError(err, res);
}
