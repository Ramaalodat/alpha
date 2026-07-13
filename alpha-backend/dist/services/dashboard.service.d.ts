import { DashboardSummary } from '../types/user.types';
export declare class DashboardService {
    /**
     * Get dashboard summary for user
     */
    getDashboardSummary(userId: string): Promise<DashboardSummary>;
    /**
     * Get financial health score
     */
    getFinancialHealthScore(userId: string): Promise<{
        score: number;
        breakdown: {
            savings: number;
            budgetAdherence: number;
            goalProgress: number;
            emergencyFund: number;
        };
        recommendations: string[];
    }>;
}
export declare const dashboardService: DashboardService;
//# sourceMappingURL=dashboard.service.d.ts.map