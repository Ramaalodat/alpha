import { UserProfile, FinancialGoal } from '@prisma/client';
import { ErrorCodes } from '../types/api.types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { OnboardingFinancialInfo, OnboardingStatus } from '../types/user.types';
import logger from '../utils/logger';
import prisma from '../lib/prisma';
import { createDevStore } from '../utils/devStore';

const devStore = createDevStore();

interface CompleteFinancialInfoParams {
  userId: string;
  monthlyIncome: number;
  basicExpenses: number;
  financialGoal: string;
  primarySpendingCategory: string;
  relationshipWithMoney?: string;
  monthlyExtraSavingsGoal?: number;
  mainFinancialGoal12M?: string;
  incomeSources?: Array<{
    sourceType: string;
    amount: number;
    description?: string;
    pinnedMonths?: number;
  }>;
  fixedExpenses?: Array<{
    category: string;
    amount: number;
    pinnedMonths?: number;
  }>;
  variableExpenses?: Array<{
    category: string;
    amount: number;
    pinnedMonths?: number;
  }>;
  pinnedMonths?: number;
}

interface CreateFirstGoalParams {
  userId: string;
  icon: string;
  name: string;
  targetAmount: number;
  targetDate: string; // ISO date string
  flexibility?: string;
}

export class OnboardingService {
  private async useDevFallback<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      if (/Can't reach database server|database server|ECONNREFUSED|P1001|P1000|Connection refused/i.test(message)) {
        logger.warn('Onboarding: using dev fallback', { reason: message });
        return fallback();
      }
      throw error;
    }
  }

  /**
   * Get onboarding status for user
   */
  async getOnboardingStatus(userId: string): Promise<any> {
    return this.useDevFallback(
      () => this._getOnboardingStatusPrisma(userId),
      () => this._getOnboardingStatusDev(userId),
    );
  }

  private async _getOnboardingStatusPrisma(userId: string) {
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

    // Step 1: Registration (always complete if user exists)
    const registration = true;

    // Step 2: Demographics (check if gender is set on user)
    const demographics = !!(user as any).gender;

    // Step 3: Financial data (check if UserProfile has relationshipWithMoney set)
    const profile = user.profiles.length > 0 ? user.profiles[0] : null;
    const financialData = !!(profile && (profile as any).relationshipWithMoney);

    // Step 4: Goals (check if user has any goals)
    const hasGoals = user.goals.length > 0;

    const isCompleted = user.isOnboarded;

    // Determine next step
    let nextStep: string | null = null;
    if (!demographics) {
      nextStep = 'demographics';
    } else if (!financialData) {
      nextStep = 'financial_data';
    } else if (!hasGoals) {
      nextStep = 'financial_goals';
    }

    return {
      isCompleted,
      steps: {
        registration,
        demographics,
        financialData,
        financialGoals: hasGoals,
        // Legacy fields
        financialInfo: financialData,
        firstGoal: hasGoals,
      },
      nextStep,
    };
  }

  private async _getOnboardingStatusDev(userId: string) {
    const user = await devStore.findUserById(userId);
    if (!user) throw { code: ErrorCodes.NOT_FOUND, message: 'المستخدم غير موجود' };

    const profile = await devStore.getCurrentProfile(userId);
    const goals = await devStore.listGoals(userId);
    const demographics = !!(user as any).gender;
    const financialData = !!(profile && (profile as any).relationshipWithMoney);
    const hasGoals = goals.length > 0;

    let nextStep: string | null = null;
    if (!demographics) nextStep = 'demographics';
    else if (!financialData) nextStep = 'financial_data';
    else if (!hasGoals) nextStep = 'financial_goals';

    return {
      isCompleted: user.isOnboarded,
      steps: { registration: true, demographics, financialData, financialGoals: hasGoals, financialInfo: financialData, firstGoal: hasGoals },
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
    return this.useDevFallback(
      () => this._completeFinancialInfoPrisma(params),
      () => this._completeFinancialInfoDev(params),
    );
  }

  private async _completeFinancialInfoPrisma(params: CompleteFinancialInfoParams): Promise<{ profile: UserProfile; message: string }> {
    const {
      userId, monthlyIncome, basicExpenses, financialGoal, primarySpendingCategory,
      relationshipWithMoney, monthlyExtraSavingsGoal, mainFinancialGoal12M,
      incomeSources, fixedExpenses, variableExpenses, pinnedMonths,
    } = params;

    // Check if user already has a profile – if so, update it (idempotent)
    const existingProfile = await prisma.userProfile.findFirst({
      where: { userId, isCurrent: true },
    });

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
    }

    // Calculate totals from expense arrays
    const fixedExpensesTotal = fixedExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const variableExpensesTotal = variableExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

    const profileData = {
      monthlyIncome,
      basicExpenses,
      financialGoal,
      primarySpendingCategory,
      ...(relationshipWithMoney && { relationshipWithMoney: relationshipWithMoney as any }),
      ...(monthlyExtraSavingsGoal !== undefined && { monthlyExtraSavingsGoal }),
      ...(mainFinancialGoal12M && { mainFinancialGoal12M: mainFinancialGoal12M as any }),
      ...(fixedExpensesTotal > 0 && { fixedExpensesTotal }),
      ...(variableExpensesTotal > 0 && { variableExpensesTotal }),
    };

    let profile: UserProfile;

    if (existingProfile) {
      // Update existing profile
      profile = await prisma.userProfile.update({
        where: { id: existingProfile.id },
        data: profileData as any,
      });

      // Delete old income/expense records so we can recreate them cleanly
      await prisma.income.deleteMany({ where: { userId, isRecurring: true } });
      await prisma.expense.deleteMany({ where: { userId, isRecurring: true } });
      await prisma.expense.deleteMany({ where: { userId, expenseType: 'VARIABLE' as any } });

      logger.info('Financial information updated', { userId, profileId: profile.id });
    } else {
      // Create new profile
      profile = await prisma.userProfile.create({
        data: {
          user: { connect: { id: userId } },
          version: 1,
          isCurrent: true,
          creator: { connect: { id: userId } },
          ...profileData as any,
        },
      });
      logger.info('Financial information completed', { userId, profileId: profile.id });
    }

    // Calculate pinnedUntil helper
    const calcPinnedUntil = (months?: number) =>
      months ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000) : undefined;

    // Resolve default categories for onboarding expenses
    const fixedCategory = await prisma.expenseCategory.findFirst({
      where: { name: 'Other Fixed', isDefault: true },
    });
    const variableCategory = await prisma.expenseCategory.findFirst({
      where: { name: 'Other Variable', isDefault: true },
    });

    // Create Income records for each income source
    if (incomeSources && incomeSources.length > 0) {
      for (const src of incomeSources) {
        const pinMonths = src.pinnedMonths || pinnedMonths;
        await prisma.income.create({
          data: {
            user: { connect: { id: userId } },
            amount: src.amount,
            source: src.description || src.sourceType,
            description: src.description,
            incomeDate: new Date(),
            isRecurring: true,
            frequency: 'MONTHLY' as any,
            sourceType: src.sourceType as any,
            ...(pinMonths && { pinnedMonths: pinMonths, pinnedUntil: calcPinnedUntil(pinMonths) }),
          } as any,
        });
      }
    }

    // Create Expense records for fixed expenses
    if (fixedExpenses && fixedExpenses.length > 0 && fixedCategory) {
      for (const exp of fixedExpenses) {
        const pinMonths = (exp as any).pinnedMonths || pinnedMonths;
        await prisma.expense.create({
          data: {
            user: { connect: { id: userId } },
            category: { connect: { id: fixedCategory.id } },
            amount: exp.amount,
            description: exp.category,
            expenseDate: new Date(),
            expenseType: 'FIXED' as any,
            isRecurring: true,
            ...(pinMonths && { pinnedMonths: pinMonths, pinnedUntil: calcPinnedUntil(pinMonths) }),
          } as any,
        });
      }
    }

    // Create Expense records for variable expenses
    if (variableExpenses && variableExpenses.length > 0 && variableCategory) {
      for (const exp of variableExpenses) {
        const pinMonths = (exp as any).pinnedMonths || pinnedMonths;
        await prisma.expense.create({
          data: {
            user: { connect: { id: userId } },
            category: { connect: { id: variableCategory.id } },
            amount: exp.amount,
            description: exp.category,
            expenseDate: new Date(),
            expenseType: 'VARIABLE' as any,
            isRecurring: false,
            ...(pinMonths && { pinnedMonths: pinMonths, pinnedUntil: calcPinnedUntil(pinMonths) }),
          } as any,
        });
      }
    }

    // Create default settings if not exists
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!existingSettings) {
      await prisma.userSettings.create({
        data: {
          user: { connect: { id: userId } },
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
      action: existingProfile ? 'UPDATE' : 'CREATE',
      entityType: 'UserProfile',
      entityId: profile.id,
      newValues: profile,
    });

    logger.info('Financial information completed', { userId, profileId: profile.id });

    return {
      profile,
      message: existingProfile ? 'تم تحديث المعلومات المالية بنجاح' : 'تم حفظ المعلومات المالية بنجاح',
    };
  }

  private async _completeFinancialInfoDev(params: CompleteFinancialInfoParams): Promise<{ profile: any; message: string }> {
    const { userId, monthlyIncome, basicExpenses, financialGoal, primarySpendingCategory,
      relationshipWithMoney, monthlyExtraSavingsGoal, mainFinancialGoal12M,
      incomeSources, fixedExpenses, variableExpenses, pinnedMonths } = params;

    const existingProfile = await devStore.getCurrentProfile(userId);

    const profileData: any = {
      userId, monthlyIncome, basicExpenses, financialGoal, primarySpendingCategory,
      version: existingProfile ? existingProfile.version : 1,
      isCurrent: true,
      createdBy: userId,
      ...(relationshipWithMoney && { relationshipWithMoney }),
      ...(monthlyExtraSavingsGoal !== undefined && { monthlyExtraSavingsGoal }),
      ...(mainFinancialGoal12M && { mainFinancialGoal12M }),
    };

    let profile: any;
    if (existingProfile) {
      profile = await devStore.updateProfile(existingProfile.id, profileData);
      // Delete old income/expense records
      await devStore.deleteIncomes(userId, (i) => i.isRecurring);
      await devStore.deleteExpenses(userId, (e) => e.isRecurring || e.expenseType === 'VARIABLE');
    } else {
      profile = await devStore.createProfile(profileData);
    }

    const calcPinnedUntil = (months?: number) =>
      months ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined;

    // Create income records
    if (incomeSources && incomeSources.length > 0) {
      for (const src of incomeSources) {
        const pinMonths = src.pinnedMonths || pinnedMonths;
        await devStore.createIncome({
          userId, amount: src.amount, source: src.description || src.sourceType,
          description: src.description, incomeDate: new Date().toISOString(),
          isRecurring: true, frequency: 'MONTHLY', sourceType: src.sourceType,
          ...(pinMonths && { pinnedMonths: pinMonths, pinnedUntil: calcPinnedUntil(pinMonths) }),
        });
      }
    }

    // Resolve default categories
    const fixedCat = await devStore.findCategory((c) => c.name === 'Other Fixed');
    const variableCat = await devStore.findCategory((c) => c.name === 'Other Variable');

    if (fixedExpenses && fixedExpenses.length > 0 && fixedCat) {
      for (const exp of fixedExpenses) {
        const pinMonths = (exp as any).pinnedMonths || pinnedMonths;
        await devStore.createExpense({
          userId, categoryId: fixedCat.id, amount: exp.amount, description: exp.category,
          expenseDate: new Date().toISOString(), expenseType: 'FIXED', isRecurring: true,
          ...(pinMonths && { pinnedMonths: pinMonths, pinnedUntil: calcPinnedUntil(pinMonths) }),
        });
      }
    }

    if (variableExpenses && variableExpenses.length > 0 && variableCat) {
      for (const exp of variableExpenses) {
        const pinMonths = (exp as any).pinnedMonths || pinnedMonths;
        await devStore.createExpense({
          userId, categoryId: variableCat.id, amount: exp.amount, description: exp.category,
          expenseDate: new Date().toISOString(), expenseType: 'VARIABLE', isRecurring: false,
          ...(pinMonths && { pinnedMonths: pinMonths, pinnedUntil: calcPinnedUntil(pinMonths) }),
        });
      }
    }

    // Create settings if not exists
    const existingSettings = await devStore.getSettings(userId);
    if (!existingSettings) {
      await devStore.upsertSettings(userId, {});
    }

    logger.info('Financial information completed (dev)', { userId, profileId: profile.id });
    return {
      profile,
      message: existingProfile ? 'تم تحديث المعلومات المالية بنجاح' : 'تم حفظ المعلومات المالية بنجاح',
    };
  }

  /**
   * Create first goal and complete onboarding
   */
  async createFirstGoal(params: CreateFirstGoalParams): Promise<{
    goal: FinancialGoal;
    message: string;
  }> {
    return this.useDevFallback(
      () => this._createFirstGoalPrisma(params),
      () => this._createFirstGoalDev(params),
    );
  }

  private async _createFirstGoalPrisma(params: CreateFirstGoalParams): Promise<{ goal: FinancialGoal; message: string }> {
    const { userId, icon, name, targetAmount, targetDate, flexibility } = params;

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

    let goal: FinancialGoal;

    if (existingGoal) {
      // Update existing goal (idempotent)
      goal = await prisma.financialGoal.update({
        where: { id: existingGoal.id },
        data: {
          icon,
          name,
          targetAmount,
          targetDate: targetDateObj,
          ...(flexibility && { flexibility: flexibility as any }),
        },
      });
      logger.info('First goal updated', { userId, goalId: goal.id });
    } else {
      // Create financial goal
      goal = await prisma.financialGoal.create({
        data: {
          user: { connect: { id: userId } },
          icon,
          name,
          targetAmount,
          targetDate: targetDateObj,
          currentAmount: 0,
          status: 'ACTIVE',
          progressPercentage: 0,
          ...(flexibility && { flexibility: flexibility as any }),
        },
      });
      logger.info('First goal created', { userId, goalId: goal.id });
    }

    // Mark user as onboarded
    await prisma.user.update({
      where: { id: userId },
      data: { isOnboarded: true },
    });

    // Create audit log for goal
    await this.createAuditLog({
      userId,
      action: existingGoal ? 'UPDATE' : 'CREATE',
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
      message: existingGoal
        ? 'تم تحديث الهدف المالي بنجاح. مرحباً بك في BASIRA!'
        : 'تم إنشاء الهدف المالي بنجاح. مرحباً بك في BASIRA!',
    };
  }

  private async _createFirstGoalDev(params: CreateFirstGoalParams): Promise<{ goal: any; message: string }> {
    const { userId, icon, name, targetAmount, targetDate, flexibility } = params;

    const profile = await devStore.getCurrentProfile(userId);
    if (!profile) throw { code: ErrorCodes.ONBOARDING_INCOMPLETE, message: 'يجب إكمال المعلومات المالية أولاً' };

    const existingGoal = await devStore.findGoal(userId, (g) => !g.deletedAt);

    if (targetAmount <= 0) throw { code: ErrorCodes.INVALID_AMOUNT, message: ERROR_MESSAGES.INVALID_AMOUNT };
    const targetDateObj = new Date(targetDate);
    if (targetDateObj <= new Date()) throw { code: ErrorCodes.INVALID_DATE_RANGE, message: 'يجب أن يكون التاريخ المستهدف في المستقبل' };

    let goal: any;
    if (existingGoal) {
      goal = await devStore.updateGoal(existingGoal.id, { icon, name, targetAmount, targetDate: targetDateObj.toISOString(), ...(flexibility && { flexibility }) });
    } else {
      goal = await devStore.createGoal({
        userId, icon, name, targetAmount, currentAmount: 0,
        targetDate: targetDateObj.toISOString(), status: 'ACTIVE', priority: 'MEDIUM',
        progressPercentage: 0, ...(flexibility && { flexibility }),
      });
    }

    await devStore.updateUserById(userId, { isOnboarded: true });
    logger.info('First goal completed (dev)', { userId, goalId: goal.id });

    return {
      goal,
      message: existingGoal
        ? 'تم تحديث الهدف المالي بنجاح. مرحباً بك في BASIRA!'
        : 'تم إنشاء الهدف المالي بنجاح. مرحباً بك في BASIRA!',
    };
  }

  /**
   * Skip onboarding and mark as complete (optional feature)
   */
  async skipOnboarding(userId: string): Promise<{ message: string }> {
    return this.useDevFallback(
      () => this._skipOnboardingPrisma(userId),
      () => this._skipOnboardingDev(userId),
    );
  }

  private async _skipOnboardingPrisma(userId: string): Promise<{ message: string }> {
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

    // Create default profile if not exists to prevent dashboard crash
    const profileExists = await prisma.userProfile.findFirst({
      where: { userId }
    });
    if (!profileExists) {
      await prisma.userProfile.create({
        data: {
          userId,
          isCurrent: true,
          primarySpendingCategory: 'غير محدد',
          monthlyIncome: 0,
          basicExpenses: 0
        }
      });
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

  private async _skipOnboardingDev(userId: string): Promise<{ message: string }> {
    const user = await devStore.findUserById(userId);
    if (!user) throw { code: ErrorCodes.NOT_FOUND, message: 'المستخدم غير موجود' };
    if (user.isOnboarded) throw { code: ErrorCodes.ONBOARDING_ALREADY_COMPLETE, message: ERROR_MESSAGES.ONBOARDING_COMPLETE };

    const profileExists = await devStore.getCurrentProfile(userId);
    if (!profileExists) {
      await devStore.createProfile({
        userId,
        isCurrent: true,
        primarySpendingCategory: 'غير محدد',
        version: 1,
      });
    }

    await devStore.updateUserById(userId, { isOnboarded: true });
    return { message: 'تم تخطي عملية التسجيل' };
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
          user: data.userId ? { connect: { id: data.userId } } : undefined,
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
