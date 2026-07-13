import { FastifyRequest, FastifyReply } from 'fastify';
import { dashboardService } from '../services/dashboard.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import logger from '../utils/logger';

export class DashboardController {
  /**
   * Get dashboard summary
   * GET /api/dashboard
   */
  async getDashboardSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const summary = await dashboardService.getDashboardSummary(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(summary));
    } catch (error: any) {
      logger.error('Get dashboard summary failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Get financial health score
   * GET /api/dashboard/health-score
   */
  async getFinancialHealthScore(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const healthScore = await dashboardService.getFinancialHealthScore(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(healthScore));
    } catch (error: any) {
      logger.error('Get financial health score failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(error.code, error.message));
    }
  }
}

export const dashboardController = new DashboardController();
