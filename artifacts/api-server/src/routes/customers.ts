import { Router } from "express";
import Customer from "../models/Customer";
import Bill from "../models/Bill";
import { withId, withIds } from "../utils/format";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = search
      ? { $or: [{ name: new RegExp(search, "i") }, { phone: new RegExp(search, "i") }] }
      : {};

    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Customer.countDocuments(filter),
    ]);

    res.json({ customers: withIds(customers), total, page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, phone, email, dob, notes } = req.body;
    const customer = await Customer.create({ name, phone, email, dob, notes });
    res.status(201).json(withId(customer.toObject()));
  } catch (err) {
    res.status(500).json({ error: "Failed to create customer" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const bills = await Bill.find({ customerId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ ...withId(customer), bills: withIds(bills) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, phone, email, dob, membershipType, notes } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, email, dob, membershipType, notes },
      { new: true, lean: true }
    );
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(withId(customer));
  } catch (err) {
    res.status(500).json({ error: "Failed to update customer" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

export default router;
