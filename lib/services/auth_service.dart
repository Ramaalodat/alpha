import 'package:alpha_app/core/constants/api_constant.dart';
import 'package:alpha_app/services/api_service.dart';

class AuthService {
  // ================= LOGIN =================

  static Future<Map<String, dynamic>> login({
    required String phoneNumber,
    required String password,
  }) async {
    final response = await ApiService.post(
      url: '${ApiConstants.baseUrl}/auth/login',
      body: {
        'phoneNumber': phoneNumber,
        'password': password,
      },
    );

    return Map<String, dynamic>.from(response);
  }

  // ================= REQUEST REGISTRATION OTP =================

  static Future<Map<String, dynamic>> requestRegistrationOtp({
    required String phoneNumber,
    String? email,
  }) async {
    final response = await ApiService.post(
      url:
          '${ApiConstants.baseUrl}/auth/request-registration-otp',
      body: {
        'phoneNumber': phoneNumber,
        if (email != null && email.trim().isNotEmpty)
          'email': email.trim(),
      },
    );

    return Map<String, dynamic>.from(response);
  }

  // ================= REGISTER =================

  static Future<Map<String, dynamic>> register({
    required String phoneNumber,
    required String fullName,
    required String birthDate,
    required String password,
    required String otpCode,
    String? email,
  }) async {
    final response = await ApiService.post(
      url: '${ApiConstants.baseUrl}/auth/register',
      body: {
        'phoneNumber': phoneNumber,
        'fullName': fullName,
        'birthDate': birthDate,
        'password': password,
        'otpCode': otpCode,
        if (email != null && email.trim().isNotEmpty)
          'email': email.trim(),
      },
    );

    return Map<String, dynamic>.from(response);
  }

  // ================= VERIFY PHONE =================

  static Future<Map<String, dynamic>> verifyPhone({
    required String phoneNumber,
    required String otpCode,
  }) async {
    final response = await ApiService.post(
      url: '${ApiConstants.baseUrl}/auth/verify-phone',
      body: {
        'phoneNumber': phoneNumber,
        'otpCode': otpCode,
      },
    );

    return Map<String, dynamic>.from(response);
  }

  // الاسم القديم إذا عندك صفحة تستدعي verifyOtp
  static Future<Map<String, dynamic>> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    return verifyPhone(
      phoneNumber: phone,
      otpCode: otp,
    );
  }

  // ================= RESEND OTP =================

  static Future<Map<String, dynamic>> resendOtp({
    required String phoneNumber,
    String purpose = 'REGISTRATION',
  }) async {
    final response = await ApiService.post(
      url: '${ApiConstants.baseUrl}/auth/resend-otp',
      body: {
        'phoneNumber': phoneNumber,
        'purpose': purpose,
      },
    );

    return Map<String, dynamic>.from(response);
  }

  // ================= SEND EMAIL VERIFICATION =================

  static Future<Map<String, dynamic>> sendEmailVerification({
    required String phoneNumber,
    required String email,
  }) async {
    final response = await ApiService.post(
      url:
          '${ApiConstants.baseUrl}/auth/send-email-verification',
      body: {
        'phoneNumber': phoneNumber,
        'email': email.trim(),
      },
    );

    return Map<String, dynamic>.from(response);
  }

  // ================= VERIFY EMAIL =================

  static Future<Map<String, dynamic>> verifyEmail({
    required String phoneNumber,
    required String email,
    required String otpCode,
  }) async {
    final response = await ApiService.post(
      url: '${ApiConstants.baseUrl}/auth/verify-email',
      body: {
        'phoneNumber': phoneNumber,
        'email': email.trim(),
        'otpCode': otpCode,
      },
    );

    return Map<String, dynamic>.from(response);
  }



  // ================= LOGOUT =================

static Future<Map<String, dynamic>> logout() async {
  final response = await ApiService.post(
    url: '${ApiConstants.baseUrl}/auth/logout',
    body: const {},
  );

  return Map<String, dynamic>.from(response);
}
}