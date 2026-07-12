"use strict";
/**
 * User Repository
 * Handles all database operations for User entity
 * Implements Data Access Layer following Repository pattern
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserRepository = exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
const base_repository_1 = require("./base.repository");
const logger_1 = __importDefault(require("../utils/logger"));
class UserRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma, 'user');
    }
    /**
     * Find user by phone number
     */
    async findByPhoneNumber(phoneNumber) {
        try {
            return await this.findUnique({ phoneNumber });
        }
        catch (error) {
            logger_1.default.error('UserRepository.findByPhoneNumber failed', { phoneNumber, error });
            throw error;
        }
    }
    /**
     * Find user by email
     */
    async findByEmail(email) {
        try {
            return await this.findUnique({ email });
        }
        catch (error) {
            logger_1.default.error('UserRepository.findByEmail failed', { email, error });
            throw error;
        }
    }
    /**
     * Find all active users
     */
    async findActiveUsers(args) {
        try {
            return await this.findMany({
                where: {
                    status: client_1.UserStatus.VERIFIED,
                    isDeleted: false,
                    ...args?.where,
                },
                ...args,
            });
        }
        catch (error) {
            logger_1.default.error('UserRepository.findActiveUsers failed', { error });
            throw error;
        }
    }
    /**
     * Update last login timestamp
     */
    async updateLastLogin(userId) {
        try {
            return await this.update(userId, {
                lastLoginAt: new Date(),
            });
        }
        catch (error) {
            logger_1.default.error('UserRepository.updateLastLogin failed', { userId, error });
            throw error;
        }
    }
    /**
     * Update user status
     */
    async updateStatus(userId, status) {
        try {
            return await this.update(userId, { status });
        }
        catch (error) {
            logger_1.default.error('UserRepository.updateStatus failed', { userId, status, error });
            throw error;
        }
    }
    /**
     * Verify phone number
     */
    async verifyPhone(userId) {
        try {
            return await this.update(userId, {
                status: client_1.UserStatus.VERIFIED,
                phoneVerifiedAt: new Date(),
            });
        }
        catch (error) {
            logger_1.default.error('UserRepository.verifyPhone failed', { userId, error });
            throw error;
        }
    }
    /**
     * Get user statistics
     */
    async getUserStats(userId) {
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
        }
        catch (error) {
            logger_1.default.error('UserRepository.getUserStats failed', { userId, error });
            throw error;
        }
    }
    /**
     * Check if phone number exists
     */
    async phoneNumberExists(phoneNumber) {
        try {
            return await this.exists({ phoneNumber });
        }
        catch (error) {
            logger_1.default.error('UserRepository.phoneNumberExists failed', { phoneNumber, error });
            throw error;
        }
    }
    /**
     * Check if email exists
     */
    async emailExists(email) {
        try {
            return await this.exists({ email });
        }
        catch (error) {
            logger_1.default.error('UserRepository.emailExists failed', { email, error });
            throw error;
        }
    }
    /**
     * Search users by name
     */
    async searchByName(searchTerm, limit = 10) {
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
        }
        catch (error) {
            logger_1.default.error('UserRepository.searchByName failed', { searchTerm, error });
            throw error;
        }
    }
    /**
     * Get users created within date range
     */
    async getUsersCreatedBetween(startDate, endDate) {
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
        }
        catch (error) {
            logger_1.default.error('UserRepository.getUsersCreatedBetween failed', { startDate, endDate, error });
            throw error;
        }
    }
    /**
     * Get inactive users (not logged in for X days)
     */
    async getInactiveUsers(daysInactive) {
        try {
            const inactiveDate = new Date();
            inactiveDate.setDate(inactiveDate.getDate() - daysInactive);
            return await this.findMany({
                where: {
                    OR: [
                        { lastLoginAt: { lt: inactiveDate } },
                        { lastLoginAt: null },
                    ],
                    status: client_1.UserStatus.VERIFIED,
                    isDeleted: false,
                },
                orderBy: {
                    lastLoginAt: 'asc',
                },
            });
        }
        catch (error) {
            logger_1.default.error('UserRepository.getInactiveUsers failed', { daysInactive, error });
            throw error;
        }
    }
}
exports.UserRepository = UserRepository;
// Export singleton instance
const createUserRepository = (prisma) => new UserRepository(prisma);
exports.createUserRepository = createUserRepository;
//# sourceMappingURL=user.repository.js.map