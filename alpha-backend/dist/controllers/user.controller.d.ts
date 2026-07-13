import { FastifyRequest, FastifyReply } from 'fastify';
export declare class UserController {
    /**
     * Get user profile
     * GET /api/users/profile
     */
    getProfile(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Update user basic information
     * PATCH /api/users/profile
     */
    updateUser(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get current profile version
     * GET /api/users/profile/current
     */
    getCurrentProfile(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Update user profile (creates new version)
     * PUT /api/users/profile/update
     */
    updateProfile(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get profile history
     * GET /api/users/profile/history
     */
    getProfileHistory(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get user settings
     * GET /api/users/settings
     */
    getSettings(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Update user settings
     * PATCH /api/users/settings
     */
    updateSettings(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Change password
     * POST /api/users/change-password
     */
    changePassword(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get user statistics
     * GET /api/users/stats
     */
    getUserStats(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Delete account
     * DELETE /api/users/account
     */
    deleteAccount(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
export declare const userController: UserController;
//# sourceMappingURL=user.controller.d.ts.map