/**
 * User Repository
 * Handles all database operations for User entity
 * Implements Data Access Layer following Repository pattern
 */
import { PrismaClient, User, UserStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';
export interface IUserRepository {
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findActiveUsers(args?: any): Promise<User[]>;
    updateLastLogin(userId: string): Promise<User>;
    updateStatus(userId: string, status: UserStatus): Promise<User>;
    verifyPhone(userId: string): Promise<User>;
    getUserStats(userId: string): Promise<any>;
}
export declare class UserRepository extends BaseRepository<User> implements IUserRepository {
    constructor(prisma: PrismaClient);
    /**
     * Find user by phone number
     */
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    /**
     * Find user by email
     */
    findByEmail(email: string): Promise<User | null>;
    /**
     * Find all active users
     */
    findActiveUsers(args?: any): Promise<User[]>;
    /**
     * Update last login timestamp
     */
    updateLastLogin(userId: string): Promise<User>;
    /**
     * Update user status
     */
    updateStatus(userId: string, status: UserStatus): Promise<User>;
    /**
     * Verify phone number
     */
    verifyPhone(userId: string): Promise<User>;
    /**
     * Get user statistics
     */
    getUserStats(userId: string): Promise<any>;
    /**
     * Check if phone number exists
     */
    phoneNumberExists(phoneNumber: string): Promise<boolean>;
    /**
     * Check if email exists
     */
    emailExists(email: string): Promise<boolean>;
    /**
     * Search users by name
     */
    searchByName(searchTerm: string, limit?: number): Promise<User[]>;
    /**
     * Get users created within date range
     */
    getUsersCreatedBetween(startDate: Date, endDate: Date): Promise<User[]>;
    /**
     * Get inactive users (not logged in for X days)
     */
    getInactiveUsers(daysInactive: number): Promise<User[]>;
}
export declare const createUserRepository: (prisma: PrismaClient) => UserRepository;
//# sourceMappingURL=user.repository.d.ts.map