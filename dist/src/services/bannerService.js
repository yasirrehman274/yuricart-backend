"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicBanners = listPublicBanners;
exports.listAdminBanners = listAdminBanners;
exports.getPublicBannerBySlug = getPublicBannerBySlug;
exports.getAdminBannerById = getAdminBannerById;
exports.createBanner = createBanner;
exports.updateBanner = updateBanner;
exports.deleteBanner = deleteBanner;
const Banner_1 = require("../models/Banner");
const ApiError_1 = require("../utils/ApiError");
const pagination_1 = require("../utils/pagination");
const query_1 = require("../utils/query");
const slug_1 = require("../utils/slug");
function buildBannerFilter(query, publicOnly = false) {
    const filter = {};
    if (publicOnly) {
        filter.status = "active";
    }
    else if ("status" in query && query.status) {
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
async function listPublicBanners(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = buildBannerFilter(query, true);
    const sort = (0, query_1.parseSort)(query.sort, { sortOrder: 1, createdAt: -1 });
    const [items, total] = await Promise.all([
        Banner_1.Banner.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Banner_1.Banner.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function listAdminBanners(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = buildBannerFilter(query, false);
    const sort = (0, query_1.parseSort)(query.sort, { sortOrder: 1, createdAt: -1 });
    const [items, total] = await Promise.all([
        Banner_1.Banner.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Banner_1.Banner.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function getPublicBannerBySlug(slug) {
    const banner = await Banner_1.Banner.findOne({ slug, status: "active" }).lean();
    if (!banner)
        throw new ApiError_1.NotFoundError("Banner not found");
    return banner;
}
async function getAdminBannerById(id) {
    const banner = await Banner_1.Banner.findById(id).lean();
    if (!banner)
        throw new ApiError_1.NotFoundError("Banner not found");
    return banner;
}
async function createBanner(input) {
    const slug = input.slug
        ? await (0, slug_1.ensureUniqueSlug)(Banner_1.Banner, input.slug)
        : await (0, slug_1.ensureUniqueSlug)(Banner_1.Banner, input.title);
    return Banner_1.Banner.create({ ...input, slug });
}
async function updateBanner(id, input) {
    const existing = await Banner_1.Banner.findById(id);
    if (!existing)
        throw new ApiError_1.NotFoundError("Banner not found");
    let slug = input.slug;
    if (input.slug) {
        slug = await (0, slug_1.ensureUniqueSlug)(Banner_1.Banner, input.slug, id);
    }
    else if (input.title && input.title !== existing.title) {
        slug = await (0, slug_1.ensureUniqueSlug)(Banner_1.Banner, input.title, id);
    }
    Object.assign(existing, { ...input, ...(slug ? { slug } : {}) });
    await existing.save();
    return existing.toObject();
}
async function deleteBanner(id) {
    const banner = await Banner_1.Banner.findByIdAndDelete(id);
    if (!banner)
        throw new ApiError_1.NotFoundError("Banner not found");
    return { id };
}
