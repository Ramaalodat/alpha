import { FastifyRequest, FastifyReply } from 'fastify';
export declare class ExpenseController {
    /**
     * Create new expense
     * POST /api/expenses
     */
    createExpense(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get all user expenses
     * GET /api/expenses
     */
    getUserExpenses(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get expense by ID
     * GET /api/expenses/:expenseId
     */
    getExpenseById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Update expense
     * PATCH /api/expenses/:expenseId
     */
    updateExpense(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Delete expense
     * DELETE /api/expenses/:expenseId
     */
    deleteExpense(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get expense categories
     * GET /api/expenses/categories
     */
    getCategories(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Create custom category
     * POST /api/expenses/categories
     */
    createCategory(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get expense statistics
     * GET /api/expenses/stats
     */
    getExpenseStats(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get monthly comparison
     * GET /api/expenses/monthly-comparison
     */
    getMonthlyComparison(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
export declare const expenseController: ExpenseController;
//# sourceMappingURL=expense.controller.d.ts.map