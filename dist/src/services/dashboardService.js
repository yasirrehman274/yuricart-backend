"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
async function getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalOrders, totalRevenueResult, monthlyOrders, monthlyRevenueResult, totalProducts, activeProducts, totalCustomers, activeCustomers, pendingOrders, recentOrders,] = await Promise.all([
        Order_1.Order.countDocuments(),
        Order_1.Order.aggregate([
            { $match: { paymentStatus: { $in: ["paid", "pending"] }, orderStatus: { $ne: "cancelled" } } },
            { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order_1.Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Order_1.Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                    paymentStatus: { $in: ["paid", "pending"] },
                    orderStatus: { $ne: "cancelled" },
                },
            },
            { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Product_1.Product.countDocuments(),
        Product_1.Product.countDocuments({ status: "active" }),
        User_1.User.countDocuments({ role: "customer" }),
        User_1.User.countDocuments({ role: "customer", status: "active" }),
        Order_1.Order.countDocuments({ orderStatus: "pending" }),
        Order_1.Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("orderNumber customerName total orderStatus paymentStatus createdAt")
            .lean(),
    ]);
    return {
        orders: {
            total: totalOrders,
            monthly: monthlyOrders,
            pending: pendingOrders,
        },
        revenue: {
            total: totalRevenueResult[0]?.total ?? 0,
            monthly: monthlyRevenueResult[0]?.total ?? 0,
        },
        products: {
            total: totalProducts,
            active: activeProducts,
        },
        customers: {
            total: totalCustomers,
            active: activeCustomers,
        },
        recentOrders,
    };
}
