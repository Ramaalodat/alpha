import { FinancialGoal, GoalTransaction } from '@prisma/client';
import { CreateGoalRequest, UpdateGoalRequest, GoalTransactionRequest, GoalFilters } from '../types/user.types';
export declare class GoalService {
    /**
     * Create financial goal
     */
    createGoal(userId: string, data: CreateGoalRequest): Promise<FinancialGoal>;
    /**
     * Get goal by ID
     */
    getGoalById(userId: string, goalId: string): Promise<FinancialGoal>;
    /**
     * Get all goals for user
     */
    getUserGoals(userId: string, filters?: GoalFilters): Promise<FinancialGoal[]>;
    /**
     * Update goal
     */
    updateGoal(userId: string, goalId: string, data: UpdateGoalRequest): Promise<FinancialGoal>;
    /**
     * Delete goal (soft delete)
     */
    deleteGoal(userId: string, goalId: string): Promise<{
        message: string;
    }>;
    /**
     * Add transaction to goal (deposit or withdrawal)
     */
    addTransaction(userId: string, goalId: string, data: GoalTransactionRequest): Promise<{
        transaction: GoalTransaction;
        goal: FinancialGoal;
    }>;
    /**
     * Get goal transactions
     */
    getGoalTransactions(userId: string, goalId: string): Promise<GoalTransaction[]>;
    /**
     * Get goal statistics
     */
    getGoalStats(userId: string, goalId: string): Promise<{
        totalDeposits: number;
        totalWithdrawals: number;
        transactionCount: number;
        averageDeposit: number;
        daysRemaining: number;
        requiredMonthlySavings: number;
        onTrack: boolean;
    }>;
    /**
     * Create milestone notification
     */
    private createMilestoneNotification;
    /**
     * Create audit log entry
     */
    private createAuditLog;
}
export declare const goalService: GoalService;
//# sourceMappingURL=goal.service.d.ts.map