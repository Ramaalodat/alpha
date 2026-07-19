import { BudgetBucket, CycleStatus, TransactionDirection, TransactionStatus, OccurrenceStatus } from '@prisma/client';
import prisma from '../lib/prisma';

export interface BucketStatus {
  bucket: BudgetBucket;
  allocatedAmount: number;
  actualAmount: number;
  remainingAmount: number;
  usagePercent: number;
  status: 'Healthy' | 'Moderate' | 'Warning' | 'Critical' | 'Exceeded';
}

export class BucketBalanceService {
  /**
   * Retrieves the status of a specific bucket (Needs or Wants).
   */
  public static async getBucketStatus(cycleId: string, bucket: BudgetBucket): Promise<BucketStatus> {
    const cycle = await prisma.financialCycle.findUnique({
      where: { id: cycleId },
      include: { allocationSnapshot: true }
    });

    if (!cycle || !cycle.allocationSnapshot) {
      throw new Error('Cycle or allocation snapshot not found');
    }

    const snapshot = cycle.allocationSnapshot;

    let allocatedAmount = 0;
    if (bucket === BudgetBucket.NEEDS) allocatedAmount = Number(snapshot.needsTarget);
    else if (bucket === BudgetBucket.WANTS) allocatedAmount = Number(snapshot.wantsTarget);
    else if (bucket === BudgetBucket.SAVINGS) allocatedAmount = Number(snapshot.savingsTarget);

    // Sum of paid expenses for this bucket
    const transactions = await prisma.transaction.aggregate({
      where: {
        cycleId,
        budgetBucket: bucket,
        direction: TransactionDirection.OUTFLOW,
        status: TransactionStatus.CONFIRMED
      },
      _sum: { amount: true }
    });

    let actualAmount = Number(transactions._sum.amount || 0);

    // If NEEDS bucket, we must subtract unpaid commitments from the *remaining* or add to *actualAmount*?
    // According to the PDF (Page 14):
    // Available = Allocated - Unpaid Commitments - Paid Expenses
    // So "Reserved" commitments act like they are already spent for the purpose of "remaining".
    let unpaidCommitmentsAmount = 0;
    
    if (bucket === BudgetBucket.NEEDS) {
      const unpaidCommitments = await prisma.commitmentOccurrence.aggregate({
        where: {
          cycleId,
          status: { in: [OccurrenceStatus.UPCOMING, OccurrenceStatus.DUE, OccurrenceStatus.OVERDUE] }
        },
        _sum: { amount: true }
      });
      unpaidCommitmentsAmount = Number(unpaidCommitments._sum.amount || 0);
    }

    const remainingAmount = allocatedAmount - actualAmount - unpaidCommitmentsAmount;
    
    // Usage percent = what's actually gone + what's reserved
    const totalUsed = actualAmount + unpaidCommitmentsAmount;
    const usagePercent = allocatedAmount > 0 ? (totalUsed / allocatedAmount) * 100 : 0;

    let status: BucketStatus['status'] = 'Healthy';
    if (usagePercent > 100) status = 'Exceeded';
    else if (usagePercent >= 90) status = 'Critical';
    else if (usagePercent >= 75) status = 'Warning';
    else if (usagePercent >= 50) status = 'Moderate';

    return {
      bucket,
      allocatedAmount,
      actualAmount,
      remainingAmount,
      usagePercent,
      status
    };
  }

  /**
   * Retrieves the status for all buckets in the current cycle.
   */
  public static async getAllBucketsStatus(cycleId: string): Promise<BucketStatus[]> {
    const needs = await this.getBucketStatus(cycleId, BudgetBucket.NEEDS);
    const wants = await this.getBucketStatus(cycleId, BudgetBucket.WANTS);
    const savings = await this.getBucketStatus(cycleId, BudgetBucket.SAVINGS);

    return [needs, wants, savings];
  }
}
