import mongoose, { Document, Types } from "mongoose";

export type ProductStatus = "draft" | "active" | "archived";

export interface ProductImageData {
  url: string;
  publicId?: string;
}

export interface ProductImages {
  primary: ProductImageData;
  gallery: ProductImageData[];
}

// Legacy image type (backward compat)
export interface LegacyProductImage {
  url: string;
  alt?: string;
  publicId?: string;
  isPrimary?: boolean;
}

export interface ProductVariant {
  sku?: string;
  options?: {
    color?: string;
    size?: string;
    [key: string]: string | undefined;
  };
  price?: number;
  salePrice?: number;
  stock?: number;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku?: string;
  stock: number;
  category?: Types.ObjectId;
  brand?: Types.ObjectId;
  images: ProductImages;
  tags: string[];
  colors: string[];
  sizes: string[];
  variants: ProductVariant[];
  status: ProductStatus;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  ribbon?: string;
  currency: string;
}

const productImageDataSchema = new mongoose.Schema<ProductImageData>(
  {
    url: { type: String, default: "" },
    publicId: { type: String, trim: true },
  },
  { _id: false },
);

const productImagesSchema = new mongoose.Schema<ProductImages>(
  {
    primary: { type: productImageDataSchema, default: () => ({ url: "" }) },
    gallery: { type: [productImageDataSchema], default: [] },
  },
  { _id: false },
);

const productVariantSchema = new mongoose.Schema<ProductVariant>(
  {
    sku: { type: String, trim: true },
    options: { type: Map, of: String },
    price: { type: Number, min: 0 },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

function normalizeImages(value: unknown): ProductImages {
  if (!value) {
    return { primary: { url: "" }, gallery: [] };
  }
  if (Array.isArray(value)) {
    const arr = value as LegacyProductImage[];
    const primary = arr.find((img) => img.isPrimary) || arr[0];
    const gallery = arr.filter((img) => img !== primary && img !== arr[0]);
    return {
      primary: { url: primary?.url || "", publicId: primary?.publicId },
      gallery: gallery.map((img) => ({ url: img.url, publicId: img.publicId })),
    };
  }
  const obj = value as Record<string, unknown>;
  return {
    primary: (obj.primary as ProductImageData) || { url: "" },
    gallery: (obj.gallery as ProductImageData[]) || [],
  };
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    shortDescription: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    sku: { type: String, trim: true, sparse: true, unique: true },
    stock: { type: Number, default: 0, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    images: {
      type: productImagesSchema,
      default: () => ({ primary: { url: "" }, gallery: [] }),
      set: normalizeImages,
    },
    tags: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    variants: { type: [productVariantSchema], default: [] },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    ribbon: { type: String, trim: true },
    currency: { type: String, default: "KES", uppercase: true },
  },
  { timestamps: true },
);

productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ status: 1, featured: 1, newArrival: 1, bestSeller: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ price: 1 });

export const Product = mongoose.model<IProduct>("Product", productSchema);
