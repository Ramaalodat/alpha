import { ErrorCodes } from '../types/api.types';
import { CreateIncomeRequest, UpdateIncomeRequest, IncomeFilters } from '../types/user.types';
import logger from '../utils/logger';
import prisma from '../lib/prisma';

export class IncomeService {
  /**
   * Create income
   */
  async createIncome(userId: string, data: CreateIncomeRequest) {
    const { amount, source, description, incomeDate, isRecurring, frequency, startDate, endDate } = data;

    if (amount <= 0) {
      throw {
        code: ErrorCodes.INVALID_AMOUNT,
        message: 'المبلغ غير صالح',
      };
    }

    const income = await prisma.income.create({
      data: {
        userId,
        amount,
        source,
        description,
        incomeDate: incomeDate ? new Date(incomeDate) : new Date(),
        isRecurring: isRecurring || false,
        frequency: frequency as any,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entityType: 'Income',
        entityId: income.id,
        newValues: income as any,
      },
    });

    logger.info('Income created', { userId, incomeId: income.id, amount });

    return income;
  }

  /**
   * Get income by ID
   */
  async getIncomeById(userId: string, incomeId: string) {
    const income = await prisma.income.findFirst({
      where: { id: incomeId, userId, deletedAt: null },
    });

    if (!income) {
      throw { code: ErrorCodes.NOT_FOUND, message: 'دخل الدخل غير موجود' };
    }

    return income;
  }

  /**
   * Get user incomes with optional filters
   */
  async getUserIncomes(userId: string, filters?: any) {
    const where: any = { userId, deletedAt: null };

    if (filters) {
      if (filters.startDate) where.incomeDate = { gte: new Date(filters.startDate) };
      if (filters.endDate) where.incomeDate = { ...where.incomeDate, lte: new Date(filters.endDate) };
      if (filters.minAmount) where.amount = { gte: filters.minAmount };
      if (filters.maxAmount) where.amount = { ...where.amount, lte: filters.maxAmount };
      if (filters.source) where.source = { contains: filters.source, mode: 'insensitive' };
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { incomeDate: 'desc' },
    });

    return incomes;
  }

  /**
   * Update income
   */
  async updateIncome(userId: string, incomeId: string, data: UpdateIncomeRequest) {
    const existing = await this.getIncomeById(userId, incomeId);

    const updateData: any = {};
    if (data.amount !== undefined) {
      if (data.amount <= 0) throw { code: ErrorCodes.INVALID_AMOUNT, message: 'المبلغ غير صالح' };
      updateData.amount = data.amount;
    }
    if (data.source !== undefined) updateData.source = data.source;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.incomeDate) updateData.incomeDate = new Date(data.incomeDate);
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
    if (data.frequency) updateData.frequency = data.frequency as any;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const updated = await prisma.income.update({ where: { id: incomeId }, data: updateData });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entityType: 'Income',
        entityId: incomeId,
        oldValues: existing as any,
        newValues: updated as any,
      },
    });

    logger.info('Income updated', { userId, incomeId });

    return updated;
  }

  /**
   * Delete income (soft delete)
   */
  async deleteIncome(userId: string, incomeId: string) {
    await this.getIncomeById(userId, incomeId);

    await prisma.income.update({ where: { id: incomeId }, data: { deletedAt: new Date() } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entityType: 'Income',
        entityId: incomeId,
      },
    });

    logger.info('Income deleted', { userId, incomeId });

    return { message: 'تم حذف الدخل بنجاح' };
  }

  /**
   * Get income statistics with breakdowns
   */
  async getIncomeStats(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId, deletedAt: null };
    if (startDate) where.incomeDate = { gte: startDate };
    if (endDate) where.incomeDate = { ...where.incomeDate, lte: endDate };

    const [totals, incomes] = await Promise.all([
      prisma.income.aggregate({ where, _sum: { amount: true }, _count: true, _avg: { amount: true } }),
      prisma.income.findMany({ where }),
    ]);

    const totalAmount = Number(totals._sum.amount || 0);

    // Group by source
    const sourceMap = new Map<string, { amount: number; count: number }>();
    incomes.forEach((income) => {
      const existing = sourceMap.get(income.source) || { amount: 0, count: 0 };
      existing.amount += Number(income.amount);
      existing.count += 1;
      sourceMap.set(income.source, existing);
    });

    const bySource = Array.from(sourceMap.entries()).map(([source, data]) => ({
      source,
      amount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    }));

    // Calculate daily average
    let dailyAverage = 0;
    if (startDate && endDate) {
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      dailyAverage = days > 0 ? totalAmount / days : 0;
    }

    return {
      totalIncome: totalAmount,
      incomeCount: totals._count || 0,
      averageIncome: Number(totals._avg.amount || 0),
      bySource: bySource.sort((a, b) => b.amount - a.amount),
      dailyAverage,
    };
  }

  /**
   * Get incomes grouped by source with totals
   */
  async getIncomeBySource(userId: string, startDate?: Date, endDate?: Date): Promise<
    Array<{ source: string; amount: number; count: number; percentage: number }>
  > {
    const where: any = { userId, deletedAt: null };
    if (startDate) where.incomeDate = { gte: startDate };
    if (endDate) where.incomeDate = { ...where.incomeDate, lte: endDate };

    const incomes = await prisma.income.findMany({ where });
    const totalAmount = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

    const sourceMap = new Map<string, { amount: number; count: number }>();
    incomes.forEach((income) => {
      const existing = sourceMap.get(income.source) || { amount: 0, count: 0 };
      existing.amount += Number(income.amount);
      existing.count += 1;
      sourceMap.set(income.source, existing);
    });

    return Array.from(sourceMap.entries())
      .map(([source, data]) => ({
        source,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Get monthly income comparison (current vs last month)
   */
  async getMonthlyComparison(userId: string): Promise<{
    currentMonth: number;
    lastMonth: number;
    changePercentage: number;
    trend: 'increase' | 'decrease' | 'stable';
  }> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentMonth, lastMonth] = await Promise.all([
      prisma.income.aggregate({
        where: { userId, deletedAt: null, incomeDate: { gte: currentMonthStart } },
        _sum: { amount: true },
      }),
      prisma.income.aggregate({
        where: {
          userId,
          deletedAt: null,
          incomeDate: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    const currentTotal = Number(currentMonth._sum.amount || 0);
    const lastTotal = Number(lastMonth._sum.amount || 0);

    let changePercentage = 0;
    let trend: 'increase' | 'decrease' | 'stable' = 'stable';

    if (lastTotal > 0) {
      changePercentage = ((currentTotal - lastTotal) / lastTotal) * 100;
      if (changePercentage > 5) trend = 'increase';
      else if (changePercentage < -5) trend = 'decrease';
    }

    return {
      currentMonth: currentTotal,
      lastMonth: lastTotal,
      changePercentage: Math.round(changePercentage * 100) / 100,
      trend,
    };
  }
}

export const incomeService = new IncomeService();
