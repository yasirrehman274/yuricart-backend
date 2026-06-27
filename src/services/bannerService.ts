import { FilterQuery } from "mongoose";
import { Banner, IBanner, ImageData } from "../models/Banner";
import { NotFoundError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/query";
import { ensureUniqueSlug } from "../utils/slug";
import { uploadBuffer, deleteFromCloudinary, BANNER_IMAGE_FOLDER } from "./uploadService";
import {
  AdminBannerQuery,
  CreateBannerInput,
  PublicBannerQuery,
  UpdateBannerInput,
} from "../validators/bannerValidator";

function buildBannerFilter(
  query: PublicBannerQuery | AdminBannerQuery,
  publicOnly = false,
): FilterQuery<IBanner> {
  const filter: FilterQuery<IBanner> = {};

  if (publicOnly) {
    filter.status = "active";
  } else if ("status" in query && query.status) {
    filter.status = query.status;
  }

  if (query.placement) {
    filter.placement = query.placement;
  }

  if ("q" in query && query.q) {
    filter.$or = [
      { title: { $regex: query.q, $options: "i" } },
      { subtitle: { $regex: query.q, $options: "i" } },
    ];
  }

  return filter;
}

export async function listPublicBanners(query: PublicBannerQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter = buildBannerFilter(query, true);
  const sort = parseSort(query.sort, { sortOrder: 1, createdAt: -1 });

  const [items, total] = await Promise.all([
    Banner.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Banner.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function listAdminBanners(query: AdminBannerQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter = buildBannerFilter(query, false);
  const sort = parseSort(query.sort, { sortOrder: 1, createdAt: -1 });

  const [items, total] = await Promise.all([
    Banner.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Banner.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function getPublicBannerBySlug(slug: string) {
  const banner = await Banner.findOne({ slug, status: "active" }).lean();
  if (!banner) throw new NotFoundError("Banner not found");
  return banner;
}

export async function getAdminBannerById(id: string) {
  const banner = await Banner.findById(id).lean();
  if (!banner) throw new NotFoundError("Banner not found");
  return banner;
}

export async function createBanner(
  input: Record<string, unknown>,
  file?: Express.Multer.File,
) {
  const slug = input.slug
    ? await ensureUniqueSlug(Banner, input.slug as string)
    : await ensureUniqueSlug(Banner, input.title as string);

  let image: ImageData = { url: "" };
  if (file) {
    image = await uploadBuffer(file.buffer, BANNER_IMAGE_FOLDER);
  } else if (input.image) {
    image = typeof input.image === "string" ? { url: input.image as string } : input.image as ImageData;
  }

  return Banner.create({ ...input, slug, image });
}

export async function updateBanner(
  id: string,
  input: Record<string, unknown>,
  file?: Express.Multer.File,
) {
  const existing = await Banner.findById(id);
  if (!existing) throw new NotFoundError("Banner not found");

  let slug = input.slug as string | undefined;
  if (input.slug) {
    slug = await ensureUniqueSlug(Banner, input.slug as string, id);
  } else if (input.title && input.title !== existing.title) {
    slug = await ensureUniqueSlug(Banner, input.title as string, id);
  }

  const rawImage = existing.image as ImageData | undefined;
  const currentPublicId = rawImage?.publicId;

  let image: ImageData = rawImage || { url: "" };

  if (file) {
    if (currentPublicId) {
      await deleteFromCloudinary(currentPublicId);
    }
    image = await uploadBuffer(file.buffer, BANNER_IMAGE_FOLDER);
  } else if (input.image === "") {
    if (currentPublicId) {
      await deleteFromCloudinary(currentPublicId);
    }
    image = { url: "" };
  } else if (input.image && typeof input.image === "string") {
    image = { url: input.image as string };
  }

  const updateData: Record<string, unknown> = {};
  const fields = ["title", "subtitle", "link", "status", "sortOrder", "placement"];
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

export async function deleteBanner(id: string) {
  const banner = await Banner.findById(id);
  if (!banner) throw new NotFoundError("Banner not found");

  const rawImage = banner.image as ImageData | undefined;
  if (rawImage?.publicId) {
    await deleteFromCloudinary(rawImage.publicId);
  }

  await Banner.findByIdAndDelete(id);
  return { id };
}
