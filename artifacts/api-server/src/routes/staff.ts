import { Router } from "express";
import { db } from "@workspace/db";
import { staffTable, billsTable, billItemsTable } from "@workspace/db/schema";
import { eq, sql, sum } from "drizzle-orm";

const router = Router();

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

router.get("/", async (req, res) => {
  const staff = await db.select().from(staffTable);
  res.json({
    staff: staff.map(s => ({
      ...s,
      commissionPercent: parseFloat(s.commissionPercent || "0"),
      avatarInitials: getInitials(s.name),
    })),
  });
});

router.post("/", async (req, res) => {
  const { name, specialization, commissionPercent, phone, email, workingHours } = req.body;
  const [staff] = await db.insert(staffTable).values({
    name, specialization, commissionPercent: commissionPercent.toString(), phone, email, workingHours
  }).returning();
  res.status(201).json({
    ...staff,
    commissionPercent: parseFloat(staff.commissionPercent || "0"),
    avatarInitials: getInitials(staff.name),
  });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, id));
  if (!staff) return res.status(404).json({ error: "Staff not found" });

  const itemStats = await db.select({
    count: sql<number>`count(*)`,
    revenue: sql<number>`coalesce(sum(${billItemsTable.total}), 0)`,
  }).from(billItemsTable).where(eq(billItemsTable.staffId, id));

  res.json({
    ...staff,
    commissionPercent: parseFloat(staff.commissionPercent || "0"),
    avatarInitials: getInitials(staff.name),
    servicesPerformed: Number(itemStats[0]?.count || 0),
    revenueGenerated: parseFloat(String(itemStats[0]?.revenue || 0)),
    tips: 0,
  });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, specialization, commissionPercent, phone, email, workingHours } = req.body;
  const [staff] = await db.update(staffTable).set({
    name, specialization, commissionPercent: commissionPercent.toString(), phone, email, workingHours
  }).where(eq(staffTable.id, id)).returning();
  if (!staff) return res.status(404).json({ error: "Staff not found" });
  res.json({
    ...staff,
    commissionPercent: parseFloat(staff.commissionPercent || "0"),
    avatarInitials: getInitials(staff.name),
  });
});

export default router;
