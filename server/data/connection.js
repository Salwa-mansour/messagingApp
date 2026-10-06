import dotenv from 'dotenv';
dotenv.config(); // Must be called before accessing process.env.DATABASE_URL

import { PrismaClient } from '../prisma/generated/client/index.js';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';

import ws from 'ws';



// Required for Neon serverless driver in a Node.js environment
neonConfig.webSocketConstructor = ws;

// Create a Neon connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the Prisma adapter for Neon
const adapter = new PrismaNeon(pool);

// Initialize PrismaClient with the Neon adapter
const prisma = new PrismaClient({ adapter });

export default prisma;