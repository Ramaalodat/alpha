import 'package:alpha_app/services/auth_service.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  // =====================================================
  // CONTROLLERS
  // =====================================================

  final TextEditingController nameController =
      TextEditingController();

  final TextEditingController phoneController =
      TextEditingController();

  final TextEditingController emailController =
      TextEditingController();

  final TextEditingController emailOtpController =
      TextEditingController();

  final TextEditingController passwordController =
      TextEditingController();

  final TextEditingController birthDateController =
      TextEditingController();

  // =====================================================
  // GENERAL STATE
  // =====================================================

  DateTime? birthDate;

  bool isLoading = false;
  bool rememberMe = false;

  String? errorMessage;

  // =====================================================
  // EMAIL VERIFICATION STATE
  // =====================================================

  bool isSendingEmailOtp = false;
  bool isVerifyingEmailOtp = false;

  bool showEmailOtpField = false;
  bool emailVerified = false;

  // =====================================================
  // CLEAN VALUES
  // =====================================================

  String get fullName =>
      nameController.text.trim();

  String get localPhoneNumber =>
      phoneController.text.trim();

  String get fullPhoneNumber =>
      '+962$localPhoneNumber';

  String get email =>
      emailController.text.trim();

  String get password =>
      passwordController.text.trim();

  String get emailOtpCode =>
      emailOtpController.text.trim();

  String get birthDateIso =>
      birthDate?.toIso8601String() ?? '';

  // =====================================================
  // BIRTH DATE
  // =====================================================

  void setBirthDate(DateTime date) {
    birthDate = date;

    birthDateController.text =
        '${date.year}-'
        '${date.month.toString().padLeft(2, '0')}-'
        '${date.day.toString().padLeft(2, '0')}';

    notifyListeners();
  }

  // =====================================================
  // GENERAL SETTERS
  // =====================================================

  void toggleRemember() {
    rememberMe = !rememberMe;
    notifyListeners();
  }

  void setLoading(bool value) {
    isLoading = value;
    notifyListeners();
  }

  void clearError() {
    errorMessage = null;
    notifyListeners();
  }

  // =====================================================
  // EMAIL CHANGED
  // =====================================================

  void onEmailChanged() {
    if (!emailVerified &&
        !showEmailOtpField) {
      return;
    }

    emailVerified = false;
    showEmailOtpField = false;

    emailOtpController.clear();
    errorMessage = null;

    notifyListeners();
  }

  // =====================================================
  // LOGIN
  // =====================================================

  Future<bool> loginUser() async {
    if (isLoading) {
      return false;
    }

    if (!_isValidPhone(localPhoneNumber)) {
      errorMessage =
          'Enter a valid phone number';
      notifyListeners();
      return false;
    }

    if (password.isEmpty) {
      errorMessage =
          'Password is required';
      notifyListeners();
      return false;
    }

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      final response =
          await AuthService.login(
        phoneNumber: fullPhoneNumber,
        password: password,
      );

      debugPrint(
        'LOGIN RESPONSE: $response',
      );

      if (!_isSuccessful(response)) {
        errorMessage =
            _extractErrorMessage(
          response,
          fallback:
              'Invalid phone number or password',
        );

        return false;
      }

      await _saveTokens(response);

      final preferences =
          await SharedPreferences.getInstance();

      await preferences.setBool(
        'remember_me',
        rememberMe,
      );

      if (rememberMe) {
        await preferences.setString(
          'saved_phone',
          localPhoneNumber,
        );
      } else {
        await preferences.remove(
          'saved_phone',
        );
      }

      return true;
    } catch (error) {
      errorMessage =
          _cleanError(error);

      debugPrint(
        'LOGIN ERROR: $error',
      );

      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  // =====================================================
  // SEND EMAIL OTP
  // =====================================================

  Future<bool> sendEmailOtp() async {
    if (isSendingEmailOtp) {
      return false;
    }

    if (!_isValidPhone(localPhoneNumber)) {
      errorMessage =
          'Please enter a valid phone number first';

      notifyListeners();
      return false;
    }

    if (!_isValidEmail(email)) {
      errorMessage =
          'Please enter a valid email';

      notifyListeners();
      return false;
    }

    isSendingEmailOtp = true;
    errorMessage = null;

    notifyListeners();

    try {
      final response =
          await AuthService
              .sendEmailVerification(
        phoneNumber: fullPhoneNumber,
        email: email,
      );

      debugPrint(
        'SEND EMAIL OTP RESPONSE: $response',
      );

      if (!_isSuccessful(response)) {
        errorMessage =
            _extractErrorMessage(
          response,
          fallback:
              'Could not send email verification code',
        );

        return false;
      }

      showEmailOtpField = true;
      emailVerified = false;

      return true;
    } catch (error) {
      errorMessage =
          _cleanError(error);

      debugPrint(
        'SEND EMAIL OTP ERROR: $error',
      );

      return false;
    } finally {
      isSendingEmailOtp = false;
      notifyListeners();
    }
  }

  // =====================================================
  // VERIFY EMAIL OTP
  // =====================================================

  Future<bool> verifyEmailOtp() async {
    if (isVerifyingEmailOtp) {
      return false;
    }

    if (emailOtpCode.length != 6) {
      errorMessage =
          'Please enter the 6-digit email code';

      notifyListeners();
      return false;
    }

    isVerifyingEmailOtp = true;
    errorMessage = null;

    notifyListeners();

    try {
      final response =
          await AuthService.verifyEmail(
        phoneNumber: fullPhoneNumber,
        email: email,
        otpCode: emailOtpCode,
      );

      debugPrint(
        'VERIFY EMAIL RESPONSE: $response',
      );

      if (!_isSuccessful(response)) {
        errorMessage =
            _extractErrorMessage(
          response,
          fallback:
              'Email verification failed',
        );

        return false;
      }

      emailVerified = true;
      showEmailOtpField = false;

      return true;
    } catch (error) {
      errorMessage =
          _cleanError(error);

      debugPrint(
        'VERIFY EMAIL ERROR: $error',
      );

      return false;
    } finally {
      isVerifyingEmailOtp = false;
      notifyListeners();
    }
  }

  // =====================================================
  // REQUEST REGISTRATION PHONE OTP
  // =====================================================

  Future<Map<String, dynamic>?>
      sendRegistrationOtp() async {
    if (isLoading) {
      return null;
    }

    final validationError =
        validateRegistrationData();

    if (validationError != null) {
      errorMessage = validationError;
      notifyListeners();

      return null;
    }

    if (!emailVerified) {
      errorMessage =
          'Please confirm your email first';

      notifyListeners();
      return null;
    }

    isLoading = true;
    errorMessage = null;

    notifyListeners();

    try {
      final response =
          await AuthService
              .requestRegistrationOtp(
        phoneNumber: fullPhoneNumber,
        email: email,
      );

      debugPrint(
        'REQUEST REGISTRATION OTP RESPONSE: $response',
      );

      if (!_isSuccessful(response)) {
        errorMessage =
            _extractErrorMessage(
          response,
          fallback:
              'Could not send phone verification code',
        );

        return null;
      }

      return response;
    } catch (error) {
      errorMessage =
          _cleanError(error);

      debugPrint(
        'REQUEST REGISTRATION OTP ERROR: $error',
      );

      return null;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  // =====================================================
  // REGISTER USER
  // =====================================================

  Future<bool> registerUser({
    required String otpCode,
  }) async {
    if (isLoading) {
      return false;
    }

    if (otpCode.trim().length != 6) {
      errorMessage =
          'Please enter the 6-digit verification code';

      notifyListeners();
      return false;
    }

    final validationError =
        validateRegistrationData();

    if (validationError != null) {
      errorMessage = validationError;
      notifyListeners();

      return false;
    }

    isLoading = true;
    errorMessage = null;

    notifyListeners();

    try {
      final response =
          await AuthService.register(
        phoneNumber: fullPhoneNumber,
        fullName: fullName,
        birthDate: birthDateIso,
        password: password,
        otpCode: otpCode.trim(),
        email: email,
      );

      debugPrint(
        'REGISTER RESPONSE: $response',
      );

      if (!_isSuccessful(response)) {
        errorMessage =
            _extractErrorMessage(
          response,
          fallback:
              'Registration failed',
        );

        return false;
      }

      await _saveTokens(
        response,
        required: false,
      );

      return true;
    } catch (error) {
      errorMessage =
          _cleanError(error);

      debugPrint(
        'REGISTER ERROR: $error',
      );

      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  // =====================================================
  // VERIFY PHONE OTP
  // =====================================================

  Future<bool> verifyPhoneOtp({
    required String otpCode,
  }) async {
    if (isLoading) {
      return false;
    }

    if (otpCode.trim().length != 6) {
      errorMessage =
          'Please enter the 6-digit verification code';

      notifyListeners();
      return false;
    }

    isLoading = true;
    errorMessage = null;

    notifyListeners();

    try {
      final response =
          await AuthService.verifyPhone(
        phoneNumber: fullPhoneNumber,
        otpCode: otpCode.trim(),
      );

      debugPrint(
        'VERIFY PHONE RESPONSE: $response',
      );

      if (!_isSuccessful(response)) {
        errorMessage =
            _extractErrorMessage(
          response,
          fallback:
              'Verification code is incorrect',
        );

        return false;
      }

      await _saveTokens(response);

      return true;
    } catch (error) {
      errorMessage =
          _cleanError(error);

      debugPrint(
        'VERIFY PHONE ERROR: $error',
      );

      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  // =====================================================
  // RESEND PHONE OTP
  // =====================================================

  Future<bool> resendPhoneOtp({
    String purpose = 'REGISTRATION',
  }) async {
    if (isLoading) {
      return false;
    }

    isLoading = true;
    errorMessage = null;

    notifyListeners();

    try {
      final response =
          await AuthService.resendOtp(
        phoneNumber: fullPhoneNumber,
        purpose: purpose,
      );

      if (!_isSuccessful(response)) {
        errorMessage =
            _extractErrorMessage(
          response,
          fallback:
              'Could not resend verification code',
        );

        return false;
      }

      return true;
    } catch (error) {
      errorMessage =
          _cleanError(error);

      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  // =====================================================
  // REGISTRATION VALIDATION
  // =====================================================

  String? validateRegistrationData() {
    if (fullName.isEmpty) {
      return 'Full name is required';
    }

    if (fullName.length < 3) {
      return 'Enter a valid full name';
    }

    if (!_isValidPhone(localPhoneNumber)) {
      return 'Enter a valid phone number';
    }

    if (!_isValidEmail(email)) {
      return 'Enter a valid email';
    }

    if (birthDate == null) {
      return 'Date of birth is required';
    }

    if (password.isEmpty) {
      return 'Password is required';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (!RegExp(
      r'(?=.*[a-z])',
    ).hasMatch(password)) {
      return 'Password must contain a lowercase letter';
    }

    if (!RegExp(
      r'(?=.*[A-Z])',
    ).hasMatch(password)) {
      return 'Password must contain an uppercase letter';
    }

    if (!RegExp(
      r'(?=.*\d)',
    ).hasMatch(password)) {
      return 'Password must contain a number';
    }

    return null;
  }

  // =====================================================
  // TOKEN STORAGE
  // =====================================================

  Future<void> _saveTokens(
    Map<String, dynamic> response, {
    bool required = true,
  }) async {
    final rawData =
        response['data'];

    final Map<String, dynamic>? data =
        rawData is Map
            ? Map<String, dynamic>.from(
                rawData,
              )
            : null;

    final rawTokens =
        data?['tokens'];

    final Map<String, dynamic>? tokens =
        rawTokens is Map
            ? Map<String, dynamic>.from(
                rawTokens,
              )
            : null;

    String? accessToken =
        tokens?['accessToken']
            ?.toString();

    String? refreshToken =
        tokens?['refreshToken']
            ?.toString();

    accessToken ??=
        data?['accessToken']
            ?.toString();

    accessToken ??=
        data?['access_token']
            ?.toString();

    refreshToken ??=
        data?['refreshToken']
            ?.toString();

    refreshToken ??=
        data?['refresh_token']
            ?.toString();

    if (accessToken == null ||
        accessToken.isEmpty) {
      if (required) {
        throw Exception(
          'Access token was not returned by the server',
        );
      }

      return;
    }

    final preferences =
        await SharedPreferences.getInstance();

    await preferences.setString(
      'access_token',
      accessToken,
    );

    await preferences.setString(
      'token',
      accessToken,
    );

    if (refreshToken != null &&
        refreshToken.isNotEmpty) {
      await preferences.setString(
        'refresh_token',
        refreshToken,
      );
    }
  }

  // =====================================================
  // LOAD REMEMBERED USER
  // =====================================================

  Future<void> loadRememberedUser() async {
    final preferences =
        await SharedPreferences.getInstance();

    rememberMe =
        preferences.getBool(
          'remember_me',
        ) ??
        false;

    if (rememberMe) {
      phoneController.text =
          preferences.getString(
            'saved_phone',
          ) ??
          '';
    }

    notifyListeners();
  }

  // =====================================================
  // CHECK SESSION
  // =====================================================

  Future<bool> hasSavedSession() async {
    final preferences =
        await SharedPreferences.getInstance();

    final token =
        preferences.getString(
          'access_token',
        );

    return token != null &&
        token.isNotEmpty;
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  Future<void> logout() async {
    try {
      await AuthService.logout();
    } catch (_) {
      // نمسح البيانات محليًا حتى لو فشل السيرفر.
    }

    final preferences =
        await SharedPreferences.getInstance();

    await preferences.remove(
      'access_token',
    );

    await preferences.remove(
      'refresh_token',
    );

    await preferences.remove(
      'token',
    );

    await preferences.remove(
      'remember_me',
    );

    await preferences.remove(
      'saved_phone',
    );

    clear();
  }

  // =====================================================
  // CLEAR
  // =====================================================

  void clear() {
    nameController.clear();
    phoneController.clear();
    emailController.clear();
    emailOtpController.clear();
    passwordController.clear();
    birthDateController.clear();

    birthDate = null;

    isLoading = false;
    rememberMe = false;

    isSendingEmailOtp = false;
    isVerifyingEmailOtp = false;

    showEmailOtpField = false;
    emailVerified = false;

    errorMessage = null;

    notifyListeners();
  }

  // =====================================================
  // HELPERS
  // =====================================================

  bool _isValidPhone(
    String value,
  ) {
    return value.length == 9 &&
        value.startsWith('7');
  }

  bool _isValidEmail(
    String value,
  ) {
    return RegExp(
      r'^[^@\s]+@[^@\s]+\.[^@\s]+$',
    ).hasMatch(value);
  }

  bool _isSuccessful(
    Map<String, dynamic> response,
  ) {
    if (response['success'] == true) {
      return true;
    }

    return response['status']
            ?.toString()
            .toLowerCase() ==
        'success';
  }

  String _extractErrorMessage(
    Map<String, dynamic> response, {
    required String fallback,
  }) {
    final error =
        response['error'];

    if (error is Map &&
        error['message'] != null) {
      return error['message'].toString();
    }

    return response['message']
            ?.toString() ??
        fallback;
  }

  String _cleanError(
    Object error,
  ) {
    return error
        .toString()
        .replaceFirst(
          'Exception: ',
          '',
        );
  }

  // =====================================================
  // DISPOSE
  // =====================================================

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    emailController.dispose();
    emailOtpController.dispose();
    passwordController.dispose();
    birthDateController.dispose();

    super.dispose();
  }
}