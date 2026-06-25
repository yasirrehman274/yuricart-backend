import mongoose, { Document } from "mongoose";

export type CategoryStatus = "active" | "inactive";

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  status: CategoryStatus;
  sortOrder: number;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, trim: true },
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
