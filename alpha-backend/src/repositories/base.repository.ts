/**
 * Base Repository
 * Provides common database operations following Repository pattern
 * Implements generic CRUD operations with soft delete support
 */

import { PrismaClient, Prisma } from '@prisma/client';
import logger from '../utils/logger';

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findMany(args?: any): Promise<T[]>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<T>;
  softDelete(id: string): Promise<T>;
  count(args?: any): Promise<number>;
}

export abstract class BaseRepository<T> implements IRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Get model delegate from Prisma client
   */
  protected getModel(): any {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      return await this.getModel().findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error(`${this.modelName}.findById failed`, { id, error });
      throw error;
    }
  }

  /**
   * Find entity by unique field
   */
  async findUnique(where: any): Promise<T | null> {
    try {
      return await this.getModel().findUnique({ where });
    } catch (error) {
      logger.error(`${this.modelName}.findUnique failed`, { where, error });
      throw error;
    }
  }

  /**
   * Find first matching entity
   */
  async findFirst(args: any): Promise<T | null> {
    try {
      return await this.getModel().findFirst(args);
    } catch (error) {
      logger.error(`${this.modelName}.findFirst failed`, { args, error });
      throw error;
    }
  }

  /**
   * Find many entities
   */
  async findMany(args?: any): Promise<T[]> {
    try {
      return await this.getModel().findMany(args);
    } catch (error) {
      logger.error(`${this.modelName}.findMany failed`, { args, error });
      throw error;
    }
  }

  /**
   * Create new entity
   */
  async create(data: any): Promise<T> {
    try {
      return await this.getModel().create({ data });
    } catch (error) {
      logger.error(`${this.modelName}.create failed`, { data, error });
      throw error;
    }
  }

  /**
   * Update entity
   */
  async update(id: string, data: any): Promise<T> {
    try {
      return await this.getModel().update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error(`${this.modelName}.update failed`, { id, data, error });
      throw error;
    }
  }

  /**
   * Update many entities
   */
  async updateMany(args: any): Promise<{ count: number }> {
    try {
      return await this.getModel().updateMany(args);
    } catch (error) {
      logger.error(`${this.modelName}.updateMany failed`, { args, error });
      throw error;
    }
  }

  /**
   * Delete entity (hard delete)
   */
  async delete(id: string): Promise<T> {
    try {
      return await this.getModel().delete({
        where: { id },
      });
    } catch (error) {
      logger.error(`${this.modelName}.delete failed`, { id, error });
      throw error;
    }
  }

  /**
   * Soft delete entity
   */
  async softDelete(id: string): Promise<T> {
    try {
      return await this.getModel().update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isDeleted: true,
        },
      });
    } catch (error) {
      logger.error(`${this.modelName}.softDelete failed`, { id, error });
      throw error;
    }
  }

  /**
   * Count entities
   */
  async count(args?: any): Promise<number> {
    try {
      return await this.getModel().count(args);
    } catch (error) {
      logger.error(`${this.modelName}.count failed`, { args, error });
      throw error;
    }
  }

  /**
   * Check if entity exists
   */
  async exists(where: any): Promise<boolean> {
    try {
      const count = await this.getModel().count({ where });
      return count > 0;
    } catch (error) {
      logger.error(`${this.modelName}.exists failed`, { where, error });
      throw error;
    }
  }

  /**
   * Execute transaction
   */
  async transaction<R>(fn: (tx: Prisma.TransactionClient) => Promise<R>): Promise<R> {
    try {
      return await this.prisma.$transaction(fn);
    } catch (error) {
      logger.error(`${this.modelName}.transaction failed`, { error });
      throw error;
    }
  }

  /**
   * Paginate results
   */
  async paginate(args: {
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
  }> {
    try {
      const { where, orderBy, page, limit, select, include } = args;
      
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.getModel().findMany({
          where,
          orderBy,
          skip,
          take: limit,
          select,
          include,
        }),
        this.getModel().count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error(`${this.modelName}.paginate failed`, { args, error });
      throw error;
    }
  }
}
