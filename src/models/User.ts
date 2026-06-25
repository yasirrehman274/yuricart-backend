import mongoose, { Document, Model } from "mongoose";
import { comparePassword, hashPassword } from "../utils/password";

export type UserRole = "admin" | "customer";
export type UserStatus = "active" | "blocked";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return comparePassword(candidate, this.password);
};

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() }).select("+password");
};

export const User = mongoose.model<IUser, IUserModel>("User", userSchema);
