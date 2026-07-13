"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const client_1 = require("@prisma/client");
const api_types_1 = require("../types/api.types");
const logger_1 = __importDefault(require("../utils/logger"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const devStore_1 = require("../utils/devStore");
const devStore = (0, devStore_1.createDevStore)();
class UserService {
    async useDevFallback(operation, fallback) {
        const forceFallback = process.env.FORCE_DEV_FALLBACK === '1' || process.env.USE_DEV_FALLBACK === '1';
        if (forceFallback && fallback) {
            return fallback();
        }
        try {
            return await operation();
        }
        catch (err) {
            const e = err;
            const msg = e?.message || '';
            if (fallback && (msg.includes('Authentication failed') || msg.includes("Can't reach database server") || msg.includes('P100'))) {
                return await fallback();
            }
            throw e;
        }
    }
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        return this.useDevFallback(async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId, deletedAt: null },
                include: {
                    profiles: {
                        where: { isCurrent: true },
                        take: 1,
                    },
                    settings: true,
                },
            });
            if (!user) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            return user;
        }, async () => {
            const user = await devStore.findUserById(userId);
            if (!user) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            return {
                id: user.id,
                phoneNumber: user.phoneNumber,
                fullName: user.fullName,
                birthDate: user.birthDate,
                passwordHash: user.passwordHash,
                status: user.status,
                isOnboarded: user.isOnboarded,
                lastLoginAt: user.lastLoginAt,
                phoneVerifiedAt: user.phoneVerifiedAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                deletedAt: null,
            };
        });
    }
    /**
     * Get user by phone number
     */
    async getUserByPhone(phoneNumber) {
        return this.useDevFallback(async () => await prisma.user.findUnique({
            where: { phoneNumber, deletedAt: null },
        }), async () => {
            const user = await devStore.findUserByPhone(phoneNumber);
            if (!user)
                return null;
            return {
                id: user.id,
                phoneNumber: user.phoneNumber,
                fullName: user.fullName,
                birthDate: user.birthDate,
                passwordHash: user.passwordHash,
                status: user.status,
                isOnboarded: user.isOnboarded,
                lastLoginAt: user.lastLoginAt,
                phoneVerifiedAt: user.phoneVerifiedAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                deletedAt: null,
            };
        });
    }
    /**
     * Get current user profile
     */
    async getCurrentProfile(userId) {
        return this.useDevFallback(async () => {
            const profile = await prisma.userProfile.findFirst({
                where: {
                    userId,
                    isCurrent: true,
                },
            });
            return profile;
        }, async () => {
            const profile = await devStore.getCurrentProfile(userId);
            if (!profile)
                return null;
            return {
                id: profile.id,
                userId: profile.userId,
                monthlyIncome: profile.monthlyIncome,
                basicExpenses: profile.basicExpenses,
                financialGoal: profile.financialGoal,
                primarySpendingCategory: profile.primarySpendingCategory,
                occupation: profile.occupation,
                educationLevel: profile.educationLevel,
                familySize: profile.familySize,
                hasEmergencyFund: profile.hasEmergencyFund,
                riskTolerance: profile.riskTolerance,
                version: profile.version,
                isCurrent: profile.isCurrent,
                changeReason: profile.changeReason,
                createdAt: profile.createdAt,
                createdBy: profile.createdBy,
            };
        });
    }
    /**
     * Get profile history (all versions)
     */
    async getProfileHistory(userId) {
        return this.useDevFallback(async () => await prisma.userProfile.findMany({
            where: { userId },
            orderBy: { version: 'desc' },
        }), async () => {
            const profiles = await devStore.listProfiles(userId);
            return profiles.map((profile) => ({
                id: profile.id,
                userId: profile.userId,
                monthlyIncome: profile.monthlyIncome,
                basicExpenses: profile.basicExpenses,
                financialGoal: profile.financialGoal,
                primarySpendingCategory: profile.primarySpendingCategory,
                occupation: profile.occupation,
                educationLevel: profile.educationLevel,
                familySize: profile.familySize,
                hasEmergencyFund: profile.hasEmergencyFund,
                riskTolerance: profile.riskTolerance,
                version: profile.version,
                isCurrent: profile.isCurrent,
                changeReason: profile.changeReason,
                createdAt: profile.createdAt,
                createdBy: profile.createdBy,
            }));
        });
    }
    /**
     * Update user profile (creates new version)
     */
    async updateProfile(params) {
        const { userId, changeReason, ...profileData } = params;
        return this.useDevFallback(async () => {
            const currentProfile = await this.getCurrentProfile(userId);
            if (!currentProfile) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'الملف الشخصي غير موجود',
                };
            }
            await prisma.userProfile.update({
                where: { id: currentProfile.id },
                data: { isCurrent: false },
            });
            const newProfile = await prisma.userProfile.create({
                data: {
                    userId,
                    monthlyIncome: profileData.monthlyIncome ?? currentProfile.monthlyIncome,
                    basicExpenses: profileData.basicExpenses ?? currentProfile.basicExpenses,
                    financialGoal: profileData.financialGoal ?? currentProfile.financialGoal,
                    primarySpendingCategory: profileData.primarySpendingCategory ?? currentProfile.primarySpendingCategory,
                    occupation: profileData.occupation ?? currentProfile.occupation,
                    educationLevel: profileData.educationLevel ?? currentProfile.educationLevel,
                    familySize: profileData.familySize ?? currentProfile.familySize,
                    hasEmergencyFund: profileData.hasEmergencyFund ?? currentProfile.hasEmergencyFund,
                    riskTolerance: profileData.riskTolerance ?? currentProfile.riskTolerance,
                    version: currentProfile.version + 1,
                    isCurrent: true,
                    changeReason,
                    createdBy: userId,
                },
            });
            await this.createAuditLog({
                userId,
                action: 'UPDATE',
                entityType: 'UserProfile',
                entityId: newProfile.id,
                oldValues: currentProfile,
                newValues: newProfile,
            });
            logger_1.default.info('User profile updated', {
                userId,
                version: newProfile.version,
                changeReason,
            });
            return newProfile;
        }, async () => {
            const currentProfile = await devStore.getCurrentProfile(userId);
            const nextVersion = currentProfile ? currentProfile.version + 1 : 1;
            const newProfile = await devStore.createProfile({
                userId,
                monthlyIncome: profileData.monthlyIncome,
                basicExpenses: profileData.basicExpenses,
                financialGoal: profileData.financialGoal ?? currentProfile?.financialGoal,
                primarySpendingCategory: profileData.primarySpendingCategory ?? currentProfile?.primarySpendingCategory,
                occupation: profileData.occupation ?? currentProfile?.occupation,
                educationLevel: profileData.educationLevel ?? currentProfile?.educationLevel,
                familySize: profileData.familySize ?? currentProfile?.familySize,
                hasEmergencyFund: profileData.hasEmergencyFund ?? currentProfile?.hasEmergencyFund,
                riskTolerance: profileData.riskTolerance ?? currentProfile?.riskTolerance,
                version: nextVersion,
                isCurrent: true,
                changeReason,
                createdBy: userId,
            });
            return {
                id: newProfile.id,
                userId: newProfile.userId,
                monthlyIncome: newProfile.monthlyIncome,
                basicExpenses: newProfile.basicExpenses,
                financialGoal: newProfile.financialGoal,
                primarySpendingCategory: newProfile.primarySpendingCategory,
                occupation: newProfile.occupation,
                educationLevel: newProfile.educationLevel,
                familySize: newProfile.familySize,
                hasEmergencyFund: newProfile.hasEmergencyFund,
                riskTolerance: newProfile.riskTolerance,
                version: newProfile.version,
                isCurrent: newProfile.isCurrent,
                changeReason: newProfile.changeReason,
                createdAt: newProfile.createdAt,
                createdBy: newProfile.createdBy,
            };
        });
    }
    /**
     * Update basic user information
     */
    async updateUser(userId, params) {
        const { fullName, birthDate } = params;
        return this.useDevFallback(async () => {
            const updateData = {};
            if (fullName)
                updateData.fullName = fullName;
            if (birthDate)
                updateData.birthDate = new Date(birthDate);
            const oldUser = await prisma.user.findUnique({
                where: { id: userId },
            });
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: updateData,
            });
            await this.createAuditLog({
                userId,
                action: 'UPDATE',
                entityType: 'User',
                entityId: userId,
                oldValues: { fullName: oldUser?.fullName, birthDate: oldUser?.birthDate },
                newValues: { fullName: updatedUser.fullName, birthDate: updatedUser.birthDate },
            });
            logger_1.default.info('User information updated', { userId });
            return updatedUser;
        }, async () => {
            const currentUser = await devStore.findUserById(userId);
            if (!currentUser) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            const updatedUser = await devStore.updateUserById(userId, {
                ...(fullName ? { fullName } : {}),
                ...(birthDate ? { birthDate: new Date(birthDate) } : {}),
            });
            if (!updatedUser) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            return {
                id: updatedUser.id,
                phoneNumber: updatedUser.phoneNumber,
                fullName: updatedUser.fullName,
                birthDate: updatedUser.birthDate,
                passwordHash: updatedUser.passwordHash,
                status: updatedUser.status,
                isOnboarded: updatedUser.isOnboarded,
                lastLoginAt: updatedUser.lastLoginAt,
                phoneVerifiedAt: updatedUser.phoneVerifiedAt,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
                deletedAt: null,
            };
        });
    }
    /**
     * Get user settings
     */
    async getSettings(userId) {
        return this.useDevFallback(async () => {
            let settings = await prisma.userSettings.findUnique({
                where: { userId },
            });
            if (!settings) {
                settings = await this.createDefaultSettings(userId);
            }
            return settings;
        }, async () => {
            const settings = await devStore.getSettings(userId);
            if (settings) {
                return settings;
            }
            const created = await devStore.upsertSettings(userId, {});
            return created;
        });
    }
    /**
     * Update user settings
     */
    async updateSettings(userId, settingsData) {
        return this.useDevFallback(async () => {
            await this.getSettings(userId);
            const updatedSettings = await prisma.userSettings.update({
                where: { userId },
                data: settingsData,
            });
            logger_1.default.info('User settings updated', { userId });
            return updatedSettings;
        }, async () => {
            const updatedSettings = await devStore.upsertSettings(userId, settingsData);
            logger_1.default.info('User settings updated (dev fallback)', { userId });
            return updatedSettings;
        });
    }
    /**
     * Create default settings for user
     */
    async createDefaultSettings(userId) {
        return await prisma.userSettings.create({
            data: {
                userId,
                notificationsEnabled: true,
                emailNotifications: false,
                pushNotifications: true,
                smsNotifications: true,
                weeklySummary: true,
                monthlySummary: true,
                spendingAlerts: true,
                goalReminders: true,
                language: 'ar',
                currency: 'JOD',
                timezone: 'Asia/Amman',
                theme: 'light',
                dataSharing: false,
                analyticsOptIn: true,
                marketingOptIn: false,
                twoFactorEnabled: false,
                sessionTimeout: 30,
                defaultBudgetPeriod: 'MONTHLY',
                budgetAlertThreshold: 80,
            },
        });
    }
    /**
     * Change user password
     */
    async changePassword(params) {
        const { userId, currentPassword, newPassword } = params;
        return this.useDevFallback(async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            const passwordMatch = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
            if (!passwordMatch) {
                throw {
                    code: api_types_1.ErrorCodes.INVALID_CREDENTIALS,
                    message: 'كلمة المرور الحالية غير صحيحة',
                };
            }
            const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
            await prisma.user.update({
                where: { id: userId },
                data: { passwordHash },
            });
            await this.createAuditLog({
                userId,
                action: 'RESET_PASSWORD',
                entityType: 'User',
                entityId: userId,
            });
            logger_1.default.info('Password changed successfully', { userId });
            return {
                message: 'تم تغيير كلمة المرور بنجاح',
            };
        }, async () => {
            const user = await devStore.findUserById(userId);
            if (!user) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            const passwordMatch = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
            if (!passwordMatch) {
                throw {
                    code: api_types_1.ErrorCodes.INVALID_CREDENTIALS,
                    message: 'كلمة المرور الحالية غير صحيحة',
                };
            }
            const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
            await devStore.updateUserById(userId, { passwordHash });
            logger_1.default.info('Password changed successfully (dev fallback)', { userId });
            return {
                message: 'تم تغيير كلمة المرور بنجاح',
            };
        });
    }
    /**
     * Soft delete user account
     */
    async deleteAccount(userId, password) {
        return this.useDevFallback(async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            const passwordMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!passwordMatch) {
                throw {
                    code: api_types_1.ErrorCodes.INVALID_CREDENTIALS,
                    message: 'كلمة المرور غير صحيحة',
                };
            }
            await prisma.user.update({
                where: { id: userId },
                data: {
                    deletedAt: new Date(),
                    status: 'DELETED',
                },
            });
            await Promise.all([
                prisma.financialGoal.updateMany({
                    where: { userId },
                    data: { deletedAt: new Date() },
                }),
                prisma.expense.updateMany({
                    where: { userId },
                    data: { deletedAt: new Date() },
                }),
                prisma.income.updateMany({
                    where: { userId },
                    data: { deletedAt: new Date() },
                }),
            ]);
            await prisma.userSession.updateMany({
                where: { userId },
                data: {
                    isActive: false,
                    isRevoked: true,
                    revokedAt: new Date(),
                    revokeReason: 'Account deleted',
                },
            });
            await this.createAuditLog({
                userId,
                action: 'DELETE',
                entityType: 'User',
                entityId: userId,
            });
            logger_1.default.info('User account deleted', { userId });
            return {
                message: 'تم حذف الحساب بنجاح',
            };
        }, async () => {
            const user = await devStore.findUserById(userId);
            if (!user) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            const passwordMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!passwordMatch) {
                throw {
                    code: api_types_1.ErrorCodes.INVALID_CREDENTIALS,
                    message: 'كلمة المرور غير صحيحة',
                };
            }
            await devStore.updateUserById(userId, { status: 'DELETED' });
            logger_1.default.info('User account deleted (dev fallback)', { userId });
            return {
                message: 'تم حذف الحساب بنجاح',
            };
        });
    }
    /**
     * Get user statistics
     */
    async getUserStats(userId) {
        return this.useDevFallback(async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            const [totalGoals, activeGoals, completedGoals, expenses, income, goalTransactions,] = await Promise.all([
                prisma.financialGoal.count({
                    where: { userId, deletedAt: null },
                }),
                prisma.financialGoal.count({
                    where: { userId, status: 'ACTIVE', deletedAt: null },
                }),
                prisma.financialGoal.count({
                    where: { userId, status: 'COMPLETED', deletedAt: null },
                }),
                prisma.expense.aggregate({
                    where: { userId, deletedAt: null },
                    _sum: { amount: true },
                    _count: true,
                }),
                prisma.income.aggregate({
                    where: { userId, deletedAt: null },
                    _sum: { amount: true },
                }),
                prisma.goalTransaction.aggregate({
                    where: { userId, transactionType: 'DEPOSIT' },
                    _sum: { amount: true },
                }),
            ]);
            const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            return {
                totalGoals,
                activeGoals,
                completedGoals,
                totalExpenses: Number(expenses._sum.amount || 0),
                totalIncome: Number(income._sum.amount || 0),
                totalSaved: Number(goalTransactions._sum.amount || 0),
                accountAge,
            };
        }, async () => {
            const user = await devStore.findUserById(userId);
            if (!user) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'المستخدم غير موجود',
                };
            }
            const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            return {
                totalGoals: 0,
                activeGoals: 0,
                completedGoals: 0,
                totalExpenses: 0,
                totalIncome: 0,
                totalSaved: 0,
                accountAge,
            };
        });
    }
    /**
     * Create audit log entry
     */
    async createAuditLog(data) {
        try {
            await prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    entityType: data.entityType,
                    entityId: data.entityId,
                    oldValues: data.oldValues,
                    newValues: data.newValues,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to create audit log', { error });
        }
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
//# sourceMappingURL=user.service.js.map