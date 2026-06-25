"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicBrands = listPublicBrands;
exports.listAdminBrands = listAdminBrands;
exports.getPublicBrandBySlug = getPublicBrandBySlug;
exports.getAdminBrandById = getAdminBrandById;
exports.createBrand = createBrand;
exports.updateBrand = updateBrand;
exports.deleteBrand = deleteBrand;
const Brand_1 = require("../models/Brand");
const ApiError_1 = require("../utils/ApiError");
const pagination_1 = require("../utils/pagination");
const query_1 = require("../utils/query");
const slug_1 = require("../utils/slug");
function buildBrandFilter(query, publicOnly = false) {
    const filter = {};
    if (publicOnly) {
        filter.status = "active";
    }
    else if ("status" in query && query.status) {
        filter.status = query.status;
    }
    if (query.q) {
        filter.$text = { $search: query.q };
    }
    return filter;
}
async function listPublicBrands(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = buildBrandFilter(query, true);
    const sort = (0, query_1.parseSort)(query.sort, { name: 1 });
    const [items, total] = await Promise.all([
        Brand_1.Brand.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Brand_1.Brand.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function listAdminBrands(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = buildBrandFilter(query, false);
    const sort = (0, query_1.parseSort)(query.sort, { name: 1, createdAt: -1 });
    const [items, total] = await Promise.all([
        Brand_1.Brand.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Brand_1.Brand.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function getPublicBrandBySlug(slug) {
    const brand = await Brand_1.Brand.findOne({ slug, status: "active" }).lean();
    if (!brand)
        throw new ApiError_1.NotFoundError("Brand not found");
    return brand;
}
async function getAdminBrandById(id) {
    const brand = await Brand_1.Brand.findById(id).lean();
    if (!brand)
        throw new ApiError_1.NotFoundError("Brand not found");
    return brand;
}
async function createBrand(input) {
    const slug = input.slug
        ? await (0, slug_1.ensureUniqueSlug)(Brand_1.Brand, input.slug)
        : await (0, slug_1.ensureUniqueSlug)(Brand_1.Brand, input.name);
    return Brand_1.Brand.create({ ...input, slug });
}
async function updateBrand(id, input) {
    const existing = await Brand_1.Brand.findById(id);
    if (!existing)
        throw new ApiError_1.NotFoundError("Brand not found");
    let slug = input.slug;
    if (input.slug) {
        slug = await (0, slug_1.ensureUniqueSlug)(Brand_1.Brand, input.slug, id);
    }
    else if (input.name && input.name !== existing.name) {
        slug = await (0, slug_1.ensureUniqueSlug)(Brand_1.Brand, input.name, id);
    }
    Object.assign(existing, { ...input, ...(slug ? { slug } : {}) });
    await existing.save();
    return existing.toObject();
}
async function deleteBrand(id) {
    const brand = await Brand_1.Brand.findByIdAndDelete(id);
    if (!brand)
        throw new ApiError_1.NotFoundError("Brand not found");
    return { id };
}
