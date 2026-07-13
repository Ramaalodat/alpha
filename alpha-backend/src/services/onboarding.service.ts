import { PrismaClient, UserProfile, FinancialGoal } from '@prisma/client';
import { ErrorCodes } from '../types/api.types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { OnboardingFinancialInfo, OnboardingStatus } from '../types/user.types';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface CompleteFinancialInfoParams {
  userId: string;
  monthlyIncome: number;
  basicExpenses: number;
  financialGoal: string;
  primarySpendingCategory: string;
}

interface CreateFirstGoalParams {
  userId: string;
  icon: string;
  name: string;
  targetAmount: number;
  targetDate: string; // ISO date string
}

export class OnboardingService {
  /**
   * Get onboarding status for user
   */
  async getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
    // Check if user exists and is verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: {
          where: { isCurrent: true },
          take: 1,
        },
        goals: {
          where: { deletedAt: null },
          take: 1,
        },
      },
    });

    if (!user) {
      throw {
        code: ErrorCodes.NOT_FOUND,
        message: 'المستخدم غير موجود',
      };
    }

    // Check onboarding steps
    const hasFinancialInfo = user.profiles.length > 0;
    const hasFirstGoal = user.goals.length > 0;
    const isCompleted = user.isOnboarded;

    // Determine next step
    let nextStep: 'financial_info' | 'first_goal' | null = null;
    if (!hasFinancialInfo) {
      nextStep = 'financial_info';
    } else if (!hasFirstGoal) {
      nextStep = 'first_goal';
    }

    return {
      isCompleted,
      steps: {
        financialInfo: hasFinancialInfo,
        firstGoal: hasFirstGoal,
      },
      nextStep,
    };
  }

  /**
   * Complete financial information step
   */
  async completeFinancialInfo(params: CompleteFinancialInfoParams): Promise<{
    profile: UserProfile;
    message: string;
  }> {
    const { userId, monthlyIncome, basicExpenses, financialGoal, primarySpendingCategory } = params;

    // Check if user already has a profile
    const existingProfile = await prisma.userProfile.findFirst({
      where: { userId, isCurrent: true },
    });

    if (existingProfile) {
      throw {
        code: ErrorCodes.CONFLICT,
        message: 'تم إكمال هذه الخطوة مسبقاً',
      };
    }

    // Validate financial data
    if (monthlyIncome <= 0 || basicExpenses < 0) {
      throw {
        code: ErrorCodes.INVALID_AMOUNT,
        message: ERROR_MESSAGES.INVALID_AMOUNT,
      };
    }

    if (basicExpenses > monthlyIncome) {
      logger.warn('Basic expenses exceed monthly income', {
        userId,
        monthlyIncome,
        basicExpenses,
      });
      // This is a warning, not an error - user might have other income sources
    }

    // Create user profile
    const profile = await prisma.userProfile.create({
      data: {
        userId,
        monthlyIncome,
        basicExpenses,
        financialGoal,
        primarySpendingCategory,
        version: 1,
        isCurrent: true,
        createdBy: userId,
      },
    });

    // Create default settings if not exists
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!existingSettings) {
      await prisma.userSettings.create({
        data: {
          userId,
          // Default settings (as defined in constants)
          notificationsEnabled: true,
          pushNotifications: true,
          smsNotifications: true,
          weeklySummary: true,
          spendingAlerts: true,
          language: 'ar',
          currency: 'JOD',
          timezone: 'Asia/Amman',
        },
      });
    }

    // Create audit log
    await this.createAuditLog({
      userId,
      action: 'CREATE',
      entityType: 'UserProfile',
      entityId: profile.id,
      newValues: profile,
    });

    logger.info('Financial information completed', { userId, profileId: profile.id });

    return {
      profile,
      message: 'تم حفظ المعلومات المالية بنجاح',
    };
  }

  /**
   * Create first goal and complete onboarding
   */
  async createFirstGoal(params: CreateFirstGoalParams): Promise<{
    goal: FinancialGoal;
    message: string;
  }> {
    const { userId, icon, name, targetAmount, targetDate } = params;

    // Check if user has completed financial info step
    const profile = await prisma.userProfile.findFirst({
      where: { userId, isCurrent: true },
    });

    if (!profile) {
      throw {
        code: ErrorCodes.ONBOARDING_INCOMPLETE,
        message: 'يجب إكمال المعلومات المالية أولاً',
      };
    }

    // Check if user already has a goal
    const existingGoal = await prisma.financialGoal.findFirst({
      where: { userId, deletedAt: null },
    });

    if (existingGoal) {
      throw {
        code: ErrorCodes.CONFLICT,
        message: 'تم إنشاء هدف مسبقاً',
      };
    }

    // Validate goal data
    if (targetAmount <= 0) {
      throw {
        code: ErrorCodes.INVALID_AMOUNT,
        message: ERROR_MESSAGES.INVALID_AMOUNT,
      };
    }

    const targetDateObj = new Date(targetDate);
    if (targetDateObj <= new Date()) {
      throw {
        code: ErrorCodes.INVALID_DATE_RANGE,
        message: 'يجب أن يكون التاريخ المستهدف في المستقبل',
      };
    }

    // Create financial goal
    const goal = await prisma.financialGoal.create({
      data: {
        userId,
        icon,
        name,
        targetAmount,
        targetDate: targetDateObj,
        currentAmount: 0,
        status: 'ACTIVE',
        progressPercentage: 0,
      },
    });

    // Mark user as onboarded
    await prisma.user.update({
      where: { id: userId },
      data: { isOnboarded: true },
    });

    // Create audit log for goal
    await this.createAuditLog({
      userId,
      action: 'CREATE',
      entityType: 'FinancialGoal',
      entityId: goal.id,
      newValues: goal,
    });

    // Create audit log for onboarding completion
    await this.createAuditLog({
      userId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: userId,
      newValues: { isOnboarded: true },
    });

    logger.info('First goal created - onboarding completed', {
      userId,
      goalId: goal.id,
    });

    return {
      goal,
      message: 'تم إنشاء الهدف المالي بنجاح. مرحباً بك في BASIRA!',
    };
  }

  /**
   * Skip onboarding and mark as complete (optional feature)
   */
  async skipOnboarding(userId: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw {
        code: ErrorCodes.NOT_FOUND,
        message: 'المستخدم غير موجود',
      };
    }

    if (user.isOnboarded) {
      throw {
        code: ErrorCodes.ONBOARDING_ALREADY_COMPLETE,
        message: ERROR_MESSAGES.ONBOARDING_COMPLETE,
      };
    }

    // Mark as onboarded
    await prisma.user.update({
      where: { id: userId },
      data: { isOnboarded: true },
    });

    // Create audit log
    await this.createAuditLog({
      userId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: userId,
      newValues: { isOnboarded: true, skipped: true },
    });

    logger.info('Onboarding skipped', { userId });

    return {
      message: 'تم تخطي عملية التسجيل',
    };
  }

  /**
   * Get recommended financial goals based on user profile
   */
  async getRecommendedGoals(userId: string): Promise<{
    categoryRecommendations: Array<{
      icon: string;
      category: string;
      name: string;
      suggestedAmount: number;
      reasoning: string;
    }>;
  }> {
    // Get user profile
    const profile = await prisma.userProfile.findFirst({
      where: { userId, isCurrent: true },
    });

    if (!profile) {
      throw {
        code: ErrorCodes.NOT_FOUND,
        message: 'الملف الشخصي غير موجود',
      };
    }

    const monthlyIncome = Number(profile.monthlyIncome);
    const basicExpenses = Number(profile.basicExpenses);
    const disposableIncome = monthlyIncome - basicExpenses;

    // Generate recommendations based on financial situation
    const recommendations = [
      {
        icon: '🏦',
        category: 'emergency_fund',
        name: 'صندوق الطوارئ',
        suggestedAmount: Math.round(basicExpenses * 6), // 6 months of expenses
        reasoning: 'يُنصح بتوفير ما يعادل 6 أشهر من المصاريف الأساسية',
      },
      {
        icon: '💰',
        category: 'savings',
        name: 'الادخار الشهري',
        suggestedAmount: Math.round(disposableIncome * 0.2 * 12), // 20% of disposable income for a year
        reasoning: 'ادخر 20% من دخلك الصافي شهرياً',
      },
      {
        icon: '🏠',
        category: 'large_purchase',
        name: 'مشروع كبير',
        suggestedAmount: Math.round(monthlyIncome * 12), // 1 year of income
        reasoning: 'خطط لشراء كبير أو استثمار مستقبلي',
      },
      {
        icon: '✈️',
        category: 'travel',
        name: 'رحلة أو سفر',
        suggestedAmount: Math.round(monthlyIncome * 2), // 2 months of income
        reasoning: 'خطط لرحلة أو تجربة جديدة',
      },
    ];

    return {
      categoryRecommendations: recommendations,
    };
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

export const onboardingService = new OnboardingService();
