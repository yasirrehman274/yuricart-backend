import { FilterQuery } from "mongoose";
import { Banner, IBanner } from "../models/Banner";
import { NotFoundError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/query";
import { ensureUniqueSlug } from "../utils/slug";
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

export async function createBanner(input: CreateBannerInput) {
  const slug = input.slug
    ? await ensureUniqueSlug(Banner, input.slug)
    : await ensureUniqueSlug(Banner, input.title);

  return Banner.create({ ...input, slug });
}

export async function updateBanner(id: string, input: UpdateBannerInput) {
  const existing = await Banner.findById(id);
  if (!existing) throw new NotFoundError("Banner not found");

  let slug = input.slug;
  if (input.slug) {
    slug = await ensureUniqueSlug(Banner, input.slug, id);
  } else if (input.title && input.title !== existing.title) {
    slug = await ensureUniqueSlug(Banner, input.title, id);
  }

  Object.assign(existing, { ...input, ...(slug ? { slug } : {}) });
  await existing.save();
  return existing.toObject();
}

export async function deleteBanner(id: string) {
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) throw new NotFoundError("Banner not found");
  return { id };
}
