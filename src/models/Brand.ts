import mongoose, { Document } from "mongoose";

export type BrandStatus = "active" | "inactive";

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo?: string;
  status: BrandStatus;
}

const brandSchema = new mongoose.Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
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
