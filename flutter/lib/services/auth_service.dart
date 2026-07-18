import 'package:alpha_app/services/api_exception.dart';
import 'package:alpha_app/services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static Future<Map<String, dynamic>> requestRegistrationOtp({
    required String phoneNumber,
    String? email,
  }) async {
    final response = await ApiService.post('/auth/request-registration-otp', body: {
      'phoneNumber': phoneNumber,
      if (email != null) 'email': email,
    });

    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    final error = body['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ?? body['message'] ?? 'Request failed',
      code: error?['code'] as String?,
      details: error?['details'] as Map<String, dynamic>?,
    );
  }

  static Future<Map<String, dynamic>> register({
    required String phoneNumber,
    required String fullName,
    required String birthDate,
    required String password,
    required String otpCode,
    String? email,
  }) async {
    final response = await ApiService.post('/auth/register', body: {
      'phoneNumber': phoneNumber,
      'fullName': fullName,
      'birthDate': birthDate,
      'password': password,
      'otpCode': otpCode,
      if (email != null) 'email': email,
    });

    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final prefs = await SharedPreferences.getInstance();
      final data = body['data'] as Map<String, dynamic>?;
      final tokens = data?['tokens'] as Map<String, dynamic>?;
      if (tokens != null) {
        await prefs.setString('access_token', tokens['accessToken'] ?? '');
        await prefs.setString('refresh_token', tokens['refreshToken'] ?? '');
      }
      return body;
    }

    final error = body['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ?? body['message'] ?? 'Registration failed',
      code: error?['code'] as String?,
      details: error?['details'] as Map<String, dynamic>?,
    );
  }

  static Future<Map<String, dynamic>> verifyPhone({
    required String phoneNumber,
    required String otpCode,
  }) async {
    final response = await ApiService.post('/auth/verify-phone', body: {
      'phoneNumber': phoneNumber,
      'otpCode': otpCode,
    });

    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final prefs = await SharedPreferences.getInstance();
      final data = body['data'] as Map<String, dynamic>?;
      final tokens = data?['tokens'] as Map<String, dynamic>?;
      if (tokens != null) {
        await prefs.setString('access_token', tokens['accessToken'] ?? '');
        await prefs.setString('refresh_token', tokens['refreshToken'] ?? '');
      }
      return body;
    }

    final error = body['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ?? body['message'] ?? 'Verification failed',
      code: error?['code'] as String?,
      details: error?['details'] as Map<String, dynamic>?,
    );
  }

  static Future<Map<String, dynamic>> login({
    required String phoneNumber,
    required String password,
  }) async {
    final response = await ApiService.post('/auth/login', body: {
      'phoneNumber': phoneNumber,
      'password': password,
    });

    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final prefs = await SharedPreferences.getInstance();
      final data = body['data'] as Map<String, dynamic>?;
      final tokens = data?['tokens'] as Map<String, dynamic>?;
      if (tokens != null) {
        await prefs.setString('access_token', tokens['accessToken'] ?? '');
        await prefs.setString('refresh_token', tokens['refreshToken'] ?? '');
      }
      return body;
    }

    final error = body['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ?? body['message'] ?? 'Login failed',
      code: error?['code'] as String?,
      details: error?['details'] as Map<String, dynamic>?,
    );
  }

  static Future<Map<String, dynamic>> resendOtp({
    required String phoneNumber,
    String purpose = 'REGISTRATION',
  }) async {
    final response = await ApiService.post('/auth/resend-otp', body: {
      'phoneNumber': phoneNumber,
      'purpose': purpose,
    });

    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    final error = body['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ?? body['message'] ?? 'Failed to resend OTP',
      code: error?['code'] as String?,
      details: error?['details'] as Map<String, dynamic>?,
    );
  }

  static Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await ApiService.get('/auth/me');
    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = body['data'];
      return data is Map
          ? Map<String, dynamic>.from(data)
          : <String, dynamic>{};
    }
    final error = body['error'] as Map<String, dynamic>?;
    throw ApiException(
      message:
          error?['message'] ?? body['message'] ?? 'Failed to get user info',
      code: error?['code'] as String?,
    );
  }

  /// Attempt to refresh the access token using the stored refresh token.
  /// Returns the new token map on success, throws on failure.
  static Future<Map<String, dynamic>> refreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshTok = prefs.getString('refresh_token');
    if (refreshTok == null || refreshTok.isEmpty) {
      throw Exception('No refresh token available');
    }

    final response = await ApiService.post('/auth/refresh-token',
        body: {
          'refreshToken': refreshTok,
        },
        skipRetry: true);

    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = body['data'] as Map<String, dynamic>?;
      final tokens = data?['tokens'] as Map<String, dynamic>?;
      if (tokens != null) {
        await prefs.setString('access_token', tokens['accessToken'] ?? '');
        await prefs.setString('refresh_token', tokens['refreshToken'] ?? '');
      }
      return body;
    }

    throw Exception(body['message'] ?? 'Token refresh failed');
  }

  /// Clear stored tokens and redirect to login.
  static Future<void> logout() async {
    try {
      await ApiService.post('/auth/logout');
    } catch (_) {
      // Ignore API errors – still clear tokens locally
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
    await prefs.remove('remember_me');
  }

  /// Send email verification link to the given email address.
  static Future<Map<String, dynamic>> sendEmailVerification({
    required String phoneNumber,
    required String email,
  }) async {
    final response =
        await ApiService.post('/auth/send-email-verification', body: {
      'phoneNumber': phoneNumber,
      'email': email,
    });

    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    final error = body['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ??
          body['message'] ??
          'Failed to send email verification',
      code: error?['code'] as String?,
    );
  }

  /// Check whether the user's email has been verified.
  static Future<bool> checkEmailVerified({required String phoneNumber}) async {
    final response = await ApiService.get(
      '/auth/email-status?phoneNumber=${Uri.encodeComponent(phoneNumber)}',
    );

    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = body['data'] as Map<String, dynamic>?;
      return data?['verified'] == true;
    }
    return false;
  }

  /// Verify email OTP
  static Future<Map<String, dynamic>> verifyEmail({
    required String phoneNumber,
    required String email,
    required String otpCode,
  }) async {
    final response = await ApiService.post('/auth/verify-email', body: {
      'phoneNumber': phoneNumber,
      'email': email,
      'otpCode': otpCode,
    });

    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    final error = body['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ?? body['message'] ?? 'Email verification failed',
      code: error?['code'] as String?,
      details: error?['details'] as Map<String, dynamic>?,
    );
  }

  /// Request password reset via email
  static Future<Map<String, dynamic>> requestPasswordResetByEmail({
    required String email,
  }) async {
    final response = await ApiService.post('/auth/request-password-reset-email', body: {
      'email': email,
    });

    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    final error = body['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ?? body['message'] ?? 'Failed to request password reset',
      code: error?['code'] as String?,
      details: error?['details'] as Map<String, dynamic>?,
    );
  }

  /// Reset password via email
  static Future<Map<String, dynamic>> resetPasswordByEmail({
    required String email,
    required String otpCode,
    required String newPassword,
  }) async {
    final response = await ApiService.post('/auth/reset-password-email', body: {
      'email': email,
      'otpCode': otpCode,
      'newPassword': newPassword,
    });

    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    final error = body['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ?? body['message'] ?? 'Failed to reset password',
      code: error?['code'] as String?,
      details: error?['details'] as Map<String, dynamic>?,
    );
  }
}

