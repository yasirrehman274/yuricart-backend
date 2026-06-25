import mongoose, { Document, Types } from "mongoose";

export type PaymentMethod = "cod" | "whatsapp" | "mpesa" | "card";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: Types.ObjectId;
  title: string;
  slug: string;
  sku?: string;
  image?: string;
  price: number;
  quantity: number;
  options?: Record<string, string>;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer?: Types.ObjectId;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county?: string;
  postalCode?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  couponId?: Types.ObjectId;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  mpesaReceiptNumber?: string;
  notes?: string;
}

const orderItemSchema = new mongoose.Schema<OrderItem>(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    image: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    options: { type: Map, of: String },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    county: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    items: { type: [orderItemSchema], required: true, validate: [(v: OrderItem[]) => v.length > 0, "Order must have at least one item"] },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    couponCode: { type: String, trim: true, uppercase: true },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    paymentMethod: {
      type: String,
      enum: ["cod", "whatsapp", "mpesa", "card"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: { type: String, trim: true },
    mpesaReceiptNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

orderSchema.index({ email: 1, orderNumber: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
