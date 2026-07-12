import { PrismaClient, FinancialGoal, GoalTransaction, GoalStatus } from '@prisma/client';
import { ErrorCodes } from '../types/api.types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { CreateGoalRequest, UpdateGoalRequest, GoalTransactionRequest, GoalFilters } from '../types/user.types';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class GoalService {
  /**
   * Create financial goal
   */
  async createGoal(userId: string, data: CreateGoalRequest): Promise<FinancialGoal> {
    const { icon, name, targetAmount, targetDate } = data;

    // Validate amount
    if (targetAmount <= 0) {
      throw {
        code: ErrorCodes.INVALID_AMOUNT,
        message: ERROR_MESSAGES.INVALID_AMOUNT,
      };
    }

    // Validate date
    const targetDateObj = new Date(targetDate);
    if (targetDateObj <= new Date()) {
      throw {
        code: ErrorCodes.INVALID_DATE_RANGE,
        message: 'يجب أن يكون التاريخ المستهدف في المستقبل',
      };
    }

    // Create goal
    const goal = await prisma.financialGoal.create({
      data: {
        userId,
        icon,
        name,
        targetAmount,
        targetDate: targetDateObj,
        currentAmount: 0,
        status: GoalStatus.ACTIVE,
        progressPercentage: 0,
      },
    });

    // Create audit log
    await this.createAuditLog({
      userId,
      action: 'CREATE',
      entityType: 'FinancialGoal',
      entityId: goal.id,
      newValues: goal,
    });

    logger.info('Financial goal created', { userId, goalId: goal.id });

    return goal;
  }

  /**
   * Get goal by ID
   */
  async getGoalById(userId: string, goalId: string): Promise<FinancialGoal> {
    const goal = await prisma.financialGoal.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Latest 10 transactions
        },
      },
    });

    if (!goal) {
      throw {
        code: ErrorCodes.NOT_FOUND,
        message: ERROR_MESSAGES.GOAL_NOT_FOUND,
      };
    }

    return goal;
  }

  /**
   * Get all goals for user
   */
  async getUserGoals(userId: string, filters?: GoalFilters): Promise<FinancialGoal[]> {
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (filters) {
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.minAmount) {
        where.targetAmount = { gte: filters.minAmount };
      }
      if (filters.maxAmount) {
        where.targetAmount = { ...where.targetAmount, lte: filters.maxAmount };
      }
      if (filters.dueBefore) {
        where.targetDate = { lte: new Date(filters.dueBefore) };
      }
      if (filters.dueAfter) {
        where.targetDate = { ...where.targetDate, gte: new Date(filters.dueAfter) };
      }
    }

    const goals = await prisma.financialGoal.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // Active goals first
        { targetDate: 'asc' },
      ],
    });

    return goals;
  }

  /**
   * Update goal
   */
  async updateGoal(userId: string, goalId: string, data: UpdateGoalRequest): Promise<FinancialGoal> {
    // Get existing goal
    const existingGoal = await this.getGoalById(userId, goalId);

    const updateData: any = {};

    if (data.icon) updateData.icon = data.icon;
    if (data.name) updateData.name = data.name;
    if (data.targetAmount) {
      if (data.targetAmount <= 0) {
        throw {
          code: ErrorCodes.INVALID_AMOUNT,
          message: ERROR_MESSAGES.INVALID_AMOUNT,
        };
      }
      updateData.targetAmount = data.targetAmount;
    }
    if (data.targetDate) {
      const targetDateObj = new Date(data.targetDate);
      if (targetDateObj <= new Date()) {
        throw {
          code: ErrorCodes.INVALID_DATE_RANGE,
          message: 'يجب أن يكون التاريخ المستهدف في المستقبل',
        };
      }
      updateData.targetDate = targetDateObj;
    }
    if (data.status) {
      updateData.status = data.status;
      if (data.status === GoalStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }
    }

    // Recalculate progress if target amount changed
    if (data.targetAmount) {
      const progressPercentage = (Number(existingGoal.currentAmount) / data.targetAmount) * 100;
      updateData.progressPercentage = Math.min(progressPercentage, 100);
    }

    // Update goal
    const updatedGoal = await prisma.financialGoal.update({
      where: { id: goalId },
      data: updateData,
    });

    // Create audit log
    await this.createAuditLog({
      userId,
      action: 'UPDATE',
      entityType: 'FinancialGoal',
      entityId: goalId,
      oldValues: existingGoal,
      newValues: updatedGoal,
    });

    logger.info('Financial goal updated', { userId, goalId });

    return updatedGoal;
  }

  /**
   * Delete goal (soft delete)
   */
  async deleteGoal(userId: string, goalId: string): Promise<{ message: string }> {
    // Check if goal exists
    await this.getGoalById(userId, goalId);

    // Soft delete
    await prisma.financialGoal.update({
      where: { id: goalId },
      data: {
        deletedAt: new Date(),
        status: GoalStatus.DELETED,
      },
    });

    // Create audit log
    await this.createAuditLog({
      userId,
      action: 'DELETE',
      entityType: 'FinancialGoal',
      entityId: goalId,
    });

    logger.info('Financial goal deleted', { userId, goalId });

    return {
      message: SUCCESS_MESSAGES.GOAL_DELETED,
    };
  }

  /**
   * Add transaction to goal (deposit or withdrawal)
   */
  async addTransaction(userId: string, goalId: string, data: GoalTransactionRequest): Promise<{
    transaction: GoalTransaction;
    goal: FinancialGoal;
  }> {
    const { amount, transactionType, description } = data;

    // Validate amount
    if (amount <= 0) {
      throw {
        code: ErrorCodes.INVALID_AMOUNT,
        message: ERROR_MESSAGES.INVALID_AMOUNT,
      };
    }

    // Get goal
    const goal = await this.getGoalById(userId, goalId);

    // Check if goal is active
    if (goal.status !== GoalStatus.ACTIVE) {
      throw {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'الهدف المالي غير نشط',
      };
    }

    const currentAmount = Number(goal.currentAmount);
    const targetAmount = Number(goal.targetAmount);
    let newAmount = currentAmount;

    // Calculate new amount
    if (transactionType === 'DEPOSIT') {
      newAmount = currentAmount + amount;
    } else if (transactionType === 'WITHDRAWAL') {
      if (currentAmount < amount) {
        throw {
          code: ErrorCodes.INSUFFICIENT_BALANCE,
          message: ERROR_MESSAGES.INSUFFICIENT_BALANCE,
        };
      }
      newAmount = currentAmount - amount;
    }

    // Calculate progress
    const progressPercentage = (newAmount / targetAmount) * 100;
    const roundedProgress = Math.min(Math.round(progressPercentage * 100) / 100, 100);

    // Check milestones
    const milestones = {
      milestone25: roundedProgress >= 25 && !goal.milestone25,
      milestone50: roundedProgress >= 50 && !goal.milestone50,
      milestone75: roundedProgress >= 75 && !goal.milestone75,
      milestone100: roundedProgress >= 100 && !goal.milestone100,
    };

    // Update goal in transaction
    const [transaction, updatedGoal] = await prisma.$transaction(async (tx) => {
      // Create transaction
      const trans = await tx.goalTransaction.create({
        data: {
          userId,
          goalId,
          amount,
          transactionType,
          description,
          balanceBefore: currentAmount,
          balanceAfter: newAmount,
          transactionDate: new Date(),
        },
      });

      // Update goal
      const updateData: any = {
        currentAmount: newAmount,
        progressPercentage: roundedProgress,
      };

      // Update milestones
      if (milestones.milestone25) updateData.milestone25 = true;
      if (milestones.milestone50) updateData.milestone50 = true;
      if (milestones.milestone75) updateData.milestone75 = true;
      if (milestones.milestone100) {
        updateData.milestone100 = true;
        updateData.status = GoalStatus.COMPLETED;
        updateData.completedAt = new Date();
      }

      const updGoal = await tx.financialGoal.update({
        where: { id: goalId },
        data: updateData,
      });

      return [trans, updGoal];
    });

    // Create notifications for milestones
    for (const [milestone, reached] of Object.entries(milestones)) {
      if (reached) {
        const milestonePercent = milestone.replace('milestone', '');
        await this.createMilestoneNotification(userId, goal.name, milestonePercent);
      }
    }

    // Create audit log
    await this.createAuditLog({
      userId,
      action: 'CREATE',
      entityType: 'GoalTransaction',
      entityId: transaction.id,
      newValues: transaction,
    });

    logger.info('Goal transaction added', {
      userId,
      goalId,
      transactionId: transaction.id,
      type: transactionType,
      amount,
      newProgress: roundedProgress,
    });

    return {
      transaction,
      goal: updatedGoal,
    };
  }

  /**
   * Get goal transactions
   */
  async getGoalTransactions(userId: string, goalId: string): Promise<GoalTransaction[]> {
    // Check if goal exists and belongs to user
    await this.getGoalById(userId, goalId);

    const transactions = await prisma.goalTransaction.findMany({
      where: {
        userId,
        goalId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions;
  }

  /**
   * Get goal statistics
   */
  async getGoalStats(userId: string, goalId: string): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    transactionCount: number;
    averageDeposit: number;
    daysRemaining: number;
    requiredMonthlySavings: number;
    onTrack: boolean;
  }> {
    const goal = await this.getGoalById(userId, goalId);

    const [deposits, withdrawals, transactionCount] = await Promise.all([
      prisma.goalTransaction.aggregate({
        where: { goalId, transactionType: 'DEPOSIT' },
        _sum: { amount: true },
        _avg: { amount: true },
      }),
      prisma.goalTransaction.aggregate({
        where: { goalId, transactionType: 'WITHDRAWAL' },
        _sum: { amount: true },
      }),
      prisma.goalTransaction.count({
        where: { goalId },
      }),
    ]);

    // Calculate days remaining
    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate required monthly savings
    const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
    const monthsRemaining = daysRemaining / 30;
    const requiredMonthlySavings = monthsRemaining > 0 ? remaining / monthsRemaining : 0;

    // Calculate if on track
    const expectedProgress = Math.max(0, 100 - (daysRemaining / 
      ((targetDate.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24)) * 100));
    const onTrack = Number(goal.progressPercentage) >= expectedProgress;

    return {
      totalDeposits: Number(deposits._sum.amount || 0),
      totalWithdrawals: Number(withdrawals._sum.amount || 0),
      transactionCount,
      averageDeposit: Number(deposits._avg.amount || 0),
      daysRemaining: Math.max(0, daysRemaining),
      requiredMonthlySavings: Math.max(0, requiredMonthlySavings),
      onTrack,
    };
  }

  /**
   * Create milestone notification
   */
  private async createMilestoneNotification(userId: string, goalName: string, milestone: string): Promise<void> {
    try {
      const messages: Record<string, { title: string; message: string }> = {
        '25': {
          title: 'تهانينا! وصلت إلى 25% من هدفك',
          message: `لقد حققت ربع المسافة نحو ${goalName}. استمر في الادخار!`,
        },
        '50': {
          title: 'رائع! وصلت إلى نصف الطريق',
          message: `وصلت إلى 50% من هدف ${goalName}. أنت في الطريق الصحيح!`,
        },
        '75': {
          title: 'ممتاز! تقريباً وصلت للهدف',
          message: `وصلت إلى 75% من هدف ${goalName}. الهدف قريب جداً!`,
        },
        '100': {
          title: 'مبروك! حققت هدفك',
          message: `تهانينا! لقد حققت هدف ${goalName} بنجاح. حان الوقت لهدف جديد!`,
        },
      };

      const content = messages[milestone];
      if (!content) return;

      await prisma.notification.create({
        data: {
          userId,
          type: 'GOAL_MILESTONE',
          title: content.title,
          titleAr: content.title,
          message: content.message,
          messageAr: content.message,
          channels: ['push', 'app'],
          priority: 'HIGH',
          data: { goalName, milestone },
        },
      });

      logger.info('Milestone notification created', { userId, goalName, milestone });
    } catch (error) {
      logger.error('Failed to create milestone notification', { error });
    }
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

export const goalService = new GoalService();
