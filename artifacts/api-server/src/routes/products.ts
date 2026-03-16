import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db/schema";
import { eq, lte, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { category, lowStock } = req.query as Record<string, string>;

  let products = await db.select().from(productsTable);
  if (category) products = products.filter(p => p.category === category);
  if (lowStock === "true") products = products.filter(p => p.stockQuantity <= p.reorderLevel);

  const total = products.length;

  res.json({
    products: products.map(p => ({
      ...p,
      costPrice: parseFloat(p.costPrice || "0"),
      sellingPrice: parseFloat(p.sellingPrice || "0"),
      isLowStock: p.stockQuantity <= p.reorderLevel,
    })),
    total,
  });
});

router.post("/", async (req, res) => {
  const { name, brand, category, stockQuantity, reorderLevel, costPrice, sellingPrice, supplier } = req.body;
  const [product] = await db.insert(productsTable).values({
    name, brand, category, stockQuantity, reorderLevel,
    costPrice: costPrice.toString(), sellingPrice: sellingPrice.toString(), supplier
  }).returning();
  res.status(201).json({
    ...product,
    costPrice: parseFloat(product.costPrice || "0"),
    sellingPrice: parseFloat(product.sellingPrice || "0"),
    isLowStock: product.stockQuantity <= product.reorderLevel,
  });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, brand, category, stockQuantity, reorderLevel, costPrice, sellingPrice, supplier } = req.body;
  const [product] = await db.update(productsTable).set({
    name, brand, category, stockQuantity, reorderLevel,
    costPrice: costPrice.toString(), sellingPrice: sellingPrice.toString(), supplier
  }).where(eq(productsTable.id, id)).returning();
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({
    ...product,
    costPrice: parseFloat(product.costPrice || "0"),
    sellingPrice: parseFloat(product.sellingPrice || "0"),
    isLowStock: product.stockQuantity <= product.reorderLevel,
  });
});

export default router;
