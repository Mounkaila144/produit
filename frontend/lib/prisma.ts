import { PrismaClient } from '@prisma/client';

// PrismaClient est attaché au global object en développement pour éviter
// d'épuiser la connexion de base de données à chaque rechargement à chaud
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 