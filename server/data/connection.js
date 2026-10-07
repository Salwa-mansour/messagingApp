import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../prisma/generated/client/index.js';
import ws from 'ws';

// Debug check to verify what Render is passing at runtime
console.log("DATABASE_URL check at runtime:", process.env.DATABASE_URL ? "Exists length: " + process.env.DATABASE_URL.length : "UNDEFINED!!!");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("CRITICAL: DATABASE_URL is missing at runtime!");
}

let prisma;

const isProduction =  connectionString.includes('neon.tech');
// Clean the connection string for the Neon serverless WebSocket driver
let cleanedConnectionString = connectionString;

if (isProduction) {
  const { PrismaNeon } = await import('@prisma/adapter-neon');
  const { neonConfig } = await import('@neondatabase/serverless');

  neonConfig.webSocketConstructor = ws;

  // Pass the connection string object directly to PrismaNeon
  const adapter = new PrismaNeon({ connectionString });
  prisma = new PrismaClient({ adapter });
  console.log('🔌 Connected using Neon Adapter (Production)');
} else {
  // Local environment can keep standard parameters if needed, or use cleaned string
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const pkg = await import('pg');
  const { Pool } = pkg;

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  console.log('💻 Connected using Standard PG Adapter (Local)');
}
export default prisma;