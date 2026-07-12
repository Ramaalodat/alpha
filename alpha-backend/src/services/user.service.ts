import { PrismaClient, User, UserProfile, UserSettings } from '@prisma/client';
import { ErrorCodes } from '../types/api.types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import logger from '../utils/logger';
import bcrypt from 'bcryptjs';
import { createDevStore } from '../utils/devStore';

const prisma = new PrismaClient();
const devStore = createDevStore();

interface UpdateProfileParams {
  userId: string;
  monthlyIncome?: number;
  basicExpenses?: number;
  financialGoal?: string;
  primarySpendingCategory?: string;
  occupation?: string;
  educationLevel?: string;
  familySize?: number;
  hasEmergencyFund?: boolean;
  riskTolerance?: string;
  changeReason?: string;
}

interface UpdateUserParams {
  fullName?: string;
  birthDate?: string;
}

interface UpdatePasswordParams {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  private async useDevFallback<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      const shouldUseFallback = /Can't reach database server|database server|ECONNREFUSED|P1001|P1000|Connection refused/i.test(message);
      if (shouldUseFallback) {
        logger.warn('Using local user fallback store', { reason: message });
        return fallback();
      }
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.useDevFallback(
      async () => {
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
            code: ErrorCodes.NOT_FOUND,
            message: 'المستخدم غير موجود',
          };
        }

        return user;
      },
      async () => {
        const user = await devStore.findUserById(userId);
        if (!user) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'المستخدم غير موجود',
          };
        }

        return {
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          birthDate: user.birthDate,
          passwordHash: user.passwordHash,
          status: user.status as any,
          isOnboarded: user.isOnboarded,
          lastLoginAt: user.lastLoginAt,
          phoneVerifiedAt: user.phoneVerifiedAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deletedAt: null,
        } as User;
      }
    );
  }

  /**
   * Get user by phone number
   */
  async getUserByPhone(phoneNumber: string): Promise<User | null> {
    return this.useDevFallback(
      async () => await prisma.user.findUnique({
        where: { phoneNumber, deletedAt: null },
      }),
      async () => {
        const user = await devStore.findUserByPhone(phoneNumber);
        if (!user) return null;
        return {
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          birthDate: user.birthDate,
          passwordHash: user.passwordHash,
          status: user.status as any,
          isOnboarded: user.isOnboarded,
          lastLoginAt: user.lastLoginAt,
          phoneVerifiedAt: user.phoneVerifiedAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deletedAt: null,
        } as User;
      }
    );
  }

  /**
   * Get current user profile
   */
  async getCurrentProfile(userId: string): Promise<UserProfile | null> {
    return this.useDevFallback(
      async () => {
        const profile = await prisma.userProfile.findFirst({
          where: {
            userId,
            isCurrent: true,
          },
        });

        return profile;
      },
      async () => {
        const profile = await devStore.getCurrentProfile(userId);
        if (!profile) return null;
        return {
          id: profile.id,
          userId: profile.userId,
          monthlyIncome: profile.monthlyIncome as any,
          basicExpenses: profile.basicExpenses as any,
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
        } as UserProfile;
      }
    );
  }

  /**
   * Get profile history (all versions)
   */
  async getProfileHistory(userId: string): Promise<UserProfile[]> {
    return this.useDevFallback(
      async () => await prisma.userProfile.findMany({
        where: { userId },
        orderBy: { version: 'desc' },
      }),
      async () => {
        const profiles = await devStore.listProfiles(userId);
        return profiles.map((profile) => ({
          id: profile.id,
          userId: profile.userId,
          monthlyIncome: profile.monthlyIncome as any,
          basicExpenses: profile.basicExpenses as any,
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
        } as UserProfile));
      }
    );
  }

  /**
   * Update user profile (creates new version)
   */
  async updateProfile(params: UpdateProfileParams): Promise<UserProfile> {
    const { userId, changeReason, ...profileData } = params;

    return this.useDevFallback(
      async () => {
        const currentProfile = await this.getCurrentProfile(userId);

        if (!currentProfile) {
          throw {
            code: ErrorCodes.NOT_FOUND,
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

        logger.info('User profile updated', {
          userId,
          version: newProfile.version,
          changeReason,
        });

        return newProfile;
      },
      async () => {
        const currentProfile = await devStore.getCurrentProfile(userId);
        const nextVersion = currentProfile ? currentProfile.version + 1 : 1;
        const newProfile = await devStore.createProfile({
          userId,
          monthlyIncome: profileData.monthlyIncome as number | undefined,
          basicExpenses: profileData.basicExpenses as number | undefined,
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
          monthlyIncome: newProfile.monthlyIncome as any,
          basicExpenses: newProfile.basicExpenses as any,
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
        } as UserProfile;
      }
    );
  }

  /**
   * Update basic user information
   */
  async updateUser(userId: string, params: UpdateUserParams): Promise<User> {
    const { fullName, birthDate } = params;

    return this.useDevFallback(
      async () => {
        const updateData: any = {};
        if (fullName) updateData.fullName = fullName;
        if (birthDate) updateData.birthDate = new Date(birthDate);

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

        logger.info('User information updated', { userId });

        return updatedUser;
      },
      async () => {
        const currentUser = await devStore.findUserById(userId);
        if (!currentUser) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'المستخدم غير موجود',
          };
        }

        const updatedUser = await devStore.updateUserById(userId, {
          ...(fullName ? { fullName } : {}),
          ...(birthDate ? { birthDate: new Date(birthDate) } : {}),
        });

        if (!updatedUser) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'المستخدم غير موجود',
          };
        }

        return {
          id: updatedUser.id,
          phoneNumber: updatedUser.phoneNumber,
          fullName: updatedUser.fullName,
          birthDate: updatedUser.birthDate,
          passwordHash: updatedUser.passwordHash,
          status: updatedUser.status as any,
          isOnboarded: updatedUser.isOnboarded,
          lastLoginAt: updatedUser.lastLoginAt,
          phoneVerifiedAt: updatedUser.phoneVerifiedAt,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
          deletedAt: null,
        } as User;
      }
    );
  }

  /**
   * Get user settings
   */
  async getSettings(userId: string): Promise<UserSettings> {
    return this.useDevFallback(
      async () => {
        let settings = await prisma.userSettings.findUnique({
          where: { userId },
        });

        if (!settings) {
          settings = await this.createDefaultSettings(userId);
        }

        return settings;
      },
      async () => {
        const settings = await devStore.getSettings(userId);
        if (settings) {
          return settings as UserSettings;
        }
        const created = await devStore.upsertSettings(userId, {});
        return created as UserSettings;
      }
    );
  }

  /**
   * Update user settings
   */
  async updateSettings(userId: string, settingsData: Partial<UserSettings>): Promise<UserSettings> {
    return this.useDevFallback(
      async () => {
        await this.getSettings(userId);

        const updatedSettings = await prisma.userSettings.update({
          where: { userId },
          data: settingsData,
        });

        logger.info('User settings updated', { userId });

        return updatedSettings;
      },
      async () => {
        const updatedSettings = await devStore.upsertSettings(userId, settingsData as any);
        logger.info('User settings updated (dev fallback)', { userId });
        return updatedSettings as UserSettings;
      }
    );
  }

  /**
   * Create default settings for user
   */
  private async createDefaultSettings(userId: string): Promise<UserSettings> {
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
  async changePassword(params: UpdatePasswordParams): Promise<{ message: string }> {
    const { userId, currentPassword, newPassword } = params;

    return this.useDevFallback(
      async () => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'المستخدم غير موجود',
          };
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!passwordMatch) {
          throw {
            code: ErrorCodes.INVALID_CREDENTIALS,
            message: 'كلمة المرور الحالية غير صحيحة',
          };
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

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

        logger.info('Password changed successfully', { userId });

        return {
          message: 'تم تغيير كلمة المرور بنجاح',
        };
      },
      async () => {
        const user = await devStore.findUserById(userId);
        if (!user) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'المستخدم غير موجود',
          };
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!passwordMatch) {
          throw {
            code: ErrorCodes.INVALID_CREDENTIALS,
            message: 'كلمة المرور الحالية غير صحيحة',
          };
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await devStore.updateUserById(userId, { passwordHash });

        logger.info('Password changed successfully (dev fallback)', { userId });

        return {
          message: 'تم تغيير كلمة المرور بنجاح',
        };
      }
    );
  }

  /**
   * Soft delete user account
   */
  async deleteAccount(userId: string, password: string): Promise<{ message: string }> {
    return this.useDevFallback(
      async () => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'المستخدم غير موجود',
          };
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
          throw {
            code: ErrorCodes.INVALID_CREDENTIALS,
            message: 'كلمة المرور غير صحيحة',
          };
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            deletedAt: new Date(),
            status: 'DELETED' as any,
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

        logger.info('User account deleted', { userId });

        return {
          message: 'تم حذف الحساب بنجاح',
        };
      },
      async () => {
        const user = await devStore.findUserById(userId);
        if (!user) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'المستخدم غير موجود',
          };
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
          throw {
            code: ErrorCodes.INVALID_CREDENTIALS,
            message: 'كلمة المرور غير صحيحة',
          };
        }

        await devStore.updateUserById(userId, { status: 'DELETED' as any });
        logger.info('User account deleted (dev fallback)', { userId });

        return {
          message: 'تم حذف الحساب بنجاح',
        };
      }
    );
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalExpenses: number;
    totalIncome: number;
    totalSaved: number;
    accountAge: number;
  }> {
    return this.useDevFallback(
      async () => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'المستخدم غير موجود',
          };
        }

        const [
          totalGoals,
          activeGoals,
          completedGoals,
          expenses,
          income,
          goalTransactions,
        ] = await Promise.all([
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

        const accountAge = Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          totalGoals,
          activeGoals,
          completedGoals,
          totalExpenses: Number(expenses._sum.amount || 0),
          totalIncome: Number(income._sum.amount || 0),
          totalSaved: Number(goalTransactions._sum.amount || 0),
          accountAge,
        };
      },
      async () => {
        const user = await devStore.findUserById(userId);
        if (!user) {
          throw {
            code: ErrorCodes.NOT_FOUND,
            message: 'المستخدم غير موجود',
          };
        }

        const accountAge = Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          totalGoals: 0,
          activeGoals: 0,
          completedGoals: 0,
          totalExpenses: 0,
          totalIncome: 0,
          totalSaved: 0,
          accountAge,
        };
      }
    );
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action as any,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValues: data.oldValues,
          newValues: data.newValues,
        },
      });
    } catch (error) {
      logger.error('Failed to create audit log', { error });
    }
  }
}

export const userService = new UserService();
