import { createServer as createHttpServer } from "http";
import app, { setupVite } from "./app";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createHttpServer(app);

// Start listening on port 5000 IMMEDIATELY so Replit's proxy never
// sees a closed port and never returns 502 during startup.
// Vite middleware is added asynchronously after — API routes work
// right away, the frontend becomes available within a few seconds.
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);

  // Set up Vite middleware after the server is already accepting
  // connections. Uses the HTTP server so HMR runs on the same port.
  setupVite(app, httpServer).catch((err) => {
    console.error("Vite setup error:", err);
  });
});
