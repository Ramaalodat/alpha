import { FastifyInstance } from 'fastify';
import { userController } from '../controllers/user.controller';
import { authenticate, requireOnboarding } from '../middleware/auth.middleware';
import {
  validate,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateSettingsSchema,
} from '../middleware/validation.middleware';

export const userRoutes = async (fastify: FastifyInstance) => {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  /**
   * @route   GET /api/users/profile
   * @desc    Get user profile
   * @access  Private
   */
  fastify.get('/profile', userController.getProfile);

  /**
   * @route   PATCH /api/users/profile
   * @desc    Update user basic information
   * @access  Private
   */
  fastify.patch(
    '/profile',
    {
      preHandler: [validate(updateUserSchema)],
    },
    userController.updateUser
  );

  /**
   * @route   GET /api/users/profile/current
   * @desc    Get current profile version
   * @access  Private
   */
  fastify.get('/profile/current', userController.getCurrentProfile);

  /**
   * @route   PUT /api/users/profile/update
   * @desc    Update user profile (creates new version)
   * @access  Private
   */
  fastify.put(
    '/profile/update',
    {
      preHandler: [validate(updateProfileSchema)],
    },
    userController.updateProfile
  );

  /**
   * @route   GET /api/users/profile/history
   * @desc    Get profile history
   * @access  Private
   */
  fastify.get('/profile/history', userController.getProfileHistory);

  /**
   * @route   GET /api/users/settings
   * @desc    Get user settings
   * @access  Private
   */
  fastify.get('/settings', userController.getSettings);

  /**
   * @route   PATCH /api/users/settings
   * @desc    Update user settings
   * @access  Private
   */
  fastify.patch(
    '/settings',
    {
      preHandler: [validate(updateSettingsSchema)],
    },
    userController.updateSettings
  );

  /**
   * @route   POST /api/users/change-password
   * @desc    Change password
   * @access  Private
   */
  fastify.post(
    '/change-password',
    {
      preHandler: [validate(changePasswordSchema)],
    },
    userController.changePassword
  );

  /**
   * @route   GET /api/users/stats
   * @desc    Get user statistics
   * @access  Private
   */
  fastify.get('/stats', userController.getUserStats);

  /**
   * @route   DELETE /api/users/account
   * @desc    Delete account
   * @access  Private
   */
  fastify.delete('/account', userController.deleteAccount);
};
