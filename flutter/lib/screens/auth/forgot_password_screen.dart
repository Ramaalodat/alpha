import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/auth/forgot_password_otp_screen.dart';
import 'package:alpha_app/services/api_exception.dart';
import 'package:alpha_app/services/auth_service.dart';
import 'package:alpha_app/widgets/custom_textfield.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;

  Future<void> _requestPasswordReset() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
    });

    try {
      final email = _emailController.text.trim();
      final result = await AuthService.requestPasswordResetByEmail(email: email);
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'OTP sent successfully'),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => ForgotPasswordOtpScreen(email: email),
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
  void dispose() {
    _emailController.dispose();
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
                  'Forgot Password?',
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
                  'Enter your email address to receive a verification code. This email must be linked to your account.',
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
                    'Email Address',
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
                  controller: _emailController,
                  hint: 'example@domain.com',
                  icon: Icons.email_outlined,
                  type: TextFieldType.email,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Email is required';
                    }
                    if (!RegExp(r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
                        .hasMatch(value)) {
                      return 'Enter a valid email address';
                    }
                    return null;
                  },
                ),
                SizedBox(height: screenH * 0.06),
                Center(
                  child: _isLoading
                      ? const CircularProgressIndicator(color: AppColors.darkAccent)
                      : ElevatedButton(
                          onPressed: _requestPasswordReset,
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
                            'Send OTP',
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
