import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "./ApiError";

export type UserRole = "admin" | "customer";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export function signToken(
  payload: JwtPayload,
  expiresIn: SignOptions["expiresIn"] = env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function signAdminToken(payload: JwtPayload): string {
  return signToken(payload, env.ADMIN_JWT_EXPIRES_IN as SignOptions["expiresIn"]);
}

export function signCustomerToken(payload: JwtPayload): string {
  return signToken(payload, env.JWT_EXPIRES_IN as SignOptions["expiresIn"]);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
