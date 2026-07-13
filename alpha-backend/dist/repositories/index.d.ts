/**
 * Repository Index
 * Central export point for all repositories
 * Implements Factory pattern for repository creation
 */
import { PrismaClient } from '@prisma/client';
import { UserRepository } from './user.repository';
/**
 * Get or create Prisma instance
 */
export declare const getPrismaInstance: () => PrismaClient;
/**
 * Repository Factory
 * Creates and manages repository instances
 */
export declare class RepositoryFactory {
    private static prisma;
    private static userRepository;
    /**
     * Initialize factory with Prisma instance
     */
    static initialize(prisma?: PrismaClient): void;
    /**
     * Get User Repository
     */
    static getUserRepository(): UserRepository;
    /**
     * Get Prisma instance
     */
    static getPrisma(): PrismaClient;
    /**
     * Disconnect from database
     */
    static disconnect(): Promise<void>;
}
export declare const getUserRepository: () => UserRepository;
export declare const getPrisma: () => PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export { UserRepository } from './user.repository';
export { BaseRepository } from './base.repository';
//# sourceMappingURL=index.d.ts.map