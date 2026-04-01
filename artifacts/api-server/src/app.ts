import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";
import { connectDB } from "./db/mongodb";

const app: Express = express();

app.set("trust proxy", true);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow Replit's proxy iframe embedding and disable caching in dev
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.removeHeader("X-Frame-Options");
  if (process.env.NODE_ENV !== "production") {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
  }
  next();
});

connectDB().catch(console.error);

app.use("/api", router);

const isUnifiedMode =
  process.env.NODE_ENV !== "production" &&
  process.env.BASE_PATH !== undefined;

if (isUnifiedMode) {
  const { createServer: createViteServer } = await import("vite");
  const viteRoot = path.resolve(import.meta.dirname, "../../salon-billing");
  const vite = await createViteServer({
    root: viteRoot,
    configFile: path.join(viteRoot, "vite.config.ts"),
    server: {
      middlewareMode: true,
      allowedHosts: true,
      hmr: true,
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else if (process.env.NODE_ENV === "production") {
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
