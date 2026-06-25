import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/ApiError";
import { JwtPayload, verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieToken = req.cookies?.admin_token || req.cookies?.customer_token;
  return cookieToken || null;
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = extractToken(req);
  if (!token) {
    return next(new UnauthorizedError("Authentication required"));
  }

  req.user = verifyToken(token);
  next();
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }

  if (req.user.role !== "admin") {
    return next(new ForbiddenError("Admin access required"));
  }

  next();
}

export function requireCustomer(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }

  if (req.user.role !== "customer") {
    return next(new ForbiddenError("Customer access required"));
  }

  next();
}

export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    req.user = verifyToken(token);
  } catch {
    // Ignore invalid tokens for optional auth routes
  }

  next();
}
