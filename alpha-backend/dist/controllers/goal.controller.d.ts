import { FastifyRequest, FastifyReply } from 'fastify';
export declare class GoalController {
    /**
     * Create new goal
     * POST /api/goals
     */
    createGoal(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get all user goals
     * GET /api/goals
     */
    getUserGoals(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get goal by ID
     * GET /api/goals/:goalId
     */
    getGoalById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Update goal
     * PATCH /api/goals/:goalId
     */
    updateGoal(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Delete goal
     * DELETE /api/goals/:goalId
     */
    deleteGoal(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Add transaction to goal
     * POST /api/goals/:goalId/transactions
     */
    addTransaction(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get goal transactions
     * GET /api/goals/:goalId/transactions
     */
    getGoalTransactions(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get goal statistics
     * GET /api/goals/:goalId/stats
     */
    getGoalStats(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
export declare const goalController: GoalController;
//# sourceMappingURL=goal.controller.d.ts.map