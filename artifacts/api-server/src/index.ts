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

// Setup Vite middleware with the HTTP server so HMR runs on the same port
await setupVite(app, httpServer);

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
