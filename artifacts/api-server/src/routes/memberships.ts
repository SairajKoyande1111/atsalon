import { Router } from "express";
import Membership from "../models/Membership";
import { withId, withIds } from "../utils/format";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const memberships = await Membership.find().sort({ name: 1 }).lean();
    res.json({ memberships: withIds(memberships) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch memberships" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, price, duration, benefits, discountPercent } = req.body;
    const membership = await Membership.create({ name, price, duration, benefits, discountPercent });
    res.status(201).json(withId(membership.toObject()));
  } catch (err) {
    res.status(500).json({ error: "Failed to create membership" });
  }
});

export default router;
