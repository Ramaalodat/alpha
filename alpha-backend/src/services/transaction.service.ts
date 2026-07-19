import { TransactionDirection, TransactionType, BudgetBucket, TransactionStatus, IncomeSourceType } from '@prisma/client';
import prisma from '../lib/prisma';

export interface RecordTransactionDto {
  userId: string;
  cycleId?: string;
  amount: number;
  direction: TransactionDirection;
  transactionType: TransactionType;
  incomeKind?: IncomeSourceType;
  budgetBucket?: BudgetBucket;
  categoryId?: string;
  description?: string;
  occurredAt?: Date;
}

export class TransactionService {
  /**
   * Records a new transaction in the unified ledger.
   * Atomic operations should be used for critical money movements.
   */
  public static async recordTransaction(dto: RecordTransactionDto) {
    return await prisma.transaction.create({
      data: {
        userId: dto.userId,
        cycleId: dto.cycleId,
        amount: dto.amount,
        direction: dto.direction,
        transactionType: dto.transactionType,
        incomeKind: dto.incomeKind,
        budgetBucket: dto.budgetBucket,
        categoryId: dto.categoryId,
        description: dto.description,
        occurredAt: dto.occurredAt || new Date(),
        status: TransactionStatus.CONFIRMED,
        confirmedAt: new Date()
      }
    });
  }

  /**
   * Cancels a transaction. A transaction is never deleted, only marked as cancelled.
   */
  public static async cancelTransaction(transactionId: string) {
    return await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.CANCELLED
      }
    });
  }

  /**
   * Updates an existing transaction.
   */
  public static async updateTransaction(transactionId: string, data: Partial<RecordTransactionDto>) {
    return await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        amount: data.amount,
        direction: data.direction,
        transactionType: data.transactionType,
        incomeKind: data.incomeKind,
        budgetBucket: data.budgetBucket,
        categoryId: data.categoryId,
        description: data.description,
        occurredAt: data.occurredAt
      }
    });
  }

  /**
   * Summarizes spending per bucket for a given cycle.
   */
  public static async getCycleSpendingSummary(cycleId: string) {
    const summary = await prisma.transaction.groupBy({
      by: ['budgetBucket'],
      where: {
        cycleId,
        direction: TransactionDirection.OUTFLOW,
        status: TransactionStatus.CONFIRMED,
        budgetBucket: { not: null }
      },
      _sum: {
        amount: true
      }
    });

    return summary.reduce((acc, curr) => {
      if (curr.budgetBucket) {
        acc[curr.budgetBucket] = Number(curr._sum.amount || 0);
      }
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Summarizes total recorded income for a given cycle.
   */
  public static async getCycleIncomeSummary(cycleId: string) {
    const summary = await prisma.transaction.aggregate({
      where: {
        cycleId,
        direction: TransactionDirection.INFLOW,
        status: TransactionStatus.CONFIRMED
      },
      _sum: {
        amount: true
      }
    });

    return Number(summary._sum.amount || 0);
  }
}
