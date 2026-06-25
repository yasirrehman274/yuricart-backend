"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Import Wix product export JSON into MongoDB.
 *
 * Usage:
 *   1. Export products from Wix (CSV/JSON) or use Wix API dump
 *   2. Save as backend/data/wix-export.json
 *   3. Run: npm run import:wix
 *
 * Expected JSON shape (array):
 * [{
 *   "name": "Product Title",
 *   "slug": "product-slug",
 *   "description": "...",
 *   "price": 25000,
 *   "salePrice": 22000,
 *   "sku": "SKU-001",
 *   "stock": 10,
 *   "collectionSlug": "phones",
 *   "brandName": "Samsung",
 *   "imageUrl": "https://static.wixstatic.com/...",
 *   "featured": true,
 *   "legacyWixId": "optional-wix-id"
 * }]
 */
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../src/config/db");
const Brand_1 = require("../src/models/Brand");
const Category_1 = require("../src/models/Category");
const Product_1 = require("../src/models/Product");
const slug_1 = require("../src/utils/slug");
dotenv_1.default.config();
async function upsertCategory(slug, name) {
    const existing = await Category_1.Category.findOne({ slug });
    if (existing)
        return existing;
    return Category_1.Category.create({
        name,
        slug: await (0, slug_1.ensureUniqueSlug)(Category_1.Category, slug),
        status: "active",
    });
}
async function upsertBrand(name) {
    const slug = (0, slug_1.generateSlug)(name);
    const existing = await Brand_1.Brand.findOne({ slug });
    if (existing)
        return existing;
    return Brand_1.Brand.create({
        name,
        slug: await (0, slug_1.ensureUniqueSlug)(Brand_1.Brand, name),
        status: "active",
    });
}
async function main() {
    const filePath = path_1.default.join(__dirname, "../data/wix-export.json");
    if (!fs_1.default.existsSync(filePath)) {
        console.error(`Missing export file: ${filePath}`);
        console.error("Copy backend/data/wix-export.example.json to wix-export.json and edit.");
        process.exit(1);
    }
    await (0, db_1.connectDatabase)();
    const raw = fs_1.default.readFileSync(filePath, "utf-8");
    const items = JSON.parse(raw);
    let created = 0;
    let skipped = 0;
    for (const item of items) {
        const slug = item.slug || (0, slug_1.generateSlug)(item.name);
        const exists = await Product_1.Product.findOne({ slug });
        if (exists) {
            skipped += 1;
            continue;
        }
        let categoryId;
        if (item.collectionSlug) {
            const cat = await upsertCategory(item.collectionSlug, item.collectionSlug.replace(/-/g, " ").toUpperCase());
            categoryId = cat._id;
        }
        let brandId;
        if (item.brandName) {
            const brand = await upsertBrand(item.brandName);
            brandId = brand._id;
        }
        await Product_1.Product.create({
            title: item.name,
            slug: await (0, slug_1.ensureUniqueSlug)(Product_1.Product, slug),
            description: item.description,
            shortDescription: item.shortDescription,
            price: item.price,
            salePrice: item.salePrice,
            sku: item.sku,
            stock: item.stock ?? 0,
            category: categoryId,
            brand: brandId,
            images: item.imageUrl
                ? [{ url: item.imageUrl, isPrimary: true, alt: item.name }]
                : [],
            status: "active",
            featured: item.featured ?? false,
            newArrival: item.newArrival ?? false,
            bestSeller: item.bestSeller ?? false,
            ribbon: item.ribbon,
        });
        created += 1;
    }
    console.log(`Import complete. Created: ${created}, Skipped: ${skipped}`);
    await (0, db_1.disconnectDatabase)();
    process.exit(0);
}
main().catch(async (error) => {
    console.error("Import failed:", error);
    await (0, db_1.disconnectDatabase)();
    process.exit(1);
});
