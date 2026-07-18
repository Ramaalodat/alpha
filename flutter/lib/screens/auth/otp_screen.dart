import 'dart:async';
import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/auth_service.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pinput/pinput.dart';
import 'package:provider/provider.dart';

class OtpScreen extends StatefulWidget {
  final String phoneNumber;
  final String? devOtpCode;
  final bool isRegistration;
  final String? fullName;
  final String? birthDate;
  final String? email;
  final String? password;

  const OtpScreen({
    super.key,
    required this.phoneNumber,
    this.devOtpCode,
    this.isRegistration = false,
    this.fullName,
    this.birthDate,
    this.email,
    this.password,
  });

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _pinController = TextEditingController();
  final _focusNode = FocusNode();
  int _secondsRemaining = 30;
  Timer? _timer;
  bool _isLoading = false;
  bool _isResending = false;
  bool _showDevCode = true;
  String? _errorMessage;
  String? _currentDevCode;

  String get _maskedPhone {
    final phone = widget.phoneNumber;
    if (phone.length <= 4) return phone;
    final lastFour = phone.substring(phone.length - 4);
    return '${phone.substring(0, 3)}${'•' * (phone.length - 7)}$lastFour';
  }

  @override
  void initState() {
    super.initState();
    _currentDevCode = widget.devOtpCode;
    _startTimer();
    // Auto-focus the OTP input
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  void _startTimer() {
    setState(() => _secondsRemaining = 30);
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        if (_secondsRemaining > 0) {
          _secondsRemaining--;
        } else {
          _timer?.cancel();
        }
      });
    });
  }

  Future<void> _verifyOtp() async {
    if (_pinController.text.length != 6) {
      setState(() => _errorMessage = 'Please enter the full 6-digit code');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      Map<String, dynamic> result;
      
      if (widget.isRegistration) {
        result = await AuthService.register(
          phoneNumber: widget.phoneNumber,
          fullName: widget.fullName!,
          birthDate: widget.birthDate!,
          password: widget.password!,
          otpCode: _pinController.text,
          email: widget.email,
        );
      } else {
        result = await AuthService.verifyPhone(
          phoneNumber: widget.phoneNumber,
          otpCode: _pinController.text,
        );
      }

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Verified successfully'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );

      // Check onboarding status to decide where to navigate
      final data = result['data'] as Map<String, dynamic>?;
      final user = data?['user'] as Map<String, dynamic>?;
      final isOnboarded = user?['isOnboarded'] == true;

      if (!mounted) return;
      if (isOnboarded) {
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        Navigator.pushReplacementNamed(context, '/onboarding/demographics');
      }
    } catch (e) {
      if (!mounted) return;
      final message = e.toString().replaceFirst('Exception: ', '');
      setState(() => _errorMessage = message);
      _pinController.clear();
      _focusNode.requestFocus();
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resendOtp() async {
    if (_secondsRemaining > 0 || _isResending) return;

    setState(() {
      _isResending = true;
      _errorMessage = null;
    });

    try {
      final result =
          await AuthService.resendOtp(phoneNumber: widget.phoneNumber);
      if (!mounted) return;

      // Update dev OTP code if available
      final data = result['data'] as Map<String, dynamic>?;
      final newCode = data?['otpCode'] as String?;
      if (newCode != null) {
        setState(() {
          _currentDevCode = newCode;
          _showDevCode = true;
        });
      }
      _startTimer();
      _pinController.clear();
      _focusNode.requestFocus();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Code sent successfully'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(
          () => _errorMessage = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isResending = false);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pinController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<Themeprovider>(context);
    final isDark = themeProvider.isDark;
    final screenW = MediaQuery.of(context).size.width;

    final bgColor =
        isDark ? AppColors.darkBackground : AppColors.lightBackground;
    final textColor = isDark ? AppColors.darkText : AppColors.lightText;
    final subTextColor =
        isDark ? AppColors.darkSubText : AppColors.lightSubText;
    final accentColor = isDark ? AppColors.darkAccent : AppColors.lightAccent;
    final primaryColor =
        isDark ? AppColors.darkPrimary : AppColors.lightPrimary;
    final cardColor = isDark ? AppColors.darkCard : AppColors.lightCard;
    final errorColor = isDark ? AppColors.darkError : AppColors.lightError;

    final pinTheme = PinTheme(
      width: 52,
      height: 60,
      textStyle: GoogleFonts.ibmPlexSansArabic(
        fontSize: 22,
        fontWeight: FontWeight.bold,
        color: textColor,
      ),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
      ),
    );

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: screenW * 0.06),
            child: Column(
              children: [
                SizedBox(height: MediaQuery.of(context).size.height * 0.06),

                // Back button
                Align(
                  alignment: Alignment.centerLeft,
                  child: IconButton(
                    icon: Icon(Icons.arrow_back_ios, color: textColor),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),

                const SizedBox(height: 20),

                // Icon
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: primaryColor.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child:
                      Icon(Icons.sms_outlined, size: 48, color: primaryColor),
                ),

                const SizedBox(height: 32),

                // Title
                Text(
                  'Verification Code',
                  style: GoogleFonts.ibmPlexSansArabic(
                    fontSize: screenW * 0.07,
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),

                const SizedBox(height: 12),

                // Subtitle
                Text(
                  'We sent a 6-digit code to\n$_maskedPhone',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.ibmPlexSansArabic(
                    fontSize: screenW * 0.04,
                    color: subTextColor,
                    height: 1.5,
                  ),
                ),

                const SizedBox(height: 32),

                // Dev mode OTP code display
                if (_currentDevCode != null && _showDevCode) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                        vertical: 16, horizontal: 20),
                    decoration: BoxDecoration(
                      color: accentColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                      border:
                          Border.all(color: accentColor.withValues(alpha: 0.3)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.code, size: 18, color: accentColor),
                            const SizedBox(width: 8),
                            Text(
                              'Dev Mode - Your OTP Code',
                              style: GoogleFonts.ibmPlexSansArabic(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: accentColor,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        GestureDetector(
                          onTap: () {
                            _pinController.text = _currentDevCode!;
                            _focusNode.requestFocus();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                vertical: 10, horizontal: 24),
                            decoration: BoxDecoration(
                              color: accentColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _currentDevCode!,
                              style: GoogleFonts.ibmPlexSansArabic(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: accentColor,
                                letterSpacing: 6,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Tap to auto-fill',
                          style: GoogleFonts.ibmPlexSansArabic(
                            fontSize: 11,
                            color: subTextColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Error message
                if (_errorMessage != null) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                        vertical: 12, horizontal: 16),
                    decoration: BoxDecoration(
                      color: errorColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                      border:
                          Border.all(color: errorColor.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline, size: 20, color: errorColor),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: GoogleFonts.ibmPlexSansArabic(
                              fontSize: 13,
                              color: errorColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // OTP Input
                Pinput(
                  controller: _pinController,
                  focusNode: _focusNode,
                  length: 6,
                  defaultPinTheme: pinTheme,
                  focusedPinTheme: pinTheme.copyWith(
                    decoration: pinTheme.decoration!.copyWith(
                      border: Border.all(color: primaryColor, width: 2),
                    ),
                  ),
                  errorPinTheme: pinTheme.copyWith(
                    decoration: pinTheme.decoration!.copyWith(
                      border: Border.all(color: errorColor, width: 2),
                    ),
                  ),
                  onCompleted: (_) => _verifyOtp(),
                  onChanged: (_) {
                    if (_errorMessage != null) {
                      setState(() => _errorMessage = null);
                    }
                  },
                ),

                const SizedBox(height: 24),

                // Resend section
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Didn't receive the code? ",
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: subTextColor,
                        fontSize: 14,
                      ),
                    ),
                    GestureDetector(
                      onTap: _secondsRemaining == 0 && !_isResending
                          ? _resendOtp
                          : null,
                      child: Text(
                        _isResending
                            ? 'Sending...'
                            : _secondsRemaining > 0
                                ? 'Resend in 0:${_secondsRemaining.toString().padLeft(2, '0')}'
                                : 'Resend Code',
                        style: GoogleFonts.ibmPlexSansArabic(
                          color: (_secondsRemaining == 0 && !_isResending)
                              ? primaryColor
                              : subTextColor,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          decoration: TextDecoration.none,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 48),

                // Verify button
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      disabledBackgroundColor:
                          primaryColor.withValues(alpha: 0.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
                    onPressed: _isLoading ? null : _verifyOtp,
                    child: _isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2.5,
                            ),
                          )
                        : Text(
                            'Verify',
                            style: GoogleFonts.ibmPlexSansArabic(
                              color: Colors.white,
                              fontSize: 17,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
