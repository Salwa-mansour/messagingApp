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

const isProduction = process.env.NODE_ENV === 'production' || connectionString.includes('neon.tech');

if (isProduction) {
  const { PrismaNeon } = await import('@prisma/adapter-neon');
  const { Pool, neonConfig } = await import('@neondatabase/serverless');

  neonConfig.webSocketConstructor = ws;

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  prisma = new PrismaClient({ adapter });
  console.log('🔌 Connected using Neon Adapter (Production)');

} else {
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const pkg = await import('pg');
  const { Pool } = pkg;

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  console.log('💻 Connected using Standard PG Adapter (Local)');
}

export default prisma;