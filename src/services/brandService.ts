import { FilterQuery } from "mongoose";
import { Brand, IBrand } from "../models/Brand";
import { NotFoundError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/query";
import { ensureUniqueSlug } from "../utils/slug";
import {
  AdminBrandQuery,
  CreateBrandInput,
  PublicBrandQuery,
  UpdateBrandInput,
} from "../validators/brandValidator";

function buildBrandFilter(
  query: PublicBrandQuery | AdminBrandQuery,
  publicOnly = false,
): FilterQuery<IBrand> {
  const filter: FilterQuery<IBrand> = {};

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

export async function listPublicBrands(query: PublicBrandQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter = buildBrandFilter(query, true);
  const sort = parseSort(query.sort, { name: 1 });

  const [items, total] = await Promise.all([
    Brand.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Brand.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function listAdminBrands(query: AdminBrandQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter = buildBrandFilter(query, false);
  const sort = parseSort(query.sort, { name: 1, createdAt: -1 });

  const [items, total] = await Promise.all([
    Brand.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Brand.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function getPublicBrandBySlug(slug: string) {
  const brand = await Brand.findOne({ slug, status: "active" }).lean();
  if (!brand) throw new NotFoundError("Brand not found");
  return brand;
}

export async function getAdminBrandById(id: string) {
  const brand = await Brand.findById(id).lean();
  if (!brand) throw new NotFoundError("Brand not found");
  return brand;
}

export async function createBrand(input: CreateBrandInput) {
  const slug = input.slug
    ? await ensureUniqueSlug(Brand, input.slug)
    : await ensureUniqueSlug(Brand, input.name);

  return Brand.create({ ...input, slug });
}

export async function updateBrand(id: string, input: UpdateBrandInput) {
  const existing = await Brand.findById(id);
  if (!existing) throw new NotFoundError("Brand not found");

  let slug = input.slug;
  if (input.slug) {
    slug = await ensureUniqueSlug(Brand, input.slug, id);
  } else if (input.name && input.name !== existing.name) {
    slug = await ensureUniqueSlug(Brand, input.name, id);
  }

  Object.assign(existing, { ...input, ...(slug ? { slug } : {}) });
  await existing.save();
  return existing.toObject();
}

export async function deleteBrand(id: string) {
  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) throw new NotFoundError("Brand not found");
  return { id };
}
