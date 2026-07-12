/**
 * Repository Index
 * Central export point for all repositories
 * Implements Factory pattern for repository creation
 */

import { PrismaClient } from '@prisma/client';
import { UserRepository } from './user.repository';

// Singleton Prisma instance
let prismaInstance: PrismaClient | null = null;

/**
 * Get or create Prisma instance
 */
export const getPrismaInstance = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn']
        : ['error'],
    });
  }
  return prismaInstance;
};

/**
 * Repository Factory
 * Creates and manages repository instances
 */
export class RepositoryFactory {
  private static prisma: PrismaClient;
  private static userRepository: UserRepository;

  /**
   * Initialize factory with Prisma instance
   */
  static initialize(prisma?: PrismaClient): void {
    this.prisma = prisma || getPrismaInstance();
  }

  /**
   * Get User Repository
   */
  static getUserRepository(): UserRepository {
    if (!this.prisma) {
      this.initialize();
    }
    
    if (!this.userRepository) {
      this.userRepository = new UserRepository(this.prisma);
    }
    
    return this.userRepository;
  }

  /**
   * Get Prisma instance
   */
  static getPrisma(): PrismaClient {
    if (!this.prisma) {
      this.initialize();
    }
    return this.prisma;
  }

  /**
   * Disconnect from database
   */
  static async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }
}

// Initialize on module load
RepositoryFactory.initialize();

// Export convenience methods
export const getUserRepository = () => RepositoryFactory.getUserRepository();
export const getPrisma = () => RepositoryFactory.getPrisma();

// Export repository classes
export { UserRepository } from './user.repository';
export { BaseRepository } from './base.repository';
