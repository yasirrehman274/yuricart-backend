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
  PublicBannerQuery,
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

const NUMERIC_FIELDS = new Set(["sortOrder"]);

function normalizeFormBody(body: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (NUMERIC_FIELDS.has(key)) {
      if (value === "" || value === undefined || value === null) {
        result[key] = undefined;
      } else {
        const num = Number(value);
        result[key] = isNaN(num) ? value : num;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

export const createAdminBanner = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const body = normalizeFormBody(req.body as Record<string, unknown>);
  const banner = await createBanner(body, file);
  sendSuccess(res, banner, 201);
});

export const updateAdminBanner = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const body = normalizeFormBody(req.body as Record<string, unknown>);
  const banner = await updateBanner(req.params.id, body, file);
  sendSuccess(res, banner);
});

export const deleteAdminBanner = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteBanner(req.params.id);
  sendSuccess(res, result);
});
