import { Request, Response } from "express";
import { env } from "../config/env";
import { User } from "../models/User";
import { BadRequestError, UnauthorizedError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { signAdminToken, signCustomerToken } from "../utils/jwt";
import { sendSuccess } from "../utils/response";
import {
  CustomerLoginInput,
  CustomerRegisterInput,
} from "../validators/authValidator";

const customerCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const adminCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  maxAge: 8 * 60 * 60 * 1000,
};

export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, {
    status: "ok",
    service: "yuricart-api",
    timestamp: new Date().toISOString(),
  });
});

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findByEmail(email);

  if (!user || user.role !== "admin" || user.status !== "active") {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = signAdminToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  res.cookie("admin_token", token, adminCookieOptions);

  sendSuccess(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const adminLogout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("admin_token");
  sendSuccess(res, { message: "Logged out successfully" });
});

export const getAdminMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.sub).select("-password");

  if (!user || user.role !== "admin") {
    throw new UnauthorizedError("Admin not found");
  }

  sendSuccess(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  });
});

export const customerRegister = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body as CustomerRegisterInput;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new BadRequestError("Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: "customer",
    status: "active",
  });

  const token = signCustomerToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  res.cookie("customer_token", token, customerCookieOptions);

  sendSuccess(
    res,
    {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    },
    201,
  );
});

export const customerLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as CustomerLoginInput;

  const user = await User.findByEmail(email);

  if (!user || user.role !== "customer") {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (user.status === "blocked") {
    throw new UnauthorizedError("Account is blocked. Contact support.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = signCustomerToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  res.cookie("customer_token", token, customerCookieOptions);

  sendSuccess(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
  });
});

export const customerLogout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("customer_token");
  sendSuccess(res, { message: "Logged out successfully" });
});

export const getCustomerMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.sub).select("-password");

  if (!user || user.role !== "customer") {
    throw new UnauthorizedError("Customer not found");
  }

  sendSuccess(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    status: user.status,
  });
});
