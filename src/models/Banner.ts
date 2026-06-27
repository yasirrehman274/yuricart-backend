import mongoose, { Document } from "mongoose";

export type BannerStatus = "active" | "inactive";
export type BannerPlacement = "hero" | "promo";

export interface ImageData {
  url: string;
  publicId?: string;
}

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  slug: string;
  image: ImageData;
  link?: string;
  status: BannerStatus;
  sortOrder: number;
  placement: BannerPlacement;
}

function normalizeImage(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") return { url: value };
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (obj.publicId || obj.url) return obj;
    return {};
  }
  return {};
}

const imageDataSchema = new mongoose.Schema<ImageData>(
  { url: { type: String, default: "" }, publicId: { type: String, trim: true } },
  { _id: false },
);

const bannerSchema = new mongoose.Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: imageDataSchema, default: () => ({ url: "" }), set: normalizeImage },
    link: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    sortOrder: { type: Number, default: 0 },
    placement: {
      type: String,
      enum: ["hero", "promo"],
      default: "hero",
    },
  },
  { timestamps: true },
);

bannerSchema.index({ status: 1, placement: 1, sortOrder: 1 });

export const Banner = mongoose.model<IBanner>("Banner", bannerSchema);
