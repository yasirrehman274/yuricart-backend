import mongoose, { Document } from "mongoose";

export interface ISettings extends Document {
  key: string;
  value: unknown;
  group: string;
}

const settingsSchema = new mongoose.Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    group: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

settingsSchema.index({ group: 1 });

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);
