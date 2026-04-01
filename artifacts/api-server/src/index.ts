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

// Setup Vite middleware — passes the HTTP server so HMR WebSocket
// runs on the same port (5000) instead of needing a separate port.
await setupVite(app, httpServer);

// Bind to "::" (IPv6 dual-stack) so both IPv4 and IPv6 connections
// work — required for Replit's proxy to reliably reach the server.
httpServer.listen(port, "::", () => {
  console.log(`Server listening on port ${port}`);
});
