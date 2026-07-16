import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

/**
 * PrismaClient Singleton
 * Ensures a single PrismaClient instance is shared across all services
 * Prevents connection pool exhaustion and improves performance
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// In development, log slow queries
if (process.env.NODE_ENV === 'development') {
  (prisma as any).$on('query', (e: any) => {
    if (e.duration > 1000) {
      logger.warn('Slow query detected', {
        query: e.query?.substring(0, 200),
        duration: `${e.duration}ms`,
        params: e.params?.substring(0, 100),
      });
    }
  });
}

(prisma as any).$on('error', (e: any) => {
  logger.error('Prisma error', { error: e.message });
});

export default prisma;
