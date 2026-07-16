import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/auth/new_password_screen.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pinput/pinput.dart';
import 'package:provider/provider.dart';
import 'package:alpha_app/services/auth_service.dart';
import 'package:alpha_app/services/api_exception.dart';

class ForgotPasswordOtpScreen extends StatefulWidget {
  final String email;

  const ForgotPasswordOtpScreen({super.key, required this.email});

  @override
  State<ForgotPasswordOtpScreen> createState() => _ForgotPasswordOtpScreenState();
}

class _ForgotPasswordOtpScreenState extends State<ForgotPasswordOtpScreen> {
  String _otpCode = '';
  bool _isLoading = false;

  void _verifyAndProceed() async {
    if (_otpCode.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 6-digit OTP')),
      );
      return;
    }

    // Pass the OTP to the next screen where new password will be entered.
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => NewPasswordScreen(
          email: widget.email,
          otpCode: _otpCode,
        ),
      ),
    );
  }

  void _resendOtp() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final result = await AuthService.requestPasswordResetByEmail(email: widget.email);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'OTP resent successfully'),
          backgroundColor: Colors.green,
        ),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message), backgroundColor: Colors.red),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenW = Device.width(context);
    final screenH = Device.height(context);
    final themeProvider = Provider.of<Themeprovider>(context);

    return Scaffold(
      backgroundColor: themeProvider.isDark
          ? AppColors.darkBackground
          : AppColors.lightBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new,
            color: themeProvider.isDark ? AppColors.darkText : AppColors.lightText,
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: screenW * 0.05),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: screenH * 0.02),
              Text(
                'Verify your email',
                style: GoogleFonts.ibmPlexSansArabic(
                  fontSize: screenW * 0.08,
                  fontWeight: FontWeight.bold,
                  color: themeProvider.isDark
                      ? AppColors.darkText
                      : AppColors.lightText,
                ),
              ),
              SizedBox(height: screenH * 0.02),
              Text(
                'Enter the 6-digit code sent to ${widget.email}',
                style: GoogleFonts.ibmPlexSansArabic(
                  fontSize: screenW * 0.04,
                  fontWeight: FontWeight.w500,
                  color: themeProvider.isDark
                      ? AppColors.darkSubText
                      : AppColors.lightSubText,
                ),
              ),
              SizedBox(height: screenH * 0.05),
              Pinput(
                length: 6,
                onCompleted: (v) {
                  _otpCode = v;
                  _verifyAndProceed();
                },
                onChanged: (value) {
                  setState(() {
                    _otpCode = value;
                  });
                },
                defaultPinTheme: PinTheme(
                  width: 52,
                  height: 60,
                  textStyle: GoogleFonts.ibmPlexSansArabic(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: themeProvider.isDark ? AppColors.darkText : AppColors.lightText,
                  ),
                  decoration: BoxDecoration(
                    color: themeProvider.isDark ? AppColors.darkCard : AppColors.lightCard,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: themeProvider.isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  ),
                ),
                focusedPinTheme: PinTheme(
                  width: 52,
                  height: 60,
                  decoration: BoxDecoration(
                    color: themeProvider.isDark ? AppColors.darkCard : AppColors.lightCard,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: themeProvider.isDark ? AppColors.darkPrimary : AppColors.lightPrimary, width: 2),
                  ),
                ),
              ),
              SizedBox(height: screenH * 0.02),
              Center(
                child: TextButton(
                  onPressed: _isLoading ? null : _resendOtp,
                  child: Text(
                    'Didn\'t receive code? Resend',
                    style: TextStyle(
                      color: themeProvider.isDark
                          ? AppColors.darkSecondary
                          : AppColors.lightSecondary,
                      fontSize: screenW * 0.04,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              SizedBox(height: screenH * 0.04),
              Center(
                child: ElevatedButton(
                  onPressed: _verifyAndProceed,
                  style: ButtonStyle(
                    backgroundColor: WidgetStatePropertyAll(
                      themeProvider.isDark
                          ? AppColors.darkPrimary
                          : AppColors.lightPrimary,
                    ),
                    fixedSize: WidgetStatePropertyAll(
                      Size(screenW * 0.8, screenH * 0.065),
                    ),
                    shape: WidgetStatePropertyAll(
                      RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  child: Text(
                    'Verify',
                    style: TextStyle(
                      fontSize: screenW * 0.055,
                      color: AppColors.darkBorder,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
