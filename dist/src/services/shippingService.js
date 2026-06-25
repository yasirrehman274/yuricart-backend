"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateShippingCost = calculateShippingCost;
exports.listAdminShipping = listAdminShipping;
exports.getShippingById = getShippingById;
exports.createShipping = createShipping;
exports.updateShipping = updateShipping;
exports.deleteShipping = deleteShipping;
const Shipping_1 = require("../models/Shipping");
const ApiError_1 = require("../utils/ApiError");
const pagination_1 = require("../utils/pagination");
async function calculateShippingCost(subtotal, region) {
    const rules = await Shipping_1.Shipping.find({ status: "active" }).sort({ rate: 1 }).lean();
    if (!rules.length)
        return 0;
    let matched;
    if (region) {
        const normalizedRegion = region.trim().toLowerCase();
        matched = rules.find((rule) => rule.regions.some((r) => r.trim().toLowerCase() === normalizedRegion));
    }
    if (!matched) {
        matched = rules.find((rule) => !rule.regions.length) || rules[0];
    }
    if (matched.freeAbove !== undefined && subtotal >= matched.freeAbove) {
        return 0;
    }
    return matched.rate;
}
async function listAdminShipping(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = {};
    if (query.status)
        filter.status = query.status;
    const [items, total] = await Promise.all([
        Shipping_1.Shipping.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
        Shipping_1.Shipping.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function getShippingById(id) {
    const rule = await Shipping_1.Shipping.findById(id).lean();
    if (!rule)
        throw new ApiError_1.NotFoundError("Shipping rule not found");
    return rule;
}
async function createShipping(input) {
    return Shipping_1.Shipping.create(input);
}
async function updateShipping(id, input) {
    const rule = await Shipping_1.Shipping.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
    }).lean();
    if (!rule)
        throw new ApiError_1.NotFoundError("Shipping rule not found");
    return rule;
}
async function deleteShipping(id) {
    const rule = await Shipping_1.Shipping.findByIdAndDelete(id);
    if (!rule)
        throw new ApiError_1.NotFoundError("Shipping rule not found");
    return { id };
}
