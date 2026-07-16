import 'dart:async';
import 'package:alpha_app/providers/auth_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/screens/auth/login.dart';
import 'package:alpha_app/screens/auth/otp_screen.dart';
import 'package:alpha_app/screens/profile/birth_date_screen.dart';
import 'package:alpha_app/services/auth_service.dart';
import 'package:alpha_app/widgets/custom_phonefield.dart';
import 'package:alpha_app/widgets/custom_textfield.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class CreateAccount extends StatefulWidget {
  const CreateAccount({super.key});

  @override
  State<CreateAccount> createState() => _CreateAccountState();
}

class _CreateAccountState extends State<CreateAccount> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _emailOtpController = TextEditingController();

  // Email verification state
  bool _emailSending = false;
  bool _emailVerified = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AuthProvider>().clear();
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _emailOtpController.dispose();
    super.dispose();
  }

  Future<void> _sendEmailVerification() async {
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid email'), backgroundColor: Colors.red),
      );
      return;
    }

    final phoneText = context.read<AuthProvider>().phoneController.text.trim();
    if (phoneText.isEmpty || phoneText.length != 9) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your phone number first'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _emailSending = true);

    try {
      final phone = '+962$phoneText';
      await AuthService.sendEmailVerification(
        phoneNumber: phone,
        email: email,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Verification code sent to your email'), backgroundColor: Colors.green),
      );
    } catch (e) {
      if (mounted) {
        setState(() => _emailSending = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _verifyEmailOtp() async {
    final otpCode = _emailOtpController.text.trim();
    if (otpCode.length != 6) return;

    try {
      final phone = '+962${context.read<AuthProvider>().phoneController.text.trim()}';
      final email = _emailController.text.trim();
      
      final result = await AuthService.verifyEmail(
        phoneNumber: phone,
        email: email,
        otpCode: otpCode,
      );

      if (mounted) {
        setState(() {
          _emailVerified = true;
          _emailSending = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Email verified successfully!'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    }
  }

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
                  SizedBox(height: screenH * 0.06),
                  Text('LET\'S GET STARTED',
                      style: GoogleFonts.ibmPlexSansArabic(
                          fontSize: screenW * 0.04,
                          fontWeight: FontWeight.w500,
                          color: themeProvider.isDark
                              ? AppColors.darkAccent
                              : AppColors.lightAccent)),
                  SizedBox(height: screenH * 0.02),
                  Text('Create your account',
                      style: GoogleFonts.ibmPlexSansArabic(
                          fontSize: screenW * 0.08,
                          fontWeight: FontWeight.bold,
                          color: themeProvider.isDark
                              ? AppColors.darkText
                              : AppColors.lightText)),
                  SizedBox(height: screenH * 0.02),
                  Text(
                      'One minute stands between you and real insight into your money',
                      style: GoogleFonts.ibmPlexSansArabic(
                          fontSize: screenW * 0.04,
                          fontWeight: FontWeight.w500,
                          color: themeProvider.isDark
                              ? AppColors.darkSubText
                              : AppColors.lightSubText)),
                  SizedBox(height: screenH * 0.03),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: screenW * 0.02),
                    child: Text('Full name',
                        style: TextStyle(
                            fontSize: screenW * 0.04,
                            color: themeProvider.isDark
                                ? AppColors.darkSubText
                                : AppColors.lightSubText,
                            fontWeight: FontWeight.bold)),
                  ),
                  SizedBox(height: screenH * 0.01),
                  CustomTextfield(
                      controller: authProvider.nameController,
                      hint: 'Enter your full name',
                      type: TextFieldType.name,
                      icon: Icons.person),
                  SizedBox(height: screenH * 0.02),
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
                  // Email field with Confirm button
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: screenW * 0.02),
                    child: Text('Email',
                        style: TextStyle(
                            fontSize: screenW * 0.04,
                            color: themeProvider.isDark
                                ? AppColors.darkSubText
                                : AppColors.lightSubText,
                            fontWeight: FontWeight.bold)),
                  ),
                  SizedBox(height: screenH * 0.01),
                  Row(
                    children: [
                      Expanded(
                        child: CustomTextfield(
                          controller: _emailController,
                          hint: 'Enter your email',
                          type: TextFieldType.email,
                          icon: Icons.email_outlined,
                          enabled: !_emailVerified,
                        ),
                      ),
                      SizedBox(width: screenW * 0.02),
                      _emailVerified
                          ? Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: screenW * 0.04,
                                vertical: screenH * 0.015,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.green.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                                border:
                                    Border.all(color: Colors.green, width: 1.5),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.check_circle,
                                      color: Colors.green, size: 22),
                                  SizedBox(width: screenW * 0.015),
                                  Text('Verified',
                                      style: TextStyle(
                                        color: Colors.green,
                                        fontWeight: FontWeight.w600,
                                        fontSize: screenW * 0.035,
                                      )),
                                ],
                              ),
                            )
                          : _emailSending
                              ? Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: screenW * 0.04,
                                    vertical: screenH * 0.015,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.orange.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                        color: Colors.orange, width: 1.5),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.orange,
                                        ),
                                      ),
                                      SizedBox(width: screenW * 0.015),
                                      Text('Check email',
                                          style: TextStyle(
                                            color: Colors.orange,
                                            fontWeight: FontWeight.w600,
                                            fontSize: screenW * 0.03,
                                          )),
                                    ],
                                  ),
                                )
                                : SizedBox(
                                    height: screenH * 0.055,
                                    child: ElevatedButton(
                                      onPressed: _sendEmailVerification,
                                      style: ButtonStyle(
                                        backgroundColor: WidgetStatePropertyAll(
                                            themeProvider.isDark
                                                ? AppColors.darkPrimary
                                                : AppColors.lightPrimary),
                                        shape: WidgetStatePropertyAll(
                                            RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(10))),
                                      ),
                                      child: Text('Confirm',
                                          style: TextStyle(
                                              fontSize: screenW * 0.035,
                                              color: AppColors.darkBorder,
                                              fontWeight: FontWeight.w600)),
                                    ),
                                  ),
                      ],
                    ),
                    if (_emailSending && !_emailVerified) ...[
                      SizedBox(height: screenH * 0.015),
                      Row(
                        children: [
                          Expanded(
                            child: CustomTextfield(
                              controller: _emailOtpController,
                              hint: 'Enter 6-digit OTP',
                              type: TextFieldType.number,
                              icon: Icons.security,
                              onChanged: (val) {
                                if (val.length == 6) {
                                  _verifyEmailOtp();
                                }
                              },
                            ),
                          ),
                          SizedBox(width: screenW * 0.02),
                          SizedBox(
                            height: screenH * 0.055,
                            child: ElevatedButton(
                              onPressed: _verifyEmailOtp,
                              style: ButtonStyle(
                                backgroundColor: WidgetStatePropertyAll(
                                    themeProvider.isDark
                                        ? AppColors.darkSecondary
                                        : AppColors.lightSecondary),
                                shape: WidgetStatePropertyAll(
                                    RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(10))),
                              ),
                              child: Text('Verify',
                                  style: TextStyle(
                                      fontSize: screenW * 0.035,
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  SizedBox(height: screenH * 0.02),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: screenW * 0.02),
                    child: Text('Date of birth',
                        style: TextStyle(
                            fontSize: screenW * 0.04,
                            color: themeProvider.isDark
                                ? AppColors.darkSubText
                                : AppColors.lightSubText,
                            fontWeight: FontWeight.bold)),
                  ),
                  SizedBox(height: screenH * 0.01),
                  CustomTextfield(
                    controller: authProvider.birthDateController,
                    hint: 'Select your birth date',
                    icon: Icons.calendar_month,
                    type: TextFieldType.date,
                    readOnly: true,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Date of birth is required';
                      }
                      return null;
                    },
                    onTap: () async {
                      final date = await Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => BirthDateScreen(
                                  initialDate: authProvider.birthDate)));
                      if (date != null) {
                        authProvider.setBirthDate(date);
                      }
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
                  SizedBox(height: screenH * 0.03),
                  Center(
                    child: authProvider.isLoading
                        ? const CircularProgressIndicator(
                            color: AppColors.darkAccent)
                        : ElevatedButton(
                            onPressed: () async {
                              if (!_formKey.currentState!.validate()) return;
                              if (authProvider.birthDate == null) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('الرجاء إدخال تاريخ الميلاد'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                                return;
                              }

                              if (!_emailVerified) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('الرجاء تأكيد البريد الإلكتروني أولاً'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                                return;
                              }

                              authProvider.setLoading(true);
                              try {
                                final result = await AuthService.register(
                                  phoneNumber:
                                      '+962${authProvider.phoneController.text.trim()}',
                                  email: _emailController.text.trim(),
                                  fullName:
                                      authProvider.nameController.text.trim(),
                                  birthDate: authProvider.birthDate!.toIso8601String(),
                                  password: authProvider.passwordController.text
                                      .trim(),
                                );
                                if (!mounted) return;
                                final data =
                                    result['data'] as Map<String, dynamic>?;
                                final otpCode = data?['otpCode'] as String?;
                                Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                        builder: (_) => OtpScreen(
                                              phoneNumber:
                                                  '+962${authProvider.phoneController.text.trim()}',
                                              devOtpCode: otpCode,
                                            )));
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
                            child: Text('Send verification code',
                                style: TextStyle(
                                    fontSize: screenW * 0.055,
                                    color: AppColors.darkBorder,
                                    fontWeight: FontWeight.w600)),
                          ),
                  ),
                  SizedBox(height: screenH * 0.06),
                  Center(
                    child: InkWell(
                      onTap: () => Navigator.pushReplacement(context,
                          MaterialPageRoute(builder: (_) => const Login())),
                      child: Text('Already have an account? Sign in',
                          style: TextStyle(
                              color: themeProvider.isDark
                                  ? AppColors.darkSecondary
                                  : AppColors.lightSecondary,
                              fontSize: screenW * 0.04,
                              fontWeight: FontWeight.w600)),
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
