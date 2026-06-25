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
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { connectDatabase, disconnectDatabase } from "../src/config/db";
import { Brand } from "../src/models/Brand";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { ensureUniqueSlug, generateSlug } from "../src/utils/slug";

dotenv.config();

interface WixExportItem {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku?: string;
  stock?: number;
  collectionSlug?: string;
  brandName?: string;
  imageUrl?: string;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  ribbon?: string;
  legacyWixId?: string;
}

async function upsertCategory(slug: string, name: string) {
  const existing = await Category.findOne({ slug });
  if (existing) return existing;
  return Category.create({
    name,
    slug: await ensureUniqueSlug(Category, slug),
    status: "active",
  });
}

async function upsertBrand(name: string) {
  const slug = generateSlug(name);
  const existing = await Brand.findOne({ slug });
  if (existing) return existing;
  return Brand.create({
    name,
    slug: await ensureUniqueSlug(Brand, name),
    status: "active",
  });
}

async function main() {
  const filePath = path.join(__dirname, "../data/wix-export.json");

  if (!fs.existsSync(filePath)) {
    console.error(`Missing export file: ${filePath}`);
    console.error(
      "Copy backend/data/wix-export.example.json to wix-export.json and edit.",
    );
    process.exit(1);
  }

  await connectDatabase();

  const raw = fs.readFileSync(filePath, "utf-8");
  const items = JSON.parse(raw) as WixExportItem[];

  let created = 0;
  let skipped = 0;

  for (const item of items) {
    const slug = item.slug || generateSlug(item.name);
    const exists = await Product.findOne({ slug });
    if (exists) {
      skipped += 1;
      continue;
    }

    let categoryId;
    if (item.collectionSlug) {
      const cat = await upsertCategory(
        item.collectionSlug,
        item.collectionSlug.replace(/-/g, " ").toUpperCase(),
      );
      categoryId = cat._id;
    }

    let brandId;
    if (item.brandName) {
      const brand = await upsertBrand(item.brandName);
      brandId = brand._id;
    }

    await Product.create({
      title: item.name,
      slug: await ensureUniqueSlug(Product, slug),
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
  await disconnectDatabase();
  process.exit(0);
}

main().catch(async (error) => {
  console.error("Import failed:", error);
  await disconnectDatabase();
  process.exit(1);
});
