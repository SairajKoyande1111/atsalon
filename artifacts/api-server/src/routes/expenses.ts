import { Router } from "express";
import { db } from "@workspace/db";
import { expensesTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const expenses = await db.select().from(expensesTable);
  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);

  res.json({
    expenses: expenses.map(e => ({
      ...e,
      amount: parseFloat(e.amount || "0"),
      createdAt: e.createdAt.toISOString(),
    })),
    total,
  });
});

router.post("/", async (req, res) => {
  const { category, description, amount, date } = req.body;
  const [expense] = await db.insert(expensesTable).values({
    category, description, amount: amount.toString(), date
  }).returning();
  res.status(201).json({
    ...expense,
    amount: parseFloat(expense.amount || "0"),
    createdAt: expense.createdAt.toISOString(),
  });
});

export default router;
