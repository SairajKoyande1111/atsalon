import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  notes?: string;
  membershipType?: string;
  totalSpend: number;
  totalVisits: number;
  loyaltyPoints: number;
  lastVisit?: Date;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  dob: { type: String },
  notes: { type: String },
  membershipType: { type: String, default: "none" },
  totalSpend: { type: Number, default: 0 },
  totalVisits: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  lastVisit: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
