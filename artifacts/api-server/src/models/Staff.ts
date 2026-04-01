import mongoose, { Schema, Document } from "mongoose";

export interface IStaff extends Document {
  name: string;
  specialization: string;
  phone?: string;
  email?: string;
  commissionPercent: number;
  workingHours?: string;
  isActive: boolean;
  createdAt: Date;
}

const StaffSchema = new Schema<IStaff>({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  commissionPercent: { type: Number, default: 0 },
  workingHours: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Staff || mongoose.model<IStaff>("Staff", StaffSchema);
