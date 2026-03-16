import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable, billsTable, billItemsTable } from "@workspace/db/schema";
import { eq, like, desc, sql, or } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  let query = db.select().from(customersTable).orderBy(desc(customersTable.createdAt));

  let customers;
  let total;
  if (search) {
    customers = await db.select().from(customersTable)
      .where(or(like(customersTable.name, `%${search}%`), like(customersTable.phone, `%${search}%`)))
      .orderBy(desc(customersTable.createdAt))
      .limit(limitNum).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(customersTable)
      .where(or(like(customersTable.name, `%${search}%`), like(customersTable.phone, `%${search}%`)));
    total = Number(countResult[0].count);
  } else {
    customers = await db.select().from(customersTable).orderBy(desc(customersTable.createdAt)).limit(limitNum).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(customersTable);
    total = Number(countResult[0].count);
  }

  const result = customers.map(c => ({
    ...c,
    totalSpend: parseFloat(c.totalSpend || "0"),
    loyaltyPoints: c.loyaltyPoints,
    totalVisits: c.totalVisits,
    lastVisit: c.lastVisit ? c.lastVisit.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  }));

  res.json({ customers: result, total, page: pageNum, limit: limitNum });
});

router.post("/", async (req, res) => {
  const { name, phone, email, notes } = req.body;
  const [customer] = await db.insert(customersTable).values({ name, phone, email, notes }).returning();
  res.status(201).json({
    ...customer,
    totalSpend: parseFloat(customer.totalSpend || "0"),
    lastVisit: customer.lastVisit ? customer.lastVisit.toISOString() : null,
    createdAt: customer.createdAt.toISOString(),
  });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  const bills = await db.select({
    id: billsTable.id,
    billNumber: billsTable.billNumber,
    finalAmount: billsTable.finalAmount,
    paymentMethod: billsTable.paymentMethod,
    status: billsTable.status,
    createdAt: billsTable.createdAt,
  }).from(billsTable).where(eq(billsTable.customerId, id)).orderBy(desc(billsTable.createdAt)).limit(10);

  res.json({
    ...customer,
    totalSpend: parseFloat(customer.totalSpend || "0"),
    lastVisit: customer.lastVisit ? customer.lastVisit.toISOString() : null,
    createdAt: customer.createdAt.toISOString(),
    bills: bills.map(b => ({ ...b, finalAmount: parseFloat(b.finalAmount || "0"), createdAt: b.createdAt.toISOString() })),
  });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, phone, email, membershipType, notes } = req.body;
  const [customer] = await db.update(customersTable).set({ name, phone, email, membershipType, notes }).where(eq(customersTable.id, id)).returning();
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json({
    ...customer,
    totalSpend: parseFloat(customer.totalSpend || "0"),
    lastVisit: customer.lastVisit ? customer.lastVisit.toISOString() : null,
    createdAt: customer.createdAt.toISOString(),
  });
});

export default router;
