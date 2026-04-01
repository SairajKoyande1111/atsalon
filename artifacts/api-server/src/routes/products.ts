import { Router } from "express";
import Product from "../models/Product";
import { withId, withIds } from "../utils/format";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, lowStock } = req.query as Record<string, string>;
    const filter: any = { isActive: true };
    if (category) filter.category = category;

    let products = await Product.find(filter).sort({ name: 1 }).lean();
    if (lowStock === "true") {
      products = products.filter((p: any) => p.stockQuantity <= p.reorderLevel);
    }

    res.json({
      products: withIds(products).map((p: any) => ({ ...p, isLowStock: p.stockQuantity <= p.reorderLevel })),
      total: products.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, brand, category, stockQuantity, reorderLevel, costPrice, sellingPrice, supplier } = req.body;
    const product = await Product.create({ name, brand, category, stockQuantity, reorderLevel, costPrice, sellingPrice, supplier });
    const p = withId(product.toObject()) as any;
    res.status(201).json({ ...p, isLowStock: p.stockQuantity <= p.reorderLevel });
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, brand, category, stockQuantity, reorderLevel, costPrice, sellingPrice, supplier } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, brand, category, stockQuantity, reorderLevel, costPrice, sellingPrice, supplier },
      { new: true, lean: true }
    ) as any;
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ ...withId(product), isLowStock: product.stockQuantity <= product.reorderLevel });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
