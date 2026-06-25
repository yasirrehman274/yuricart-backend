"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: zod_1.z.coerce.number().default(5000),
    MONGODB_URI: zod_1.z.string().min(1, "MONGODB_URI is required"),
    JWT_SECRET: zod_1.z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    JWT_EXPIRES_IN: zod_1.z.string().default("7d"),
    ADMIN_JWT_EXPIRES_IN: zod_1.z.string().default("8h"),
    FRONTEND_URL: zod_1.z
        .string()
        .default("http://localhost:3000")
        .transform((value) => value.split(",").map((url) => url.trim()))
        .pipe(zod_1.z.array(zod_1.z.string().url()).min(1)),
    ADMIN_EMAIL: zod_1.z.string().email().optional(),
    ADMIN_PASSWORD: zod_1.z.string().min(8).optional(),
    ADMIN_NAME: zod_1.z.string().optional(),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: zod_1.z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
