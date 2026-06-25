import { Request, Response } from "express";
import {
  createCategory,
  deleteCategory,
  getAdminCategoryById,
  getPublicCategoryBySlug,
  listAdminCategories,
  listPublicCategories,
  updateCategory,
} from "../services/categoryService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import {
  AdminCategoryQuery,
  CreateCategoryInput,
  PublicCategoryQuery,
  UpdateCategoryInput,
} from "../validators/categoryValidator";

export const getPublicCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await listPublicCategories(req.query as unknown as PublicCategoryQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const getPublicCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await getPublicCategoryBySlug(req.params.slug);
  sendSuccess(res, category);
});

export const getAdminCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await listAdminCategories(req.query as unknown as AdminCategoryQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const getAdminCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await getAdminCategoryById(req.params.id);
  sendSuccess(res, category);
});

export const createAdminCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await createCategory(req.body as CreateCategoryInput);
  sendSuccess(res, category, 201);
});

export const updateAdminCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await updateCategory(req.params.id, req.body as UpdateCategoryInput);
  sendSuccess(res, category);
});

export const deleteAdminCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteCategory(req.params.id);
  sendSuccess(res, result);
});
