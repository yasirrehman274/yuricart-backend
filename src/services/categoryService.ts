import { FilterQuery } from "mongoose";
import { Category, ICategory, ImageData } from "../models/Category";
import { NotFoundError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/query";
import { ensureUniqueSlug } from "../utils/slug";
import { uploadBuffer, deleteFromCloudinary, CATEGORY_IMAGE_FOLDER } from "./uploadService";
import {
  AdminCategoryQuery,
  CreateCategoryInput,
  PublicCategoryQuery,
  UpdateCategoryInput,
} from "../validators/categoryValidator";

function buildCategoryFilter(
  query: PublicCategoryQuery | AdminCategoryQuery,
  publicOnly = false,
): FilterQuery<ICategory> {
  const filter: FilterQuery<ICategory> = {};

  if (publicOnly) {
    filter.status = "active";
  } else if ("status" in query && query.status) {
    filter.status = query.status;
  }

  if (query.q) {
    filter.$text = { $search: query.q };
  }

  return filter;
}

export async function listPublicCategories(query: PublicCategoryQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter = buildCategoryFilter(query, true);
  const sort = parseSort(query.sort, { sortOrder: 1, name: 1 });

  const [items, total] = await Promise.all([
    Category.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Category.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function listAdminCategories(query: AdminCategoryQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter = buildCategoryFilter(query, false);
  const sort = parseSort(query.sort, { sortOrder: 1, createdAt: -1 });

  const [items, total] = await Promise.all([
    Category.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Category.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function getPublicCategoryBySlug(slug: string) {
  const category = await Category.findOne({ slug, status: "active" }).lean();
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export async function getAdminCategoryById(id: string) {
  const category = await Category.findById(id).lean();
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export async function createCategory(
  input: Record<string, unknown>,
  file?: Express.Multer.File,
) {
  const slug = input.slug
    ? await ensureUniqueSlug(Category, input.slug as string)
    : await ensureUniqueSlug(Category, input.name as string);

  let image: ImageData = { url: "" };
  if (file) {
    image = await uploadBuffer(file.buffer, CATEGORY_IMAGE_FOLDER);
  } else if (input.image) {
    image = typeof input.image === "string" ? { url: input.image as string } : input.image as ImageData;
  }

  return Category.create({ ...input, slug, image });
}

export async function updateCategory(
  id: string,
  input: Record<string, unknown>,
  file?: Express.Multer.File,
) {
  const existing = await Category.findById(id);
  if (!existing) throw new NotFoundError("Category not found");

  let slug = input.slug as string | undefined;
  if (input.slug) {
    slug = await ensureUniqueSlug(Category, input.slug as string, id);
  } else if (input.name && input.name !== existing.name) {
    slug = await ensureUniqueSlug(Category, input.name as string, id);
  }

  const rawImage = existing.image as ImageData | undefined;
  const currentPublicId = rawImage?.publicId;

  let image: ImageData = rawImage || { url: "" };

  if (file) {
    if (currentPublicId) {
      await deleteFromCloudinary(currentPublicId);
    }
    image = await uploadBuffer(file.buffer, CATEGORY_IMAGE_FOLDER);
  } else if (input.image === "") {
    if (currentPublicId) {
      await deleteFromCloudinary(currentPublicId);
    }
    image = { url: "" };
  } else if (input.image && typeof input.image === "string") {
    image = { url: input.image as string };
  }

  const updateData: Record<string, unknown> = {};
  const fields = ["name", "description", "status", "sortOrder"];
  for (const field of fields) {
    if (field in input) {
      updateData[field] = input[field];
    }
  }

  Object.assign(existing, {
    ...updateData,
    ...(slug ? { slug } : {}),
    image,
  });
  await existing.save();
  return existing.toObject();
}

export async function deleteCategory(id: string) {
  const category = await Category.findById(id);
  if (!category) throw new NotFoundError("Category not found");

  const rawImage = category.image as ImageData | undefined;
  if (rawImage?.publicId) {
    await deleteFromCloudinary(rawImage.publicId);
  }

  await Category.findByIdAndDelete(id);
  return { id };
}
