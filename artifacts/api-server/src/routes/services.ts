import { Router } from "express";
import Service from "../models/Service";
import { withId, withIds } from "../utils/format";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category } = req.query as Record<string, string>;
    const filter: any = { isActive: true };
    if (category) filter.category = category;

    const services = await Service.find(filter).sort({ name: 1 }).lean();
    const categories = [...new Set(services.map((s: any) => s.category))];

    res.json({ services: withIds(services), categories });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, category, price, duration, description } = req.body;
    const service = await Service.create({ name, category, price, duration, description });
    res.status(201).json(withId(service.toObject()));
  } catch (err) {
    res.status(500).json({ error: "Failed to create service" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, category, price, duration, description } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, category, price, duration, description },
      { new: true, lean: true }
    );
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(withId(service));
  } catch (err) {
    res.status(500).json({ error: "Failed to update service" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete service" });
  }
});

export default router;
