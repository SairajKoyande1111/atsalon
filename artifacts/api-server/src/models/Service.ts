import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  name: string;
  category: string;
  price: number;
  duration: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

const ServiceSchema = new Schema<IService>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, default: 30 },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);
