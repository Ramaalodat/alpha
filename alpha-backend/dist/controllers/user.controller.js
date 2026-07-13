"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const logger_1 = __importDefault(require("../utils/logger"));
class UserController {
    /**
     * Get user profile
     * GET /api/users/profile
     */
    async getProfile(request, reply) {
        try {
            const userId = request.user.userId;
            const user = await user_service_1.userService.getUserById(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(user));
        }
        catch (error) {
            logger_1.default.error('Get profile failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.NOT_FOUND)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Update user basic information
     * PATCH /api/users/profile
     */
    async updateUser(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const updatedUser = await user_service_1.userService.updateUser(userId, body);
            logger_1.default.info('User updated', { userId });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(updatedUser, 'تم تحديث المعلومات بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Update user failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Get current profile version
     * GET /api/users/profile/current
     */
    async getCurrentProfile(request, reply) {
        try {
            const userId = request.user.userId;
            const profile = await user_service_1.userService.getCurrentProfile(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(profile));
        }
        catch (error) {
            logger_1.default.error('Get current profile failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.NOT_FOUND)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.NOT_FOUND, 'الملف الشخصي غير موجود'));
        }
    }
    /**
     * Update user profile (creates new version)
     * PUT /api/users/profile/update
     */
    async updateProfile(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const profile = await user_service_1.userService.updateProfile({
                userId,
                ...body,
            });
            logger_1.default.info('Profile updated', { userId, version: profile.version });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(profile, 'تم تحديث الملف الشخصي بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Update profile failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Get profile history
     * GET /api/users/profile/history
     */
    async getProfileHistory(request, reply) {
        try {
            const userId = request.user.userId;
            const history = await user_service_1.userService.getProfileHistory(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(history));
        }
        catch (error) {
            logger_1.default.error('Get profile history failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Get user settings
     * GET /api/users/settings
     */
    async getSettings(request, reply) {
        try {
            const userId = request.user.userId;
            const settings = await user_service_1.userService.getSettings(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(settings));
        }
        catch (error) {
            logger_1.default.error('Get settings failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Update user settings
     * PATCH /api/users/settings
     */
    async updateSettings(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const settings = await user_service_1.userService.updateSettings(userId, body);
            logger_1.default.info('Settings updated', { userId });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(settings, 'تم تحديث الإعدادات بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Update settings failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Change password
     * POST /api/users/change-password
     */
    async changePassword(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const result = await user_service_1.userService.changePassword({
                userId,
                ...body,
            });
            logger_1.default.info('Password changed', { userId });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(null, result.message));
        }
        catch (error) {
            logger_1.default.error('Change password failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Get user statistics
     * GET /api/users/stats
     */
    async getUserStats(request, reply) {
        try {
            const userId = request.user.userId;
            const stats = await user_service_1.userService.getUserStats(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(stats));
        }
        catch (error) {
            logger_1.default.error('Get user stats failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Delete account
     * DELETE /api/users/account
     */
    async deleteAccount(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const result = await user_service_1.userService.deleteAccount(userId, body.password);
            logger_1.default.info('Account deleted', { userId });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(null, result.message));
        }
        catch (error) {
            logger_1.default.error('Delete account failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
//# sourceMappingURL=user.controller.js.map