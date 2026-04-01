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

const isUnifiedMode =
  process.env.NODE_ENV !== "production" &&
  process.env.BASE_PATH !== undefined;

if (isUnifiedMode) {
  // Unified mode: Vite middleware serves the frontend alongside the API
  const { createServer: createViteServer } = await import("vite");
  const viteRoot = path.resolve(import.meta.dirname, "../../salon-billing");
  const vite = await createViteServer({
    root: viteRoot,
    configFile: path.join(viteRoot, "vite.config.ts"),
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else if (process.env.NODE_ENV === "production") {
  // Production: serve the built static files
  const distPath = path.resolve(
    import.meta.dirname,
    "../../salon-billing/dist/public",
  );
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
// If neither: plain API-only mode (used by the artifact workflow)

export default app;
