import { Router } from "express";
import { db } from "@workspace/db";
import { membershipsTable } from "@workspace/db/schema";

const router = Router();

router.get("/", async (req, res) => {
  const memberships = await db.select().from(membershipsTable);
  res.json({
    memberships: memberships.map(m => ({
      ...m,
      price: parseFloat(m.price || "0"),
      discountPercent: parseFloat(m.discountPercent || "0"),
    })),
  });
});

router.post("/", async (req, res) => {
  const { name, price, duration, benefits, discountPercent } = req.body;
  const [membership] = await db.insert(membershipsTable).values({
    name, price: price.toString(), duration, benefits, discountPercent: discountPercent.toString()
  }).returning();
  res.status(201).json({
    ...membership,
    price: parseFloat(membership.price || "0"),
    discountPercent: parseFloat(membership.discountPercent || "0"),
  });
});

export default router;
