import { Router } from "express";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { category } = req.query as Record<string, string>;

  let services;
  if (category) {
    services = await db.select().from(servicesTable).where(eq(servicesTable.category, category));
  } else {
    services = await db.select().from(servicesTable);
  }

  const categories = await db.selectDistinct({ category: servicesTable.category }).from(servicesTable);

  res.json({
    services: services.map(s => ({ ...s, price: parseFloat(s.price || "0") })),
    categories: categories.map(c => c.category),
  });
});

router.post("/", async (req, res) => {
  const { name, category, price, duration, description } = req.body;
  const [service] = await db.insert(servicesTable).values({ name, category, price: price.toString(), duration, description }).returning();
  res.status(201).json({ ...service, price: parseFloat(service.price || "0") });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, category, price, duration, description } = req.body;
  const [service] = await db.update(servicesTable).set({ name, category, price: price.toString(), duration, description }).where(eq(servicesTable.id, id)).returning();
  if (!service) return res.status(404).json({ error: "Service not found" });
  res.json({ ...service, price: parseFloat(service.price || "0") });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.update(servicesTable).set({ isActive: false }).where(eq(servicesTable.id, id));
  res.status(204).send();
});

export default router;
