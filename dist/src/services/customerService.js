"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCustomers = listCustomers;
exports.updateCustomerStatus = updateCustomerStatus;
const User_1 = require("../models/User");
const ApiError_1 = require("../utils/ApiError");
const pagination_1 = require("../utils/pagination");
async function listCustomers(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = { role: "customer" };
    if (query.status)
        filter.status = query.status;
    if (query.q) {
        filter.$or = [
            { name: { $regex: query.q, $options: "i" } },
            { email: { $regex: query.q, $options: "i" } },
            { phone: { $regex: query.q, $options: "i" } },
        ];
    }
    const [items, total] = await Promise.all([
        User_1.User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User_1.User.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function updateCustomerStatus(id, input) {
    const customer = await User_1.User.findOne({ _id: id, role: "customer" });
    if (!customer)
        throw new ApiError_1.NotFoundError("Customer not found");
    if (customer.role === "admin") {
        throw new ApiError_1.BadRequestError("Cannot modify admin users via customer endpoint");
    }
    customer.status = input.status;
    await customer.save();
    const { password: _password, ...safe } = customer.toObject();
    return safe;
}
