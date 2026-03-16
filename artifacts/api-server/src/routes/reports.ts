import { Router } from "express";
import { db } from "@workspace/db";
import {
  billsTable, billItemsTable, customersTable, servicesTable, staffTable, appointmentsTable, productsTable
} from "@workspace/db/schema";
import { eq, sql, desc, gte, and, lte } from "drizzle-orm";

const router = Router();

router.get("/dashboard", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayBillsResult = await db.select({
    count: sql<number>`count(*)`,
    revenue: sql<number>`coalesce(sum(${billsTable.finalAmount}), 0)`,
  }).from(billsTable).where(sql`date(${billsTable.createdAt}) = ${todayStr}`);

  const monthBillsResult = await db.select({
    count: sql<number>`count(*)`,
    revenue: sql<number>`coalesce(sum(${billsTable.finalAmount}), 0)`,
  }).from(billsTable).where(gte(billsTable.createdAt, firstOfMonth));

  const [{ total: totalCustomers }] = await db.select({ total: sql<number>`count(*)` }).from(customersTable);
  const [{ count: todayCustomers }] = await db.select({ count: sql<number>`count(distinct ${billsTable.customerId})` })
    .from(billsTable).where(sql`date(${billsTable.createdAt}) = ${todayStr} and ${billsTable.customerId} is not null`);

  const [{ count: pendingAppointments }] = await db.select({ count: sql<number>`count(*)` })
    .from(appointmentsTable).where(eq(appointmentsTable.status, "scheduled"));

  const lowStockProducts = await db.select().from(productsTable);
  const lowStockCount = lowStockProducts.filter(p => p.stockQuantity <= p.reorderLevel).length;

  const topServicesRows = await db.select({
    name: servicesTable.name,
    count: sql<number>`count(*)`,
    revenue: sql<number>`coalesce(sum(${billItemsTable.total}), 0)`,
  }).from(billItemsTable)
    .leftJoin(servicesTable, and(eq(billItemsTable.itemId, servicesTable.id), eq(billItemsTable.type, "service")))
    .where(eq(billItemsTable.type, "service"))
    .groupBy(servicesTable.name)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const topStaffRows = await db.select({
    name: staffTable.name,
    revenue: sql<number>`coalesce(sum(${billItemsTable.total}), 0)`,
    services: sql<number>`count(*)`,
  }).from(billItemsTable)
    .leftJoin(staffTable, eq(billItemsTable.staffId, staffTable.id))
    .where(sql`${billItemsTable.staffId} is not null`)
    .groupBy(staffTable.name)
    .orderBy(desc(sql`sum(${billItemsTable.total})`))
    .limit(5);

  const recentBills = await db.select({
    id: billsTable.id,
    billNumber: billsTable.billNumber,
    finalAmount: billsTable.finalAmount,
    paymentMethod: billsTable.paymentMethod,
    status: billsTable.status,
    createdAt: billsTable.createdAt,
  }).from(billsTable).orderBy(desc(billsTable.createdAt)).limit(5);

  res.json({
    todayRevenue: parseFloat(String(todayBillsResult[0]?.revenue || 0)),
    todayBills: Number(todayBillsResult[0]?.count || 0),
    todayCustomers: Number(todayCustomers || 0),
    totalCustomers: Number(totalCustomers || 0),
    monthRevenue: parseFloat(String(monthBillsResult[0]?.revenue || 0)),
    monthBills: Number(monthBillsResult[0]?.count || 0),
    pendingAppointments: Number(pendingAppointments || 0),
    lowStockCount,
    topServices: topServicesRows.map(s => ({
      name: s.name || "Unknown",
      count: Number(s.count || 0),
      revenue: parseFloat(String(s.revenue || 0)),
    })),
    topStaff: topStaffRows.map(s => ({
      name: s.name || "Unknown",
      revenue: parseFloat(String(s.revenue || 0)),
      services: Number(s.services || 0),
    })),
    recentBills: recentBills.map(b => ({
      id: b.id,
      billNumber: b.billNumber,
      finalAmount: parseFloat(b.finalAmount || "0"),
      paymentMethod: b.paymentMethod,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    })),
  });
});

router.get("/revenue", async (req, res) => {
  const { period = "daily", startDate, endDate } = req.query as Record<string, string>;

  const bills = await db.select({
    finalAmount: billsTable.finalAmount,
    customerId: billsTable.customerId,
    createdAt: billsTable.createdAt,
  }).from(billsTable).where(eq(billsTable.status, "paid")).orderBy(billsTable.createdAt);

  const groupedData: Record<string, { revenue: number; bills: number; customers: Set<number> }> = {};

  for (const bill of bills) {
    const date = new Date(bill.createdAt);
    let label: string;

    if (period === "daily") {
      label = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    } else if (period === "weekly") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      label = weekStart.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    } else {
      label = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    }

    if (!groupedData[label]) groupedData[label] = { revenue: 0, bills: 0, customers: new Set() };
    groupedData[label].revenue += parseFloat(bill.finalAmount || "0");
    groupedData[label].bills += 1;
    if (bill.customerId) groupedData[label].customers.add(bill.customerId);
  }

  const data = Object.entries(groupedData).slice(-14).map(([label, d]) => ({
    label,
    revenue: d.revenue,
    bills: d.bills,
    customers: d.customers.size,
  }));

  const totalRevenue = bills.reduce((sum, b) => sum + parseFloat(b.finalAmount || "0"), 0);

  res.json({ period, data, totalRevenue, totalBills: bills.length });
});

export default router;
