import mongoose, { Schema, Document } from "mongoose";

export interface IMembership extends Document {
  name: string;
  price: number;
  duration: number;
  benefits?: string;
  discountPercent: number;
  createdAt: Date;
}

const MembershipSchema = new Schema<IMembership>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  benefits: { type: String },
  discountPercent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Membership || mongoose.model<IMembership>("Membership", MembershipSchema);
