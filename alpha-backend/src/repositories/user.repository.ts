/**
 * User Repository
 * Handles all database operations for User entity
 * Implements Data Access Layer following Repository pattern
 */

import { PrismaClient, User, UserStatus, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import logger from '../utils/logger';

export interface IUserRepository {
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findActiveUsers(args?: any): Promise<User[]>;
  updateLastLogin(userId: string): Promise<User>;
  updateStatus(userId: string, status: UserStatus): Promise<User>;
  verifyPhone(userId: string): Promise<User>;
  getUserStats(userId: string): Promise<any>;
}

export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  /**
   * Find user by phone number
   */
  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    try {
      return await this.findUnique({ phoneNumber });
    } catch (error) {
      logger.error('UserRepository.findByPhoneNumber failed', { phoneNumber, error });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.findUnique({ email });
    } catch (error) {
      logger.error('UserRepository.findByEmail failed', { email, error });
      throw error;
    }
  }

  /**
   * Find all active users
   */
  async findActiveUsers(args?: any): Promise<User[]> {
    try {
      return await this.findMany({
        where: {
          status: UserStatus.VERIFIED,
          isDeleted: false,
          ...args?.where,
        },
        ...args,
      });
    } catch (error) {
      logger.error('UserRepository.findActiveUsers failed', { error });
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<User> {
    try {
      return await this.update(userId, {
        lastLoginAt: new Date(),
      });
    } catch (error) {
      logger.error('UserRepository.updateLastLogin failed', { userId, error });
      throw error;
    }
  }

  /**
   * Update user status
   */
  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    try {
      return await this.update(userId, { status });
    } catch (error) {
      logger.error('UserRepository.updateStatus failed', { userId, status, error });
      throw error;
    }
  }

  /**
   * Verify phone number
   */
  async verifyPhone(userId: string): Promise<User> {
    try {
      return await this.update(userId, {
        status: UserStatus.VERIFIED,
        phoneVerifiedAt: new Date(),
      });
    } catch (error) {
      logger.error('UserRepository.verifyPhone failed', { userId, error });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<any> {
    try {
      // Get counts separately
      const [goalsCount, expensesCount, incomeCount, notificationsCount] = await Promise.all([
        this.prisma.financialGoal.count({ where: { userId } }),
        this.prisma.expense.count({ where: { userId } }),
        this.prisma.income.count({ where: { userId } }),
        this.prisma.notification.count({ where: { userId } }),
      ]);

      return {
        totalGoals: goalsCount,
        totalExpenses: expensesCount,
        totalIncome: incomeCount,
        totalNotifications: notificationsCount,
      };
    } catch (error) {
      logger.error('UserRepository.getUserStats failed', { userId, error });
      throw error;
    }
  }

  /**
   * Check if phone number exists
   */
  async phoneNumberExists(phoneNumber: string): Promise<boolean> {
    try {
      return await this.exists({ phoneNumber });
    } catch (error) {
      logger.error('UserRepository.phoneNumberExists failed', { phoneNumber, error });
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      return await this.exists({ email });
    } catch (error) {
      logger.error('UserRepository.emailExists failed', { email, error });
      throw error;
    }
  }

  /**
   * Search users by name
   */
  async searchByName(searchTerm: string, limit: number = 10): Promise<User[]> {
    try {
      return await this.findMany({
        where: {
          fullName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
          isDeleted: false,
        },
        take: limit,
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          status: true,
          createdAt: true,
        },
      });
    } catch (error) {
      logger.error('UserRepository.searchByName failed', { searchTerm, error });
      throw error;
    }
  }

  /**
   * Get users created within date range
   */
  async getUsersCreatedBetween(startDate: Date, endDate: Date): Promise<User[]> {
    try {
      return await this.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          isDeleted: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      logger.error('UserRepository.getUsersCreatedBetween failed', { startDate, endDate, error });
      throw error;
    }
  }

  /**
   * Get inactive users (not logged in for X days)
   */
  async getInactiveUsers(daysInactive: number): Promise<User[]> {
    try {
      const inactiveDate = new Date();
      inactiveDate.setDate(inactiveDate.getDate() - daysInactive);

      return await this.findMany({
        where: {
          OR: [
            { lastLoginAt: { lt: inactiveDate } },
            { lastLoginAt: null },
          ],
          status: UserStatus.VERIFIED,
          isDeleted: false,
        },
        orderBy: {
          lastLoginAt: 'asc',
        },
      });
    } catch (error) {
      logger.error('UserRepository.getInactiveUsers failed', { daysInactive, error });
      throw error;
    }
  }
}

// Export singleton instance
export const createUserRepository = (prisma: PrismaClient) => new UserRepository(prisma);
