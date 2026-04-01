import { Router } from "express";
import Staff from "../models/Staff";
import Bill from "../models/Bill";
import { withId, withIds } from "../utils/format";

const router = Router();

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

router.get("/", async (req, res) => {
  try {
    const staff = await Staff.find({ isActive: true }).sort({ name: 1 }).lean();
    res.json({
      staff: withIds(staff).map((s: any) => ({ ...s, avatarInitials: getInitials(s.name) })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, specialization, commissionPercent, phone, email, workingHours } = req.body;
    const s = await Staff.create({ name, specialization, commissionPercent, phone, email, workingHours });
    res.status(201).json({ ...withId(s.toObject()), avatarInitials: getInitials(name) });
  } catch (err) {
    res.status(500).json({ error: "Failed to create staff" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).lean();
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    const bills = await Bill.find({ "items.staffId": req.params.id }).lean();
    let totalRevenue = 0;
    let servicesPerformed = 0;
    for (const bill of bills) {
      for (const item of (bill as any).items) {
        if (item.staffId?.toString() === req.params.id) {
          totalRevenue += item.total;
          servicesPerformed++;
        }
      }
    }

    res.json({
      ...withId(staff),
      avatarInitials: getInitials((staff as any).name),
      servicesPerformed,
      revenueGenerated: totalRevenue,
      tips: 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, specialization, commissionPercent, phone, email, workingHours } = req.body;
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { name, specialization, commissionPercent, phone, email, workingHours },
      { new: true, lean: true }
    );
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    res.json({ ...withId(staff), avatarInitials: getInitials((staff as any).name) });
  } catch (err) {
    res.status(500).json({ error: "Failed to update staff" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Staff.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete staff" });
  }
});

export default router;
