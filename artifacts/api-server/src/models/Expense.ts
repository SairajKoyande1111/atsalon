import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  category: string;
  description?: string;
  amount: number;
  date: string;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  category: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
