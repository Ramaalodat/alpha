import 'package:alpha_app/media/images.dart';
import 'package:alpha_app/providers/auth_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/screens/auth/create_account.dart';
import 'package:alpha_app/screens/auth/forgot_password_screen.dart';
import 'package:alpha_app/screens/auth/otp_screen.dart';
import 'package:alpha_app/screens/main/main_screen.dart';
import 'package:alpha_app/services/api_exception.dart';
import 'package:alpha_app/services/auth_service.dart';
import 'package:alpha_app/widgets/custom_phonefield.dart';
import 'package:alpha_app/widgets/custom_textfield.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    final screenW = Device.width(context);
    final screenH = Device.height(context);
    final themeProvider = Provider.of<Themeprovider>(context);
    final authProvider = context.watch<AuthProvider>();

    return Form(
      key: _formKey,
      child: SafeArea(
        child: Scaffold(
          backgroundColor: themeProvider.isDark
              ? AppColors.darkBackground
              : AppColors.lightBackground,
          body: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: screenW * 0.05),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(height: screenH * 0.03),
                  Center(
                      child: Image.asset(ImagesAssets.logo,
                          height: screenH * 0.15, width: screenW * 0.25)),
                  Center(
                    child: Text(
                      'Welcome back',
                      style: GoogleFonts.ibmPlexSansArabic(
                          fontSize: screenW * 0.08,
                          fontWeight: FontWeight.bold,
                          color: themeProvider.isDark
                              ? AppColors.darkText
                              : AppColors.lightText),
                    ),
                  ),
                  SizedBox(height: screenH * 0.02),
                  Center(
                    child: Text(
                      'Log in to continue your financial journey',
                      style: GoogleFonts.ibmPlexSansArabic(
                          fontSize: screenW * 0.04,
                          fontWeight: FontWeight.w500,
                          color: themeProvider.isDark
                              ? AppColors.darkSubText
                              : AppColors.lightSubText),
                    ),
                  ),
                  SizedBox(height: screenH * 0.03),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: screenW * 0.02),
                    child: Text('Phone number',
                        style: TextStyle(
                            fontSize: screenW * 0.04,
                            color: themeProvider.isDark
                                ? AppColors.darkSubText
                                : AppColors.lightSubText,
                            fontWeight: FontWeight.bold)),
                  ),
                  SizedBox(height: screenH * 0.01),
                  CustomPhoneField(
                    controller: authProvider.phoneController,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Phone number is required';
                      }
                      if (value.length != 9) {
                        return 'Enter a valid phone number';
                      }
                      if (!value.startsWith('7')) return 'Invalid phone number';
                      return null;
                    },
                  ),
                  SizedBox(height: screenH * 0.02),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: screenW * 0.02),
                    child: Text('Password',
                        style: TextStyle(
                            fontSize: screenW * 0.04,
                            color: themeProvider.isDark
                                ? AppColors.darkSubText
                                : AppColors.lightSubText,
                            fontWeight: FontWeight.bold)),
                  ),
                  SizedBox(height: screenH * 0.01),
                  CustomTextfield(
                    controller: authProvider.passwordController,
                    hint: 'Minimum 6 characters',
                    icon: Icons.lock_outline_rounded,
                    type: TextFieldType.password,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'validation.password_required'.tr();
                      }
                      if (value.length < 6) {
                        return 'validation.password_short'.tr();
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: screenH * 0.02),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        onPressed: authProvider.toggleRemember,
                        icon: authProvider.rememberMe
                            ? Icon(Icons.check_box,
                                size: screenW * 0.06,
                                color: themeProvider.isDark
                                    ? AppColors.darkSecondary
                                    : AppColors.lightSecondary)
                            : Icon(Icons.square_outlined,
                                color: themeProvider.isDark
                                    ? AppColors.darkSecondary
                                    : AppColors.lightSecondary),
                      ),
                      Text('remember_me'.tr(),
                          style: TextStyle(
                              fontSize: screenW * 0.04,
                              fontWeight: FontWeight.w600,
                              color: themeProvider.isDark
                                  ? AppColors.darkSecondary
                                  : AppColors.lightSecondary)),
                    ],
                  ),
                  SizedBox(height: screenH * 0.05),
                  Center(
                    child: authProvider.isLoading
                        ? const CircularProgressIndicator(
                            color: AppColors.darkAccent)
                        : ElevatedButton(
                            onPressed: () async {
                              if (!_formKey.currentState!.validate()) return;
                              authProvider.setLoading(true);
                              try {
                                final result = await AuthService.login(
                                  phoneNumber:
                                      '+962${authProvider.phoneController.text.trim()}',
                                  password: authProvider.passwordController.text
                                      .trim(),
                                );
                                final prefs =
                                    await SharedPreferences.getInstance();
                                await prefs.setBool(
                                    'remember_me', authProvider.rememberMe);
                                if (!mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                        content: Text(result['message'] ??
                                            'Logged in successfully'),
                                        backgroundColor: Colors.green));

                                // Check onboarding status from login response
                                final data =
                                    result['data'] as Map<String, dynamic>?;
                                final user =
                                    data?['user'] as Map<String, dynamic>?;
                                final isOnboarded =
                                    user?['isOnboarded'] == true;

                                if (!mounted) return;
                                if (isOnboarded) {
                                  Navigator.pushReplacement(
                                      context,
                                      MaterialPageRoute(
                                          builder: (_) => const MainScreen()));
                                } else {
                                  Navigator.pushReplacementNamed(
                                      context, '/onboarding/demographics');
                                }
                              } on ApiException catch (e) {
                                if (!mounted) return;
                                authProvider.setLoading(false);

                                // Account not verified -> redirect to OTP screen
                                if (e.code == 'ACCOUNT_NOT_VERIFIED') {
                                  final phone =
                                      '+962${authProvider.phoneController.text.trim()}';

                                  // Resend OTP so user gets a fresh code
                                  try {
                                    final resendResult =
                                        await AuthService.resendOtp(
                                            phoneNumber: phone);
                                    final data = resendResult['data']
                                        as Map<String, dynamic>?;
                                    final otpCode = data?['otpCode'] as String?;
                                    if (!mounted) return;
                                    Navigator.pushReplacement(
                                        context,
                                        MaterialPageRoute(
                                            builder: (_) => OtpScreen(
                                                  phoneNumber: phone,
                                                  devOtpCode: otpCode,
                                                )));
                                  } catch (_) {
                                    // Even if resend fails, still navigate to OTP screen
                                    if (!mounted) return;
                                    Navigator.pushReplacement(
                                        context,
                                        MaterialPageRoute(
                                            builder: (_) => OtpScreen(
                                                  phoneNumber:
                                                      '+962${authProvider.phoneController.text.trim()}',
                                                )));
                                  }
                                  return;
                                }

                                ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                        content: Text(e.message),
                                        backgroundColor: Colors.red));
                              } catch (e) {
                                if (!mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                        content: Text(e.toString()),
                                        backgroundColor: Colors.red));
                              } finally {
                                if (mounted) authProvider.setLoading(false);
                              }
                            },
                            style: ButtonStyle(
                              backgroundColor: WidgetStatePropertyAll(
                                  themeProvider.isDark
                                      ? AppColors.darkPrimary
                                      : AppColors.lightPrimary),
                              fixedSize: WidgetStatePropertyAll(
                                  Size(screenW * 0.8, screenH * 0.065)),
                              shape: WidgetStatePropertyAll(
                                  RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10))),
                            ),
                            child: Text('Log In',
                                style: TextStyle(
                                    fontSize: screenW * 0.055,
                                    color: AppColors.darkBorder,
                                    fontWeight: FontWeight.w600)),
                          ),
                  ),
                  SizedBox(height: screenW * 0.01),
                  Center(
                    child: TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const ForgotPasswordScreen(),
                            ),
                          );
                        },
                        child: Text('forgot_password_title'.tr(),
                            style: TextStyle(
                                color: themeProvider.isDark
                                    ? AppColors.darkSecondary
                                    : AppColors.lightSecondary,
                                fontSize: screenW * 0.04,
                                fontWeight: FontWeight.w600))),
                  ),
                  SizedBox(height: screenH * 0.06),
                  Padding(
                    padding: EdgeInsets.only(bottom: screenH * 0.02),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('no_account'.tr(),
                            style: TextStyle(
                                color: themeProvider.isDark
                                    ? AppColors.darkSubText
                                    : AppColors.lightSubText,
                                fontSize: screenW * 0.04,
                                fontWeight: FontWeight.w500)),
                        SizedBox(width: screenW * 0.015),
                        InkWell(
                          onTap: () => Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const CreateAccount())),
                          child: Text('sign_up'.tr(),
                              style: TextStyle(
                                  color: themeProvider.isDark
                                      ? AppColors.darkSecondary
                                      : AppColors.lightSecondary,
                                  fontSize: screenW * 0.045,
                                  fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
