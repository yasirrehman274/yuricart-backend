import { Request, Response } from "express";
import {
  createBrand,
  deleteBrand,
  getAdminBrandById,
  getPublicBrandBySlug,
  listAdminBrands,
  listPublicBrands,
  updateBrand,
} from "../services/brandService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import {
  AdminBrandQuery,
  CreateBrandInput,
  PublicBrandQuery,
  UpdateBrandInput,
} from "../validators/brandValidator";

export const getPublicBrands = asyncHandler(async (req: Request, res: Response) => {
  const result = await listPublicBrands(req.query as unknown as PublicBrandQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const getPublicBrand = asyncHandler(async (req: Request, res: Response) => {
  const brand = await getPublicBrandBySlug(req.params.slug);
  sendSuccess(res, brand);
});

export const getAdminBrands = asyncHandler(async (req: Request, res: Response) => {
  const result = await listAdminBrands(req.query as unknown as AdminBrandQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const getAdminBrand = asyncHandler(async (req: Request, res: Response) => {
  const brand = await getAdminBrandById(req.params.id);
  sendSuccess(res, brand);
});

export const createAdminBrand = asyncHandler(async (req: Request, res: Response) => {
  const brand = await createBrand(req.body as CreateBrandInput);
  sendSuccess(res, brand, 201);
});

export const updateAdminBrand = asyncHandler(async (req: Request, res: Response) => {
  const brand = await updateBrand(req.params.id, req.body as UpdateBrandInput);
  sendSuccess(res, brand);
});

export const deleteAdminBrand = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteBrand(req.params.id);
  sendSuccess(res, result);
});
