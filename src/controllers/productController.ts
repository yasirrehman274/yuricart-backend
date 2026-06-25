import { Request, Response } from "express";
import { UploadFiles } from "../middleware/upload";
import {
  createProduct,
  deleteProduct,
  getAdminProductById,
  getPublicProductBySlug,
  getRelatedProducts,
  listAdminProducts,
  listProductsByCategorySlug,
  listPublicProducts,
  updateProduct,
} from "../services/productService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import {
  AdminProductQuery,
  PublicProductQuery,
} from "../validators/productValidator";

const ARRAY_FIELDS = new Set(["tags", "colors", "sizes", "variants"]);
const BOOLEAN_FIELDS = new Set(["featured", "newArrival", "bestSeller"]);
const NUMERIC_FIELDS = new Set(["price", "salePrice", "stock"]);

function normalizeFormBody(body: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === "keepGallery" || key === "removedGalleryIds") continue;
    if (ARRAY_FIELDS.has(key)) {
      result[key] = Array.isArray(value) ? value : value ? [value] : [];
    } else if (BOOLEAN_FIELDS.has(key)) {
      result[key] = value === "true" || value === true || value === "1";
    } else if (NUMERIC_FIELDS.has(key)) {
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

export const getPublicProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await listPublicProducts(req.query as unknown as PublicProductQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const getPublicProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await getPublicProductBySlug(req.params.slug);
  sendSuccess(res, product);
});

export const getPublicRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const items = await getRelatedProducts(req.params.slug);
  sendSuccess(res, items);
});

export const getCategoryProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await listProductsByCategorySlug(
    req.params.slug,
    req.query as unknown as PublicProductQuery,
  );
  sendSuccess(res, result.items, 200, result.meta);
});

export const getAdminProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await listAdminProducts(req.query as unknown as AdminProductQuery);
  sendSuccess(res, result.items, 200, result.meta);
});

export const getAdminProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await getAdminProductById(req.params.id);
  sendSuccess(res, product);
});

export const createAdminProduct = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as UploadFiles | undefined;
  const body = normalizeFormBody(req.body as Record<string, unknown>);
  const product = await createProduct(body, files);
  sendSuccess(res, product, 201);
});

export const updateAdminProduct = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as UploadFiles | undefined;
  const body = normalizeFormBody(req.body as Record<string, unknown>);

  let removedGalleryIds: string[] = [];
  const rawRemoved = req.body.removedGalleryIds;
  if (typeof rawRemoved === "string") {
    try {
      removedGalleryIds = JSON.parse(rawRemoved);
    } catch {
      removedGalleryIds = rawRemoved.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
  }

  const product = await updateProduct(
    req.params.id,
    body,
    files,
    removedGalleryIds,
  );
  sendSuccess(res, product);
});

export const deleteAdminProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteProduct(req.params.id);
  sendSuccess(res, result);
});
