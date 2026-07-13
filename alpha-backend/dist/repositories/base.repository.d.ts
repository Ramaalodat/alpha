/**
 * Base Repository
 * Provides common database operations following Repository pattern
 * Implements generic CRUD operations with soft delete support
 */
import { PrismaClient, Prisma } from '@prisma/client';
export interface IRepository<T> {
    findById(id: string): Promise<T | null>;
    findMany(args?: any): Promise<T[]>;
    create(data: any): Promise<T>;
    update(id: string, data: any): Promise<T>;
    delete(id: string): Promise<T>;
    softDelete(id: string): Promise<T>;
    count(args?: any): Promise<number>;
}
export declare abstract class BaseRepository<T> implements IRepository<T> {
    protected prisma: PrismaClient;
    protected modelName: string;
    constructor(prisma: PrismaClient, modelName: string);
    /**
     * Get model delegate from Prisma client
     */
    protected getModel(): any;
    /**
     * Find entity by ID
     */
    findById(id: string): Promise<T | null>;
    /**
     * Find entity by unique field
     */
    findUnique(where: any): Promise<T | null>;
    /**
     * Find first matching entity
     */
    findFirst(args: any): Promise<T | null>;
    /**
     * Find many entities
     */
    findMany(args?: any): Promise<T[]>;
    /**
     * Create new entity
     */
    create(data: any): Promise<T>;
    /**
     * Update entity
     */
    update(id: string, data: any): Promise<T>;
    /**
     * Update many entities
     */
    updateMany(args: any): Promise<{
        count: number;
    }>;
    /**
     * Delete entity (hard delete)
     */
    delete(id: string): Promise<T>;
    /**
     * Soft delete entity
     */
    softDelete(id: string): Promise<T>;
    /**
     * Count entities
     */
    count(args?: any): Promise<number>;
    /**
     * Check if entity exists
     */
    exists(where: any): Promise<boolean>;
    /**
     * Execute transaction
     */
    transaction<R>(fn: (tx: Prisma.TransactionClient) => Promise<R>): Promise<R>;
    /**
     * Paginate results
     */
    paginate(args: {
        where?: any;
        orderBy?: any;
        page: number;
        limit: number;
        select?: any;
        include?: any;
    }): Promise<{
        data: T[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
}
//# sourceMappingURL=base.repository.d.ts.map