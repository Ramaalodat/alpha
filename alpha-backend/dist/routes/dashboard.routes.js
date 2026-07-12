"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const dashboardRoutes = async (fastify) => {
    // All routes require authentication and completed onboarding
    fastify.addHook('onRequest', auth_middleware_1.authenticate);
    fastify.addHook('onRequest', auth_middleware_1.requireOnboarding);
    /**
     * @route   GET /api/dashboard
     * @desc    Get dashboard summary
     * @access  Private
     */
    fastify.get('/', dashboard_controller_1.dashboardController.getDashboardSummary);
    /**
     * @route   GET /api/dashboard/health-score
     * @desc    Get financial health score
     * @access  Private
     */
    fastify.get('/health-score', dashboard_controller_1.dashboardController.getFinancialHealthScore);
};
exports.dashboardRoutes = dashboardRoutes;
//# sourceMappingURL=dashboard.routes.js.map