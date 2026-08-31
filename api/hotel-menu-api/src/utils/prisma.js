const { PrismaClient } = require('@prisma/client');

// Reuse a single PrismaClient instance across the app (and across
// hot-reloads in dev) to avoid exhausting the DB connection pool.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;
