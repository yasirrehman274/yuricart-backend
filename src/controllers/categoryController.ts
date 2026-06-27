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
  PublicCategoryQuery,
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

export const createAdminCategory = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const body = normalizeFormBody(req.body as Record<string, unknown>);
  const category = await createCategory(body, file);
  sendSuccess(res, category, 201);
});

export const updateAdminCategory = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const body = normalizeFormBody(req.body as Record<string, unknown>);
  const category = await updateCategory(req.params.id, body, file);
  sendSuccess(res, category);
});

export const deleteAdminCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteCategory(req.params.id);
  sendSuccess(res, result);
});
