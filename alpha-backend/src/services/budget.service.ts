import { Budget } from '@prisma/client';
import { ErrorCodes } from '../types/api.types';
import logger from '../utils/logger';
import prisma from '../lib/prisma';

interface CreateBudgetParams {
  userId: string;
  name: string;
  amount: number;
  period: string;
  startDate: string;
  endDate: string;
  categoryId?: string;
  alertAt?: number;
}

interface UpdateBudgetParams {
  name?: string;
  amount?: number;
  period?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  alertAt?: number;
  isActive?: boolean;
}

interface BudgetFilters {
  period?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export class BudgetService {
  /**
   * Create budget
   */
  async createBudget(params: CreateBudgetParams): Promise<Budget> {
    const { userId, name, amount, period, startDate, endDate, categoryId, alertAt } = params;

    if (amount <= 0) {
      throw { code: ErrorCodes.INVALID_AMOUNT, message: 'المبلغ غير صالح' };
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (endDateObj <= startDateObj) {
      throw { code: ErrorCodes.INVALID_DATE_RANGE, message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' };
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        name,
        amount,
        period,
        startDate: startDateObj,
        endDate: endDateObj,
        categoryId,
        alertAt: alertAt ?? 80,
        remaining: amount,
        spent: 0,
      },
    });

    logger.info('Budget created', { userId, budgetId: budget.id });
    return budget;
  }

  /**
   * Get budget by ID
   */
  async getBudgetById(userId: string, budgetId: string): Promise<Budget> {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      throw { code: ErrorCodes.NOT_FOUND, message: 'الميزانية غير موجودة' };
    }

    return budget;
  }

  /**
   * Get user budgets with filters
   */
  async getUserBudgets(userId: string, filters?: BudgetFilters): Promise<Budget[]> {
    const where: any = { userId };

    if (filters) {
      if (filters.period) where.period = filters.period;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
      if (filters.startDate) where.startDate = { gte: new Date(filters.startDate) };
      if (filters.endDate) where.endDate = { lte: new Date(filters.endDate) };
    }

    return prisma.budget.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Update budget
   */
  async updateBudget(userId: string, budgetId: string, data: UpdateBudgetParams): Promise<Budget> {
    await this.getBudgetById(userId, budgetId);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) {
      if (data.amount <= 0) throw { code: ErrorCodes.INVALID_AMOUNT, message: 'المبلغ غير صالح' };
      updateData.amount = data.amount;
      updateData.remaining = data.amount - Number((await prisma.budget.findUnique({ where: { id: budgetId }, select: { spent: true } }))?.spent || 0);
    }
    if (data.period !== undefined) updateData.period = data.period;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.alertAt !== undefined) updateData.alertAt = data.alertAt;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.budget.update({
      where: { id: budgetId },
      data: updateData,
    });
  }

  /**
   * Delete budget
   */
  async deleteBudget(userId: string, budgetId: string): Promise<{ message: string }> {
    await this.getBudgetById(userId, budgetId);

    await prisma.budget.delete({ where: { id: budgetId } });

    logger.info('Budget deleted', { userId, budgetId });
    return { message: 'تم حذف الميزانية بنجاح' };
  }

  /**
   * Recalculate budget spent from expenses
   */
  async recalculateBudget(userId: string, budgetId: string): Promise<Budget> {
    const budget = await this.getBudgetById(userId, budgetId);
    const amount = Number(budget.amount);

    // Get expenses within budget date range
    const where: any = {
      userId,
      deletedAt: null,
      expenseDate: {
        gte: budget.startDate,
        lte: budget.endDate,
      },
    };

    if (budget.categoryId) {
      where.categoryId = budget.categoryId;
    }

    const expenses = await prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    });

    const spent = Number(expenses._sum.amount || 0);
    const remaining = Math.max(0, amount - spent);
    const alertThreshold = budget.alertAt;
    const spentPercentage = amount > 0 ? (spent / amount) * 100 : 0;

    const updated = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        spent,
        remaining,
        alerted: spentPercentage >= alertThreshold,
      },
    });

    // Create alert notification if threshold crossed
    if (spentPercentage >= alertThreshold && !budget.alerted) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'SPENDING_ALERT',
          title: `تنبيه: اقتربت من حد الميزانية`,
          titleAr: `تنبيه: اقتربت من حد الميزانية`,
          message: `لقد أنفقت ${Math.round(spentPercentage)}% من ميزانية ${budget.name}`,
          messageAr: `لقد أنفقت ${Math.round(spentPercentage)}% من ميزانية ${budget.name}`,
          channels: ['push', 'app'],
          priority: spentPercentage >= 100 ? 'HIGH' : 'MEDIUM',
        },
      });
    }

    return updated;
  }

  /**
   * Get budget summary with all budgets status
   */
  async getBudgetSummary(userId: string): Promise<{
    totalBudgets: number;
    activeBudgets: number;
    totalAllocated: number;
    totalSpent: number;
    totalRemaining: number;
    overBudgetCount: number;
    budgets: Array<Budget & { spentPercentage: number }>;
  }> {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });

    let totalAllocated = 0;
    let totalSpent = 0;
    let totalRemaining = 0;
    let overBudgetCount = 0;
    let activeBudgets = 0;

    const budgetsWithProgress = budgets.map((b) => {
      const amount = Number(b.amount);
      const spent = Number(b.spent);
      const remaining = Number(b.remaining);
      const spentPercentage = amount > 0 ? Math.round((spent / amount) * 100) : 0;

      totalAllocated += amount;
      totalSpent += spent;
      totalRemaining += remaining;
      if (spent > amount) overBudgetCount++;
      if (b.isActive) activeBudgets++;

      return { ...b, spentPercentage };
    });

    return {
      totalBudgets: budgets.length,
      activeBudgets,
      totalAllocated,
      totalSpent,
      totalRemaining,
      overBudgetCount,
      budgets: budgetsWithProgress,
    };
  }
}

export const budgetService = new BudgetService();
