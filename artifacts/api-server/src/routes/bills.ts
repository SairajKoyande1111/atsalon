import { Router } from "express";
import { db } from "@workspace/db";
import {
  billsTable, billItemsTable, customersTable, staffTable, servicesTable, productsTable
} from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

function formatBill(bill: any, items: any[]) {
  return {
    id: bill.id,
    billNumber: bill.billNumber,
    customerId: bill.customerId,
    customerName: bill.customerName || null,
    customerPhone: bill.customerPhone || null,
    items: items.map(i => ({
      id: i.id,
      type: i.type,
      itemId: i.itemId,
      name: i.name,
      staffId: i.staffId,
      staffName: i.staffName || null,
      price: parseFloat(i.price || "0"),
      quantity: i.quantity,
      discount: parseFloat(i.discount || "0"),
      total: parseFloat(i.total || "0"),
    })),
    subtotal: parseFloat(bill.subtotal || "0"),
    discountAmount: parseFloat(bill.discountAmount || "0"),
    taxAmount: parseFloat(bill.taxAmount || "0"),
    taxPercent: parseFloat(bill.taxPercent || "0"),
    finalAmount: parseFloat(bill.finalAmount || "0"),
    paymentMethod: bill.paymentMethod,
    couponCode: bill.couponCode || null,
    loyaltyPointsUsed: bill.loyaltyPointsUsed,
    status: bill.status,
    createdAt: bill.createdAt instanceof Date ? bill.createdAt.toISOString() : bill.createdAt,
  };
}

async function getBillWithItems(billId: number) {
  const [bill] = await db.select({
    bill: billsTable,
    customerName: customersTable.name,
    customerPhone: customersTable.phone,
  }).from(billsTable).leftJoin(customersTable, eq(billsTable.customerId, customersTable.id)).where(eq(billsTable.id, billId));

  if (!bill) return null;

  const items = await db.select({
    id: billItemsTable.id,
    type: billItemsTable.type,
    itemId: billItemsTable.itemId,
    name: billItemsTable.name,
    staffId: billItemsTable.staffId,
    staffName: staffTable.name,
    price: billItemsTable.price,
    quantity: billItemsTable.quantity,
    discount: billItemsTable.discount,
    total: billItemsTable.total,
  }).from(billItemsTable)
    .leftJoin(staffTable, eq(billItemsTable.staffId, staffTable.id))
    .where(eq(billItemsTable.billId, billId));

  return formatBill({ ...bill.bill, customerName: bill.customerName, customerPhone: bill.customerPhone }, items);
}

router.get("/", async (req, res) => {
  const { date, customerId, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  let bills = await db.select({
    bill: billsTable,
    customerName: customersTable.name,
    customerPhone: customersTable.phone,
  }).from(billsTable)
    .leftJoin(customersTable, eq(billsTable.customerId, customersTable.id))
    .orderBy(desc(billsTable.createdAt))
    .limit(limitNum).offset(offset);

  const allBillsWithItems = await Promise.all(
    bills.map(async b => {
      const items = await db.select({
        id: billItemsTable.id,
        type: billItemsTable.type,
        itemId: billItemsTable.itemId,
        name: billItemsTable.name,
        staffId: billItemsTable.staffId,
        staffName: staffTable.name,
        price: billItemsTable.price,
        quantity: billItemsTable.quantity,
        discount: billItemsTable.discount,
        total: billItemsTable.total,
      }).from(billItemsTable)
        .leftJoin(staffTable, eq(billItemsTable.staffId, staffTable.id))
        .where(eq(billItemsTable.billId, b.bill.id));
      return formatBill({ ...b.bill, customerName: b.customerName, customerPhone: b.customerPhone }, items);
    })
  );

  const countResult = await db.select({ count: sql<number>`count(*)` }).from(billsTable);
  const total = Number(countResult[0].count);

  res.json({ bills: allBillsWithItems, total, page: pageNum, limit: limitNum });
});

router.post("/", async (req, res) => {
  const { customerId, items, taxPercent, paymentMethod, couponCode, loyaltyPointsUsed, discountAmount } = req.body;

  let subtotal = 0;
  const resolvedItems = [];

  for (const item of items) {
    let name = "";
    let price = 0;

    if (item.type === "service") {
      const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, item.itemId));
      name = service?.name || "Unknown Service";
      price = parseFloat(service?.price || "0");
    } else {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.itemId));
      name = product?.name || "Unknown Product";
      price = parseFloat(product?.sellingPrice || "0");
    }

    const itemDiscount = item.discount || 0;
    const itemTotal = price * item.quantity * (1 - itemDiscount / 100);
    subtotal += itemTotal;
    resolvedItems.push({ ...item, name, price, total: itemTotal });
  }

  const taxAmount = ((subtotal - (discountAmount || 0)) * (taxPercent || 0)) / 100;
  const finalAmount = subtotal - (discountAmount || 0) + taxAmount - (loyaltyPointsUsed || 0);

  const billNumber = `BILL-${Date.now()}`;

  const [bill] = await db.insert(billsTable).values({
    billNumber,
    customerId: customerId || null,
    subtotal: subtotal.toFixed(2),
    discountAmount: (discountAmount || 0).toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    taxPercent: (taxPercent || 0).toFixed(2),
    finalAmount: Math.max(0, finalAmount).toFixed(2),
    paymentMethod,
    couponCode: couponCode || null,
    loyaltyPointsUsed: loyaltyPointsUsed || 0,
    status: "paid",
  }).returning();

  for (const item of resolvedItems) {
    await db.insert(billItemsTable).values({
      billId: bill.id,
      type: item.type,
      itemId: item.itemId,
      name: item.name,
      staffId: item.staffId || null,
      price: item.price.toFixed(2),
      quantity: item.quantity,
      discount: (item.discount || 0).toFixed(2),
      total: item.total.toFixed(2),
    });
  }

  if (customerId) {
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, customerId));
    if (customer) {
      const newPoints = customer.loyaltyPoints + Math.floor(parseFloat(bill.finalAmount) / 10) - (loyaltyPointsUsed || 0);
      await db.update(customersTable).set({
        loyaltyPoints: Math.max(0, newPoints),
        totalVisits: customer.totalVisits + 1,
        totalSpend: (parseFloat(customer.totalSpend || "0") + parseFloat(bill.finalAmount)).toFixed(2),
        lastVisit: new Date(),
      }).where(eq(customersTable.id, customerId));
    }
  }

  const result = await getBillWithItems(bill.id);
  res.status(201).json(result);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const bill = await getBillWithItems(id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  res.json(bill);
});

export default router;
