import { Request, Response } from "express";
import {
  createBanner,
  deleteBanner,
  getAdminBannerById,
  getPublicBannerBySlug,
  listAdminBanners,
  listPublicBanners,
  updateBanner,
} from "../services/bannerService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import {
  AdminBannerQuery,
  CreateBannerInput,
  PublicBannerQuery,
  UpdateBannerInput,
} from "../validators/bannerValidator";

export const getPublicBanners = asyncHandler(async (req: Request, res: Response) => {
  const result = await listPublicBanners(req.query as unknown as PublicBannerQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const getPublicBanner = asyncHandler(async (req: Request, res: Response) => {
  const banner = await getPublicBannerBySlug(req.params.slug);
  sendSuccess(res, banner);
});

export const getAdminBanners = asyncHandler(async (req: Request, res: Response) => {
  const result = await listAdminBanners(req.query as unknown as AdminBannerQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const getAdminBanner = asyncHandler(async (req: Request, res: Response) => {
  const banner = await getAdminBannerById(req.params.id);
  sendSuccess(res, banner);
});

export const createAdminBanner = asyncHandler(async (req: Request, res: Response) => {
  const banner = await createBanner(req.body as CreateBannerInput);
  sendSuccess(res, banner, 201);
});

export const updateAdminBanner = asyncHandler(async (req: Request, res: Response) => {
  const banner = await updateBanner(req.params.id, req.body as UpdateBannerInput);
  sendSuccess(res, banner);
});

export const deleteAdminBanner = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteBanner(req.params.id);
  sendSuccess(res, result);
});
