import { Router } from "express";
import Bill from "../models/Bill";
import Customer from "../models/Customer";
import Appointment from "../models/Appointment";
import Product from "../models/Product";
import { withId, withIds } from "../utils/format";

const router = Router();

router.get("/dashboard", async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayBills, monthBills, totalCustomers, pendingAppts, products, recentBills, allPaidBills] = await Promise.all([
      Bill.find({ createdAt: { $gte: todayStart } }).lean(),
      Bill.find({ createdAt: { $gte: monthStart }, status: "paid" }).lean(),
      Customer.countDocuments(),
      Appointment.countDocuments({ status: "scheduled" }),
      Product.find({ isActive: true }).lean(),
      Bill.find({ status: "paid" }).sort({ createdAt: -1 }).limit(5).lean(),
      Bill.find({ status: "paid" }).lean(),
    ]);

    const todayRevenue = todayBills.reduce((s: number, b: any) => s + b.finalAmount, 0);
    const monthRevenue = monthBills.reduce((s: number, b: any) => s + b.finalAmount, 0);
    const todayCustomerIds = new Set(todayBills.filter((b: any) => b.customerId).map((b: any) => b.customerId?.toString()));
    const lowStockCount = products.filter((p: any) => p.stockQuantity <= p.reorderLevel).length;

    const serviceRevMap: Record<string, { count: number; revenue: number }> = {};
    const staffRevMap: Record<string, { name: string; revenue: number; services: number }> = {};

    for (const bill of allPaidBills) {
      for (const item of (bill as any).items) {
        if (item.type === "service") {
          if (!serviceRevMap[item.name]) serviceRevMap[item.name] = { count: 0, revenue: 0 };
          serviceRevMap[item.name].count++;
          serviceRevMap[item.name].revenue += item.total;
        }
        if (item.staffId) {
          const key = item.staffId.toString();
          const staffName = item.staffName || "Unknown";
          if (!staffRevMap[key]) staffRevMap[key] = { name: staffName, revenue: 0, services: 0 };
          staffRevMap[key].revenue += item.total;
          staffRevMap[key].services++;
        }
      }
    }

    const topServices = Object.entries(serviceRevMap)
      .map(([name, d]) => ({ name, count: d.count, revenue: d.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const topStaff = Object.values(staffRevMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({
      todayRevenue,
      todayBills: todayBills.length,
      todayCustomers: todayCustomerIds.size,
      totalCustomers,
      monthRevenue,
      monthBills: monthBills.length,
      pendingAppointments: pendingAppts,
      lowStockCount,
      topServices,
      topStaff,
      recentBills: recentBills.map((b: any) => ({
        id: b._id.toString(),
        billNumber: b.billNumber,
        finalAmount: b.finalAmount,
        paymentMethod: b.paymentMethod,
        status: b.status,
        createdAt: b.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get("/revenue", async (req, res) => {
  try {
    const { period = "daily" } = req.query as Record<string, string>;
    const bills = await Bill.find({ status: "paid" }).sort({ createdAt: 1 }).lean();

    const groupedData: Record<string, { revenue: number; bills: number; customers: Set<string> }> = {};

    for (const bill of bills) {
      const date = new Date((bill as any).createdAt);
      let label: string;
      if (period === "daily") {
        label = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      } else if (period === "weekly") {
        const ws = new Date(date);
        ws.setDate(date.getDate() - date.getDay());
        label = ws.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      } else {
        label = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      }
      if (!groupedData[label]) groupedData[label] = { revenue: 0, bills: 0, customers: new Set() };
      groupedData[label].revenue += (bill as any).finalAmount;
      groupedData[label].bills++;
      if ((bill as any).customerId) groupedData[label].customers.add((bill as any).customerId.toString());
    }

    const data = Object.entries(groupedData).slice(-14).map(([label, d]) => ({
      label, revenue: d.revenue, bills: d.bills, customers: d.customers.size,
    }));

    res.json({
      period, data,
      totalRevenue: bills.reduce((s: number, b: any) => s + b.finalAmount, 0),
      totalBills: bills.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch revenue" });
  }
});

export default router;
