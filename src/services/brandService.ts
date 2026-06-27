import { FilterQuery } from "mongoose";
import { Brand, IBrand, ImageData } from "../models/Brand";
import { NotFoundError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/query";
import { ensureUniqueSlug } from "../utils/slug";
import { uploadBuffer, deleteFromCloudinary, BRAND_IMAGE_FOLDER } from "./uploadService";
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

export async function createBrand(
  input: Record<string, unknown>,
  file?: Express.Multer.File,
) {
  const slug = input.slug
    ? await ensureUniqueSlug(Brand, input.slug as string)
    : await ensureUniqueSlug(Brand, input.name as string);

  let image: ImageData = { url: "" };
  if (file) {
    image = await uploadBuffer(file.buffer, BRAND_IMAGE_FOLDER);
  } else if (input.image) {
    image = typeof input.image === "string" ? { url: input.image } : input.image as ImageData;
  } else if (input.logo) {
    image = { url: input.logo as string };
  }

  return Brand.create({ ...input, slug, image });
}

export async function updateBrand(
  id: string,
  input: Record<string, unknown>,
  file?: Express.Multer.File,
) {
  const existing = await Brand.findById(id);
  if (!existing) throw new NotFoundError("Brand not found");

  let slug = input.slug as string | undefined;
  if (input.slug) {
    slug = await ensureUniqueSlug(Brand, input.slug as string, id);
  } else if (input.name && input.name !== existing.name) {
    slug = await ensureUniqueSlug(Brand, input.name as string, id);
  }

  const rawImage = existing.image as ImageData | undefined;
  const currentPublicId = rawImage?.publicId;

  let image: ImageData = rawImage || { url: "" };

  if (file) {
    if (currentPublicId) {
      await deleteFromCloudinary(currentPublicId);
    }
    image = await uploadBuffer(file.buffer, BRAND_IMAGE_FOLDER);
  } else if (input.image === "") {
    if (currentPublicId) {
      await deleteFromCloudinary(currentPublicId);
    }
    image = { url: "" };
  } else if (input.image && typeof input.image === "string") {
    image = { url: input.image as string };
  } else if (input.logo && typeof input.logo === "string") {
    image = { url: input.logo as string };
  }

  const updateData: Record<string, unknown> = {};
  const fields = ["name", "status"];
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

export async function deleteBrand(id: string) {
  const brand = await Brand.findById(id);
  if (!brand) throw new NotFoundError("Brand not found");

  const rawImage = brand.image as ImageData | undefined;
  if (rawImage?.publicId) {
    await deleteFromCloudinary(rawImage.publicId);
  }

  await Brand.findByIdAndDelete(id);
  return { id };
}
