import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  brand?: string;
  category: string;
  stockQuantity: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: string;
  isActive: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  brand: { type: String },
  category: { type: String, required: true },
  stockQuantity: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 5 },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  supplier: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
