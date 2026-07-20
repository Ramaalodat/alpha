import { ErrorCodes } from '../types/api.types';
import { DashboardSummary } from '../types/user.types';
import logger from '../utils/logger';
import { dateUtils } from '../utils/helpers';
import prisma from '../lib/prisma';
import { createDevStore } from '../utils/devStore';

const devStore = createDevStore();

export class DashboardService {
  private async useDevFallback<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      if (/Can't reach database server|database server|ECONNREFUSED|P1001|P1000|Connection refused/i.test(message)) {
        logger.warn('Dashboard: using dev fallback', { reason: message });
        return fallback();
      }
      throw error;
    }
  }

  /**
   * Get dashboard summary for user
   */
  async getDashboardSummary(userId: string): Promise<DashboardSummary> {
    return this.useDevFallback(
      () => this._getDashboardSummaryPrisma(userId),
      () => this._getDashboardSummaryDev(userId),
    );
  }

  private async _getDashboardSummaryPrisma(userId: string): Promise<DashboardSummary> {
    // Get user with current profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: {
          where: { isCurrent: true },
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

    const currentProfile = user.profiles[0];

    // Get current month date range
    const now = new Date();
    const { start: monthStart, end: monthEnd } = dateUtils.getMonthRange(now);

    // Fetch all data in parallel
    const [
      goalsData,
      monthlyExpenses,
      topCategoryExpense,
      recentExpenses,
      recentGoalTransactions,
      unreadNotifications,
      newInsights,
      monthlyIncomeTotals,
      recentIncomes,
    ] = await Promise.all([
      // Goals summary
      prisma.financialGoal.findMany({
        where: { userId, deletedAt: null },
      }),

      // Monthly expenses
      prisma.expense.aggregate({
        where: {
          userId,
          deletedAt: null,
          expenseDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { amount: true },
      }),

      // Top spending category this month
      prisma.expense.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          deletedAt: null,
          expenseDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { amount: true },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
        take: 1,
      }),

      // Recent expenses
      prisma.expense.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Recent goal transactions
      prisma.goalTransaction.findMany({
        where: { userId },
        include: {
          goal: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Unread notifications count
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),

      // New insights count
      prisma.aiInsight.count({
        where: {
          userId,
          isRead: false,
          isDismissed: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } },
          ],
        },
      }),

      // Monthly income totals for current month
      prisma.income.aggregate({
        where: {
          userId,
          deletedAt: null,
          incomeDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { amount: true },
      }),

      // Recent incomes
      prisma.income.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        orderBy: { incomeDate: 'desc' },
        take: 5,
      }),
    ]);

    // Process goals data
    const totalGoals = goalsData.length;
    const activeGoals = goalsData.filter(g => g.status === 'ACTIVE').length;
    const completedGoals = goalsData.filter(g => g.status === 'EXECUTED').length;
    const totalSaved = goalsData.reduce((sum, g) => sum + Number(g.currentAmount), 0);
    const totalTarget = goalsData.reduce((sum, g) => sum + Number(g.targetAmount), 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    // Get top category name
    let topCategory: string | undefined = undefined;
    if (topCategoryExpense.length > 0) {
      const category = await prisma.expenseCategory.findUnique({
        where: { id: topCategoryExpense[0].categoryId },
      });
      topCategory = category?.name;
    }

    // Calculate remaining budget based on legacy method
    const monthlyIncome = currentProfile ? Number(currentProfile.monthlyIncome) : 0;
    const basicExpenses = currentProfile ? Number(currentProfile.basicExpenses) : 0;
    const monthlyExpensesTotal = Number(monthlyExpenses._sum.amount || 0);
    const remainingBudget = monthlyIncome - basicExpenses - monthlyExpensesTotal;

    // Strict Architecture: Safe Daily Spend & Spending Velocity
    let safeDailySpend = 0;
    let spendingVelocity = 0;

    const openCycle = await prisma.financialCycle.findFirst({
      where: { userId, status: 'OPEN' },
    });

    if (openCycle) {
      // Elapsed Time Percentage
      const startDate = openCycle.startDate.getTime();
      const endDate = openCycle.endDate.getTime();
      const nowTime = now.getTime();
      
      const totalDays = Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.max(0, (nowTime - startDate) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.max(1, totalDays - daysElapsed);
      
      const elapsedTimePercentage = Math.min(100, (daysElapsed / totalDays) * 100);

      // Fetch components for Safe Daily Spend
      const totalCycleIncome = Number(openCycle.recordedIncome) + Number(openCycle.unexpectedIncome);
      
      const cycleExpenses = await prisma.expense.aggregate({
        where: { userId, expenseDate: { gte: openCycle.startDate, lte: openCycle.endDate }, deletedAt: null },
        _sum: { amount: true }
      });
      const confirmedExpenses = Number(cycleExpenses._sum.amount || 0);

      const unpaidCommitments = await prisma.commitmentOccurrence.aggregate({
        where: { cycleId: openCycle.id, status: 'UPCOMING' },
        _sum: { amount: true }
      });
      const unpaidCoreCommitments = Number(unpaidCommitments._sum.amount || 0);

      const reservedSavingsData = await prisma.savingsAllocation.aggregate({
        where: { cycleId: openCycle.id },
        _sum: { emergencyFundAmount: true, unallocatedSavingsAmount: true }
      });
      const reservedSavings = Number(reservedSavingsData._sum.emergencyFundAmount || 0) + Number(reservedSavingsData._sum.unallocatedSavingsAmount || 0);

      const reservedGoalsData = await prisma.goalCycleAllocation.aggregate({
        where: { cycleId: openCycle.id },
        _sum: { plannedAmount: true }
      });
      const reservedGoalAllocations = Number(reservedGoalsData._sum.plannedAmount || 0);

      const availableBalance = Math.max(0, totalCycleIncome - confirmedExpenses - unpaidCoreCommitments - reservedSavings - reservedGoalAllocations);
      safeDailySpend = Math.round((availableBalance / remainingDays) * 100) / 100;

      const totalBudget = Number(openCycle.expectedIncome);
      const usagePercentage = totalBudget > 0 ? (confirmedExpenses / totalBudget) * 100 : 0;
      spendingVelocity = Math.round((usagePercentage - elapsedTimePercentage) * 100) / 100;
    }

    const summary: DashboardSummary = {
      user: {
        fullName: user.fullName,
        monthlyIncome: monthlyIncome,
        basicExpenses: basicExpenses,
      },
      goals: {
        totalGoals,
        activeGoals,
        completedGoals,
        totalSaved,
        totalTarget,
        overallProgress: Math.round(overallProgress * 100) / 100,
      },
      expenses: {
        monthlyExpenses: monthlyExpensesTotal,
        topCategory,
        remainingBudget,
        safeDailySpend,
        spendingVelocity,
      },
      recentActivity: {
        recentExpenses: recentExpenses as any,
        recentGoalTransactions: recentGoalTransactions as any,
        unreadNotifications,
        newInsights,
        recentIncomes: recentIncomes as any,
      },
      incomes: {
        monthlyIncomeTotal: Number(monthlyIncomeTotals._sum.amount || 0),
      },
    };

    logger.info('Dashboard summary generated', { userId });

    return summary;
  }

  private async _getDashboardSummaryDev(userId: string): Promise<DashboardSummary> {
    const user = await devStore.findUserById(userId);
    if (!user) throw { code: ErrorCodes.NOT_FOUND, message: 'المستخدم غير موجود' };

    const profile = await devStore.getCurrentProfile(userId);
    const goals = await devStore.listGoals(userId);
    const expenses = await devStore.listExpenses(userId);
    const incomes = await devStore.listIncomes(userId);

    const monthlyIncome = profile ? Number(profile.monthlyIncome || 0) : 0;
    const basicExpenses = profile ? Number(profile.basicExpenses || 0) : 0;

    // Current month filter
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyExpenses = expenses
      .filter((e) => new Date(e.expenseDate) >= monthStart && new Date(e.expenseDate) <= monthEnd)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const monthlyIncomeTotal = incomes
      .filter((i) => new Date(i.incomeDate) >= monthStart && new Date(i.incomeDate) <= monthEnd)
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const activeGoals = goals.filter((g) => g.status === 'ACTIVE');
    const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
    const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    const remainingBudget = monthlyIncome - basicExpenses - monthlyExpenses;

    return {
      user: { fullName: user.fullName, monthlyIncome, basicExpenses },
      goals: {
        totalGoals: goals.length,
        activeGoals: activeGoals.length,
        completedGoals: goals.filter((g) => g.status === 'EXECUTED').length,
        totalSaved, totalTarget,
        overallProgress: Math.round(overallProgress * 100) / 100,
      },
      expenses: { monthlyExpenses, topCategory: undefined, remainingBudget, safeDailySpend: 0, spendingVelocity: 0 },
      recentActivity: { recentExpenses: [], recentGoalTransactions: [], unreadNotifications: 0, newInsights: 0, recentIncomes: [] },
      incomes: { monthlyIncomeTotal },
    } as any;
  }

  /**
   * Get financial health score
   */
  async getFinancialHealthScore(userId: string): Promise<{
    score: number;
    breakdown: {
      savings: number;
      budgetAdherence: number;
      goalProgress: number;
      emergencyFund: number;
    };
    recommendations: string[];
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: {
          where: { isCurrent: true },
          take: 1,
        },
      },
    });

    if (!user || !user.profiles[0]) {
      throw {
        code: ErrorCodes.NOT_FOUND,
        message: 'الملف الشخصي غير موجود',
      };
    }

    const profile = user.profiles[0];
    const monthlyIncome = Number(profile.monthlyIncome);
    const basicExpenses = Number(profile.basicExpenses);

    // Get current month expenses
    const now = new Date();
    const { start: monthStart } = dateUtils.getMonthRange(now);

    const [expenses, goals, totalSavings] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          userId,
          deletedAt: null,
          expenseDate: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
      prisma.financialGoal.findMany({
        where: { userId, deletedAt: null },
      }),
      prisma.goalTransaction.aggregate({
        where: { userId, transactionType: 'DEPOSIT' },
        _sum: { amount: true },
      }),
    ]);

    const monthlyExpenses = Number(expenses._sum.amount || 0);
    const totalExpenses = basicExpenses + monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalExpenses) / monthlyIncome) * 100 : 0;

    // Calculate scores (0-100)
    const savingsScore = Math.min(savingsRate * 5, 100); // 20% savings = 100 score
    
    const budgetAdherence = totalExpenses <= monthlyIncome ? 100 : Math.max(0, 100 - ((totalExpenses - monthlyIncome) / monthlyIncome * 100));
    
    const activeGoals = goals.filter(g => g.status === 'ACTIVE');
    const avgGoalProgress = activeGoals.length > 0
      ? activeGoals.reduce((sum, g) => sum + Number(g.progressPercentage || 0), 0) / activeGoals.length
      : 0;
    
    const emergencyFundScore = profile.hasEmergencyFund ? 100 : 0;

    // Overall score (weighted average)
    const overallScore = (
      savingsScore * 0.3 +
      budgetAdherence * 0.3 +
      avgGoalProgress * 0.25 +
      emergencyFundScore * 0.15
    );

    // Generate recommendations
    const recommendations: string[] = [];
    if (savingsScore < 50) recommendations.push('حاول زيادة معدل الادخار الشهري');
    if (budgetAdherence < 80) recommendations.push('تحكم في مصروفاتك الشهرية');
    if (avgGoalProgress < 50) recommendations.push('ركز على تحقيق أهدافك المالية');
    if (!profile.hasEmergencyFund) recommendations.push('أنشئ صندوق طوارئ يغطي 6 أشهر من المصاريف');

    return {
      score: Math.round(overallScore),
      breakdown: {
        savings: Math.round(savingsScore),
        budgetAdherence: Math.round(budgetAdherence),
        goalProgress: Math.round(avgGoalProgress),
        emergencyFund: emergencyFundScore,
      },
      recommendations,
    };
  }
}

export const dashboardService = new DashboardService();
