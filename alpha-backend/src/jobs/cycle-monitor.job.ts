import prisma from '../lib/prisma';
import { CycleStatus } from '@prisma/client';
import logger from '../utils/logger';
import { CycleService } from '../services/cycle.service';

/**
 * Job that finds all OPEN cycles whose endDate has passed
 * and marks them as SETTLEMENT_PENDING.
 */
export const cycleMonitorJob = async () => {
  const now = new Date();
  
  // Find all open cycles that have ended
  const endedCycles = await prisma.financialCycle.findMany({
    where: {
      status: CycleStatus.OPEN,
      endDate: {
        lt: now
      }
    }
  });

  if (endedCycles.length === 0) {
    logger.info('Cycle Monitor: No ended cycles found to process.');
    return;
  }

  logger.info(`Cycle Monitor: Found ${endedCycles.length} cycles ready for settlement.`);

  let successCount = 0;
  let failureCount = 0;

  for (const cycle of endedCycles) {
    try {
      await CycleService.markSettlementPending(cycle.id);
      successCount++;
      // TODO: In the future, trigger a push notification to the user here
      // NotificationService.sendPush(cycle.userId, 'Your financial cycle has ended. Please review and settle it.');
    } catch (error: any) {
      logger.error(`Cycle Monitor: Failed to mark cycle ${cycle.id} as pending.`, { error: error.message });
      failureCount++;
    }
  }

  logger.info(`Cycle Monitor: Completed. Success: ${successCount}, Failures: ${failureCount}`);
};
