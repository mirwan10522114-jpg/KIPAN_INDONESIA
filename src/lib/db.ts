import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma client singleton for SIM-KIPAN
export const db = new PrismaClient({
  log: ['error', 'warn'],
})