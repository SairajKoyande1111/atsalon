import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBillItem {
  type: "service" | "product";
  itemId?: Types.ObjectId;
  name: string;
  staffId?: Types.ObjectId;
  staffName?: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface IBill extends Document {
  billNumber: string;
  customerId?: Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  items: IBillItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  taxPercent: number;
  finalAmount: number;
  paymentMethod: string;
  couponCode?: string;
  loyaltyPointsUsed: number;
  status: string;
  createdAt: Date;
}

const BillItemSchema = new Schema<IBillItem>({
  type: { type: String, enum: ["service", "product"], required: true },
  itemId: { type: Schema.Types.ObjectId },
  name: { type: String, required: true },
  staffId: { type: Schema.Types.ObjectId, ref: "Staff" },
  staffName: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const BillSchema = new Schema<IBill>({
  billNumber: { type: String, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
  customerName: { type: String },
  customerPhone: { type: String },
  items: [BillItemSchema],
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  finalAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: "cash" },
  couponCode: { type: String },
  loyaltyPointsUsed: { type: Number, default: 0 },
  status: { type: String, default: "paid", enum: ["paid", "pending", "cancelled"] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Bill || mongoose.model<IBill>("Bill", BillSchema);
