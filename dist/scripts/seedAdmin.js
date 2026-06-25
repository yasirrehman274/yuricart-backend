"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../src/config/db");
const env_1 = require("../src/config/env");
const User_1 = require("../src/models/User");
dotenv_1.default.config();
async function seedAdmin() {
    if (!env_1.env.ADMIN_EMAIL || !env_1.env.ADMIN_PASSWORD) {
        console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before running seed:admin");
        process.exit(1);
    }
    await (0, db_1.connectDatabase)();
    const existing = await User_1.User.findOne({ email: env_1.env.ADMIN_EMAIL.toLowerCase() });
    if (existing) {
        console.log(`Admin already exists: ${existing.email}`);
        await (0, db_1.disconnectDatabase)();
        process.exit(0);
    }
    await User_1.User.create({
        name: env_1.env.ADMIN_NAME || "Admin",
        email: env_1.env.ADMIN_EMAIL,
        password: env_1.env.ADMIN_PASSWORD,
        role: "admin",
        status: "active",
    });
    console.log(`Admin user created: ${env_1.env.ADMIN_EMAIL}`);
    await (0, db_1.disconnectDatabase)();
    process.exit(0);
}
seedAdmin().catch(async (error) => {
    console.error("Seed failed:", error);
    await (0, db_1.disconnectDatabase)();
    process.exit(1);
});
