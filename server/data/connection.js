import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../prisma/generated/client/index.js';
import ws from 'ws';

let prisma;

// Check if we are in production (or if you prefer checking a specific env variable like process.env.USE_NEON === 'true')
const useNeonAdapter =  process.env.DATABASE_URL?.includes('neon.tech');

if (useNeonAdapter) {
  // --- PRODUCTION SETUP (Neon) ---
  const { PrismaNeon } = await import('@prisma/adapter-neon');
  const { Pool, neonConfig } = await import('@neondatabase/serverless');

  // Required for Neon serverless driver in Node.js
  neonConfig.webSocketConstructor = ws;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaNeon(pool);
  prisma = new PrismaClient({ adapter });
  console.log('🔌 Connected using Neon Adapter (Production)');

} else {
  // --- LOCAL SETUP (Standard Postgres / pg) ---
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const pkg = await import('pg');
  const { Pool } = pkg;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  console.log('💻 Connected using Standard PG Adapter (Local)');
}

export default prisma;