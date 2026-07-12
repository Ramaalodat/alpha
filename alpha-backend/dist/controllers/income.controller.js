"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incomeController = exports.IncomeController = void 0;
const income_service_1 = require("../services/income.service");
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const logger_1 = __importDefault(require("../utils/logger"));
class IncomeController {
    async createIncome(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const income = await income_service_1.incomeService.createIncome(userId, body);
            logger_1.default.info('Income created', { userId, incomeId: income.id });
            // Serialize Prisma/Decimal/Date values to plain JSON
            const incomePayload = JSON.parse(JSON.stringify(income));
            return reply.status(constants_1.HTTP_STATUS.CREATED).send((0, api_types_1.createSuccessResponse)(incomePayload, 'تم إضافة الدخل بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Create income failed', { error: error.message });
            return reply.status(constants_1.HTTP_STATUS.BAD_REQUEST).send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    async getUserIncomes(request, reply) {
        try {
            const userId = request.user.userId;
            const query = request.query;
            const incomes = await income_service_1.incomeService.getUserIncomes(userId, query);
            // Serialize Prisma/Decimal/Date values to plain JSON
            const incomesPayload = JSON.parse(JSON.stringify(incomes));
            return reply.status(constants_1.HTTP_STATUS.OK).send((0, api_types_1.createSuccessResponse)(incomesPayload));
        }
        catch (error) {
            logger_1.default.error('Get user incomes failed', { error: error.message });
            return reply.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    async getIncomeById(request, reply) {
        try {
            const userId = request.user.userId;
            const { incomeId } = request.params;
            const income = await income_service_1.incomeService.getIncomeById(userId, incomeId);
            const incomePayload = JSON.parse(JSON.stringify(income));
            return reply.status(constants_1.HTTP_STATUS.OK).send((0, api_types_1.createSuccessResponse)(incomePayload));
        }
        catch (error) {
            logger_1.default.error('Get income by id failed', { error: error.message });
            return reply.status(constants_1.HTTP_STATUS.NOT_FOUND).send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    async updateIncome(request, reply) {
        try {
            const userId = request.user.userId;
            const { incomeId } = request.params;
            const body = request.body;
            const income = await income_service_1.incomeService.updateIncome(userId, incomeId, body);
            logger_1.default.info('Income updated', { userId, incomeId });
            const incomePayload = JSON.parse(JSON.stringify(income));
            return reply.status(constants_1.HTTP_STATUS.OK).send((0, api_types_1.createSuccessResponse)(incomePayload, 'تم تحديث الدخل بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Update income failed', { error: error.message });
            return reply.status(constants_1.HTTP_STATUS.BAD_REQUEST).send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    async deleteIncome(request, reply) {
        try {
            const userId = request.user.userId;
            const { incomeId } = request.params;
            const result = await income_service_1.incomeService.deleteIncome(userId, incomeId);
            logger_1.default.info('Income deleted', { userId, incomeId });
            return reply.status(constants_1.HTTP_STATUS.OK).send((0, api_types_1.createSuccessResponse)(null, result.message));
        }
        catch (error) {
            logger_1.default.error('Delete income failed', { error: error.message });
            return reply.status(constants_1.HTTP_STATUS.BAD_REQUEST).send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    async getIncomeStats(request, reply) {
        try {
            const userId = request.user.userId;
            const query = request.query;
            const startDate = query.startDate ? new Date(query.startDate) : undefined;
            const endDate = query.endDate ? new Date(query.endDate) : undefined;
            const stats = await income_service_1.incomeService.getIncomeStats(userId, startDate, endDate);
            return reply.status(constants_1.HTTP_STATUS.OK).send((0, api_types_1.createSuccessResponse)(stats));
        }
        catch (error) {
            logger_1.default.error('Get income stats failed', { error: error.message });
            return reply.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
}
exports.IncomeController = IncomeController;
exports.incomeController = new IncomeController();
//# sourceMappingURL=income.controller.js.map