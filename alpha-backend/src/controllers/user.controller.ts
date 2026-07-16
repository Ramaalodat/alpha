import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/user.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import logger from '../utils/logger';

export class UserController {
  /**
   * Get user profile
   * GET /api/users/profile
   */
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const user = await userService.getUserById(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(user));
    } catch (error: any) {
      logger.error('Get profile failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.NOT_FOUND)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Update user demographics
   * PATCH /api/users/demographics
   */
  async updateDemographics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as {
        gender: string;
        maritalStatus?: string;
        isHeadOfHousehold?: boolean;
        isStudent?: boolean;
      };

      const updatedUser = await userService.updateDemographics({
        userId,
        ...body,
      });

      logger.info('Demographics updated', { userId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(updatedUser, 'تم تحديث البيانات الشخصية بنجاح'));
    } catch (error: any) {
      logger.error('Update demographics failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Update user basic information
   * PATCH /api/users/profile
   */
  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as {
        fullName?: string;
        birthDate?: string;
      };

      const updatedUser = await userService.updateUser(userId, body);

      logger.info('User updated', { userId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(updatedUser, 'تم تحديث المعلومات بنجاح'));
    } catch (error: any) {
      logger.error('Update user failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Get current profile version
   * GET /api/users/profile/current
   */
  async getCurrentProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const profile = await userService.getCurrentProfile(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(profile));
    } catch (error: any) {
      logger.error('Get current profile failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.NOT_FOUND)
        .send(createErrorResponse(ErrorCodes.NOT_FOUND, 'الملف الشخصي غير موجود'));
    }
  }

  /**
   * Update user profile (creates new version)
   * PUT /api/users/profile/update
   */
  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as any;

      const profile = await userService.updateProfile({
        userId,
        ...body,
      });

      logger.info('Profile updated', { userId, version: profile.version });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(profile, 'تم تحديث الملف الشخصي بنجاح'));
    } catch (error: any) {
      logger.error('Update profile failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Get profile history
   * GET /api/users/profile/history
   */
  async getProfileHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const history = await userService.getProfileHistory(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(history));
    } catch (error: any) {
      logger.error('Get profile history failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Get user settings
   * GET /api/users/settings
   */
  async getSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const settings = await userService.getSettings(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(settings));
    } catch (error: any) {
      logger.error('Get settings failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Update user settings
   * PATCH /api/users/settings
   */
  async updateSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as any;

      const settings = await userService.updateSettings(userId, body);

      logger.info('Settings updated', { userId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(settings, 'تم تحديث الإعدادات بنجاح'));
    } catch (error: any) {
      logger.error('Update settings failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Change password
   * POST /api/users/change-password
   */
  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as {
        currentPassword: string;
        newPassword: string;
      };

      const result = await userService.changePassword({
        userId,
        ...body,
      });

      logger.info('Password changed', { userId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(null, result.message));
    } catch (error: any) {
      logger.error('Change password failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Get user statistics
   * GET /api/users/stats
   */
  async getUserStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const stats = await userService.getUserStats(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(stats));
    } catch (error: any) {
      logger.error('Get user stats failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Delete account
   * DELETE /api/users/account
   */
  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as { password: string };

      const result = await userService.deleteAccount(userId, body.password);

      logger.info('Account deleted', { userId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(null, result.message));
    } catch (error: any) {
      logger.error('Delete account failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }
}

export const userController = new UserController();
