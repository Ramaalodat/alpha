import { PrismaClient } from '@prisma/client';
import { ErrorCodes } from '../types/api.types';
import { CreateIncomeRequest, UpdateIncomeRequest } from '../types/user.types';
import logger from '../utils/logger';

const prisma = new PrismaClient();

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
   * Get income statistics (total for range)
   */
  async getIncomeStats(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId, deletedAt: null };
    if (startDate) where.incomeDate = { gte: startDate };
    if (endDate) where.incomeDate = { ...where.incomeDate, lte: endDate };

    const totals = await prisma.income.aggregate({ where, _sum: { amount: true }, _count: true, _avg: { amount: true } });

    return {
      totalIncome: Number(totals._sum.amount || 0),
      incomeCount: totals._count || 0,
      averageIncome: Number(totals._avg.amount || 0),
    };
  }
}

export const incomeService = new IncomeService();
