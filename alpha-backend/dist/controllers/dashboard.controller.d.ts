import { FastifyRequest, FastifyReply } from 'fastify';
export declare class DashboardController {
    /**
     * Get dashboard summary
     * GET /api/dashboard
     */
    getDashboardSummary(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get financial health score
     * GET /api/dashboard/health-score
     */
    getFinancialHealthScore(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
export declare const dashboardController: DashboardController;
//# sourceMappingURL=dashboard.controller.d.ts.map