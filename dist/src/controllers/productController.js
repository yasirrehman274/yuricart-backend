"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminProduct = exports.updateAdminProduct = exports.createAdminProduct = exports.getAdminProduct = exports.getAdminProducts = exports.getCategoryProducts = exports.getPublicRelatedProducts = exports.getPublicProduct = exports.getPublicProducts = void 0;
const productService_1 = require("../services/productService");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
const ARRAY_FIELDS = new Set(["tags", "colors", "sizes", "variants"]);
const BOOLEAN_FIELDS = new Set(["featured", "newArrival", "bestSeller"]);
const NUMERIC_FIELDS = new Set(["price", "salePrice", "stock"]);
function normalizeFormBody(body) {
    const result = {};
    for (const [key, value] of Object.entries(body)) {
        if (key === "keepGallery" || key === "removedGalleryIds")
            continue;
        if (ARRAY_FIELDS.has(key)) {
            result[key] = Array.isArray(value) ? value : value ? [value] : [];
        }
        else if (BOOLEAN_FIELDS.has(key)) {
            result[key] = value === "true" || value === true || value === "1";
        }
        else if (NUMERIC_FIELDS.has(key)) {
            if (value === "" || value === undefined || value === null) {
                result[key] = undefined;
            }
            else {
                const num = Number(value);
                result[key] = isNaN(num) ? value : num;
            }
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
exports.getPublicProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, productService_1.listPublicProducts)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getPublicProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await (0, productService_1.getPublicProductBySlug)(req.params.slug);
    (0, response_1.sendSuccess)(res, product);
});
exports.getPublicRelatedProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const items = await (0, productService_1.getRelatedProducts)(req.params.slug);
    (0, response_1.sendSuccess)(res, items);
});
exports.getCategoryProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, productService_1.listProductsByCategorySlug)(req.params.slug, req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getAdminProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, productService_1.listAdminProducts)(req.query);
    (0, response_1.sendSuccess)(res, result.items, 200, result.meta);
});
exports.getAdminProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await (0, productService_1.getAdminProductById)(req.params.id);
    (0, response_1.sendSuccess)(res, product);
});
exports.createAdminProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const files = req.files;
    const body = normalizeFormBody(req.body);
    const product = await (0, productService_1.createProduct)(body, files);
    (0, response_1.sendSuccess)(res, product, 201);
});
exports.updateAdminProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const files = req.files;
    const body = normalizeFormBody(req.body);
    let removedGalleryIds = [];
    const rawRemoved = req.body.removedGalleryIds;
    if (typeof rawRemoved === "string") {
        try {
            removedGalleryIds = JSON.parse(rawRemoved);
        }
        catch {
            removedGalleryIds = rawRemoved.split(",").map((s) => s.trim()).filter(Boolean);
        }
    }
    const product = await (0, productService_1.updateProduct)(req.params.id, body, files, removedGalleryIds);
    (0, response_1.sendSuccess)(res, product);
});
exports.deleteAdminProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, productService_1.deleteProduct)(req.params.id);
    (0, response_1.sendSuccess)(res, result);
});
