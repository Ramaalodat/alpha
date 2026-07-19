import cron from 'node-cron';
import logger from '../utils/logger';
import { cycleMonitorJob } from './cycle-monitor.job';
import { commitmentMonitorJob } from './commitment-monitor.job';

export class CronManager {
  private static jobs: cron.ScheduledTask[] = [];

  /**
   * Initialize and start all scheduled cron jobs
   */
  public static startAll() {
    logger.info('Initializing Cron Manager and background tasks...');

    // 1. Cycle Monitor Job (Runs daily at midnight)
    // Check if any financial cycle has ended and needs settlement
    const cycleJob = cron.schedule('0 0 * * *', async () => {
      logger.info('Running Cycle Monitor Job...');
      try {
        await cycleMonitorJob();
        logger.info('Cycle Monitor Job completed successfully.');
      } catch (error: any) {
        logger.error('Cycle Monitor Job failed', { error: error.message });
      }
    });
    this.jobs.push(cycleJob);

    // 2. Commitment Monitor Job (Runs daily at 00:05 to avoid overlap with cycle job)
    // Check for due or overdue commitments
    const commitmentJob = cron.schedule('5 0 * * *', async () => {
      logger.info('Running Commitment Monitor Job...');
      try {
        await commitmentMonitorJob();
        logger.info('Commitment Monitor Job completed successfully.');
      } catch (error: any) {
        logger.error('Commitment Monitor Job failed', { error: error.message });
      }
    });
    this.jobs.push(commitmentJob);

    logger.info(`Cron Manager started successfully with ${this.jobs.length} registered jobs.`);
  }

  /**
   * Stop all running cron jobs
   */
  public static stopAll() {
    this.jobs.forEach(job => job.stop());
    logger.info('All cron jobs stopped.');
  }
}
