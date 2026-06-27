import mongoose, { Document } from "mongoose";

export type CategoryStatus = "active" | "inactive";

export interface ImageData {
  url: string;
  publicId?: string;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: ImageData;
  description?: string;
  status: CategoryStatus;
  sortOrder: number;
}

function normalizeImage(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") return { url: value };
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (obj.publicId || obj.url) return obj;
    if ((obj as { url?: string }).url) return obj;
    return {};
  }
  return {};
}

const imageDataSchema = new mongoose.Schema<ImageData>(
  { url: { type: String, default: "" }, publicId: { type: String, trim: true } },
  { _id: false },
);

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: imageDataSchema, default: () => ({}), set: normalizeImage },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ name: "text", description: "text" });
categorySchema.index({ status: 1, sortOrder: 1 });

export const Category = mongoose.model<ICategory>("Category", categorySchema);
