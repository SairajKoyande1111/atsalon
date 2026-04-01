import { Router } from "express";
import Bill from "../models/Bill";
import Customer from "../models/Customer";
import { withId, withIds } from "../utils/format";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { page = "1", limit = "20", customerId } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (customerId) filter.customerId = customerId;

    const [bills, total] = await Promise.all([
      Bill.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Bill.countDocuments(filter),
    ]);

    res.json({ bills: withIds(bills), total, page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bills" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      customerId, customerName, customerPhone, items,
      subtotal, discountAmount, taxAmount, taxPercent,
      finalAmount, paymentMethod, couponCode, loyaltyPointsUsed, status
    } = req.body;

    const count = await Bill.countDocuments();
    const billNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const bill = await Bill.create({
      billNumber,
      customerId: customerId || null,
      customerName,
      customerPhone,
      items,
      subtotal,
      discountAmount: discountAmount || 0,
      taxAmount: taxAmount || 0,
      taxPercent: taxPercent || 0,
      finalAmount,
      paymentMethod,
      couponCode,
      loyaltyPointsUsed: loyaltyPointsUsed || 0,
      status: status || "paid",
    });

    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { totalSpend: finalAmount, totalVisits: 1 },
        $set: { lastVisit: new Date() },
      });
    }

    res.status(201).json(withId(bill.toObject()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create bill" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).lean();
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    res.json(withId(bill));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bill" });
  }
});

export default router;
