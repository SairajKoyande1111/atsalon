import { Router } from "express";
import Expense from "../models/Expense";
import { withId, withIds } from "../utils/format";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 }).lean();
    const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    res.json({ expenses: withIds(expenses), total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { category, description, amount, date } = req.body;
    const expense = await Expense.create({ category, description, amount, date });
    res.status(201).json(withId(expense.toObject()));
  } catch (err) {
    res.status(500).json({ error: "Failed to create expense" });
  }
});

export default router;
