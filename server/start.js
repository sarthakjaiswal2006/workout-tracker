/**
 * server/start.js — Dedicated entry point for the Express API server.
 *
 * We keep this separate from index.js so that:
 *  1. index.js can be imported by tests without starting the HTTP server.
 *  2. The TCP server ref is explicitly kept alive (httpServer.ref()).
 */

import dotenv from "dotenv";
dotenv.config();

import app from "./index.js";
import http from "http";

const PORT = process.env.PORT || 5001;

const httpServer = http.createServer(app);

// .ref() tells Node.js's event loop to keep the process alive
// as long as this server is listening — guards against any
// library calling .unref() internally.
httpServer.ref();

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Workout Tracker API running on http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop.\n`);
});

httpServer.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${PORT} is already in use. Kill the process using it and retry.\n`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT",  () => { httpServer.close(() => process.exit(0)); });
process.on("SIGTERM", () => { httpServer.close(() => process.exit(0)); });
