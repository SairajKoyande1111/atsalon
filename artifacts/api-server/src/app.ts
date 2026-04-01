import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";
import { connectDB } from "./db/mongodb";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB().catch(console.error);

app.use("/api", router);

if (process.env.NODE_ENV !== "production") {
  // In development: use Vite as middleware so one process serves everything
  const { createServer: createViteServer } = await import("vite");
  const viteRoot = path.resolve(
    import.meta.dirname,
    "../../salon-billing",
  );
  const vite = await createViteServer({
    root: viteRoot,
    configFile: path.join(viteRoot, "vite.config.ts"),
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // In production: serve the built static files
  const distPath = path.resolve(
    import.meta.dirname,
    "../../salon-billing/dist/public",
  );
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

export default app;
