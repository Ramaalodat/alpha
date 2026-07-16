import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/api_exception.dart';
import 'package:alpha_app/services/auth_service.dart';
import 'package:alpha_app/widgets/custom_textfield.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class NewPasswordScreen extends StatefulWidget {
  final String email;
  final String otpCode;

  const NewPasswordScreen({
    super.key,
    required this.email,
    required this.otpCode,
  });

  @override
  State<NewPasswordScreen> createState() => _NewPasswordScreenState();
}

class _NewPasswordScreenState extends State<NewPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _resetPassword() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final result = await AuthService.resetPasswordByEmail(
        email: widget.email,
        otpCode: widget.otpCode,
        newPassword: _passwordController.text.trim(),
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Password reset successfully'),
          backgroundColor: Colors.green,
        ),
      );

      // Pop until the login screen
      Navigator.popUntil(context, (route) => route.isFirst);
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
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
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
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: screenH * 0.02),
                Text(
                  'Set New Password',
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
                  'Create a new strong password for your account.',
                  style: GoogleFonts.ibmPlexSansArabic(
                    fontSize: screenW * 0.04,
                    fontWeight: FontWeight.w500,
                    color: themeProvider.isDark
                        ? AppColors.darkSubText
                        : AppColors.lightSubText,
                  ),
                ),
                SizedBox(height: screenH * 0.05),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: screenW * 0.02),
                  child: Text(
                    'New Password',
                    style: TextStyle(
                      fontSize: screenW * 0.04,
                      color: themeProvider.isDark
                          ? AppColors.darkSubText
                          : AppColors.lightSubText,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                SizedBox(height: screenH * 0.01),
                CustomTextfield(
                  controller: _passwordController,
                  hint: 'Minimum 6 characters',
                  icon: Icons.lock_outline_rounded,
                  type: TextFieldType.password,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Password is required';
                    }
                    if (value.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                SizedBox(height: screenH * 0.03),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: screenW * 0.02),
                  child: Text(
                    'Confirm Password',
                    style: TextStyle(
                      fontSize: screenW * 0.04,
                      color: themeProvider.isDark
                          ? AppColors.darkSubText
                          : AppColors.lightSubText,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                SizedBox(height: screenH * 0.01),
                CustomTextfield(
                  controller: _confirmPasswordController,
                  hint: 'Re-enter your new password',
                  icon: Icons.lock_outline_rounded,
                  type: TextFieldType.password,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please confirm your password';
                    }
                    if (value != _passwordController.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),
                SizedBox(height: screenH * 0.06),
                Center(
                  child: _isLoading
                      ? const CircularProgressIndicator(color: AppColors.darkAccent)
                      : ElevatedButton(
                          onPressed: _resetPassword,
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
                            'Reset Password',
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
      ),
    );
  }
}
