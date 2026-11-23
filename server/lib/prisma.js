
import prismaPackage from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { PrismaClient } = prismaPackage;

// Create a pg.Pool explicitly with allowExitOnIdle: false
// This prevents Node.js from exiting when all pool connections are idle
// (important when PrismaPg is used in a long-running server, not a serverless fn)
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export default prisma;
