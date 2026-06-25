import mongoose, { Document } from "mongoose";

export type ShippingStatus = "active" | "inactive";

export interface IShipping extends Document {
  name: string;
  rate: number;
  freeAbove?: number;
  regions: string[];
  status: ShippingStatus;
}

const shippingSchema = new mongoose.Schema<IShipping>(
  {
    name: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, min: 0 },
    freeAbove: { type: Number, min: 0 },
    regions: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

shippingSchema.index({ status: 1, name: 1 });

export const Shipping = mongoose.model<IShipping>("Shipping", shippingSchema);
