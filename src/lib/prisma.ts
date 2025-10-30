import { PrismaClient } from "@prisma/client";

// In development, Next.js may hot-reload frequently.
// We store Prisma in the global object so it isn’t re-instantiated each time.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"], // you can add "query" for debugging
  });

// Re-use the same client between hot reloads in dev mode
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
