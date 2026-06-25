import { FilterQuery } from "mongoose";
import { Category, ICategory } from "../models/Category";
import { NotFoundError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/query";
import { ensureUniqueSlug } from "../utils/slug";
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

export async function createCategory(input: CreateCategoryInput) {
  const slug = input.slug
    ? await ensureUniqueSlug(Category, input.slug)
    : await ensureUniqueSlug(Category, input.name);

  return Category.create({ ...input, slug });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const existing = await Category.findById(id);
  if (!existing) throw new NotFoundError("Category not found");

  let slug = input.slug;
  if (input.slug) {
    slug = await ensureUniqueSlug(Category, input.slug, id);
  } else if (input.name && input.name !== existing.name) {
    slug = await ensureUniqueSlug(Category, input.name, id);
  }

  Object.assign(existing, { ...input, ...(slug ? { slug } : {}) });
  await existing.save();
  return existing.toObject();
}

export async function deleteCategory(id: string) {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new NotFoundError("Category not found");
  return { id };
}
