import mongoose, { Document } from "mongoose";

export type BrandStatus = "active" | "inactive";

export interface ImageData {
  url: string;
  publicId?: string;
}

export interface IBrand extends Document {
  name: string;
  slug: string;
  image?: ImageData;
  logo?: string;
  status: BrandStatus;
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

const brandSchema = new mongoose.Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: imageDataSchema, default: () => ({}), set: normalizeImage },
    logo: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

brandSchema.index({ name: "text" });
brandSchema.index({ status: 1, name: 1 });

export const Brand = mongoose.model<IBrand>("Brand", brandSchema);
