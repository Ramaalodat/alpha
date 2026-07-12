"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const logger_1 = __importDefault(require("../utils/logger"));
class DashboardController {
    /**
     * Get dashboard summary
     * GET /api/dashboard
     */
    async getDashboardSummary(request, reply) {
        try {
            const userId = request.user.userId;
            const summary = await dashboard_service_1.dashboardService.getDashboardSummary(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(summary));
        }
        catch (error) {
            logger_1.default.error('Get dashboard summary failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Get financial health score
     * GET /api/dashboard/health-score
     */
    async getFinancialHealthScore(request, reply) {
        try {
            const userId = request.user.userId;
            const healthScore = await dashboard_service_1.dashboardService.getFinancialHealthScore(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(healthScore));
        }
        catch (error) {
            logger_1.default.error('Get financial health score failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map