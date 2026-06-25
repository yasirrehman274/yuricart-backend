"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicCategories = listPublicCategories;
exports.listAdminCategories = listAdminCategories;
exports.getPublicCategoryBySlug = getPublicCategoryBySlug;
exports.getAdminCategoryById = getAdminCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const Category_1 = require("../models/Category");
const ApiError_1 = require("../utils/ApiError");
const pagination_1 = require("../utils/pagination");
const query_1 = require("../utils/query");
const slug_1 = require("../utils/slug");
function buildCategoryFilter(query, publicOnly = false) {
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
async function listPublicCategories(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = buildCategoryFilter(query, true);
    const sort = (0, query_1.parseSort)(query.sort, { sortOrder: 1, name: 1 });
    const [items, total] = await Promise.all([
        Category_1.Category.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Category_1.Category.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function listAdminCategories(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = buildCategoryFilter(query, false);
    const sort = (0, query_1.parseSort)(query.sort, { sortOrder: 1, createdAt: -1 });
    const [items, total] = await Promise.all([
        Category_1.Category.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Category_1.Category.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function getPublicCategoryBySlug(slug) {
    const category = await Category_1.Category.findOne({ slug, status: "active" }).lean();
    if (!category)
        throw new ApiError_1.NotFoundError("Category not found");
    return category;
}
async function getAdminCategoryById(id) {
    const category = await Category_1.Category.findById(id).lean();
    if (!category)
        throw new ApiError_1.NotFoundError("Category not found");
    return category;
}
async function createCategory(input) {
    const slug = input.slug
        ? await (0, slug_1.ensureUniqueSlug)(Category_1.Category, input.slug)
        : await (0, slug_1.ensureUniqueSlug)(Category_1.Category, input.name);
    return Category_1.Category.create({ ...input, slug });
}
async function updateCategory(id, input) {
    const existing = await Category_1.Category.findById(id);
    if (!existing)
        throw new ApiError_1.NotFoundError("Category not found");
    let slug = input.slug;
    if (input.slug) {
        slug = await (0, slug_1.ensureUniqueSlug)(Category_1.Category, input.slug, id);
    }
    else if (input.name && input.name !== existing.name) {
        slug = await (0, slug_1.ensureUniqueSlug)(Category_1.Category, input.name, id);
    }
    Object.assign(existing, { ...input, ...(slug ? { slug } : {}) });
    await existing.save();
    return existing.toObject();
}
async function deleteCategory(id) {
    const category = await Category_1.Category.findByIdAndDelete(id);
    if (!category)
        throw new ApiError_1.NotFoundError("Category not found");
    return { id };
}
