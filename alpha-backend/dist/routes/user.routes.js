"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const userRoutes = async (fastify) => {
    // All routes require authentication
    fastify.addHook('onRequest', auth_middleware_1.authenticate);
    /**
     * @route   GET /api/users/profile
     * @desc    Get user profile
     * @access  Private
     */
    fastify.get('/profile', user_controller_1.userController.getProfile);
    /**
     * @route   PATCH /api/users/profile
     * @desc    Update user basic information
     * @access  Private
     */
    fastify.patch('/profile', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.updateUserSchema)],
    }, user_controller_1.userController.updateUser);
    /**
     * @route   GET /api/users/profile/current
     * @desc    Get current profile version
     * @access  Private
     */
    fastify.get('/profile/current', user_controller_1.userController.getCurrentProfile);
    /**
     * @route   PUT /api/users/profile/update
     * @desc    Update user profile (creates new version)
     * @access  Private
     */
    fastify.put('/profile/update', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.updateProfileSchema)],
    }, user_controller_1.userController.updateProfile);
    /**
     * @route   GET /api/users/profile/history
     * @desc    Get profile history
     * @access  Private
     */
    fastify.get('/profile/history', user_controller_1.userController.getProfileHistory);
    /**
     * @route   GET /api/users/settings
     * @desc    Get user settings
     * @access  Private
     */
    fastify.get('/settings', user_controller_1.userController.getSettings);
    /**
     * @route   PATCH /api/users/settings
     * @desc    Update user settings
     * @access  Private
     */
    fastify.patch('/settings', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.updateSettingsSchema)],
    }, user_controller_1.userController.updateSettings);
    /**
     * @route   POST /api/users/change-password
     * @desc    Change password
     * @access  Private
     */
    fastify.post('/change-password', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.changePasswordSchema)],
    }, user_controller_1.userController.changePassword);
    /**
     * @route   GET /api/users/stats
     * @desc    Get user statistics
     * @access  Private
     */
    fastify.get('/stats', user_controller_1.userController.getUserStats);
    /**
     * @route   DELETE /api/users/account
     * @desc    Delete account
     * @access  Private
     */
    fastify.delete('/account', user_controller_1.userController.deleteAccount);
};
exports.userRoutes = userRoutes;
//# sourceMappingURL=user.routes.js.map