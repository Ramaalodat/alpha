import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/providers/auth_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/auth/login.dart';
import 'package:alpha_app/screens/auth/otp_screen.dart';
import 'package:alpha_app/screens/profile/birth_date_screen.dart';
import 'package:alpha_app/widgets/custom_phonefield.dart';
import 'package:alpha_app/widgets/custom_textfield.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class CreateAccount extends StatefulWidget {
  const CreateAccount({
    super.key,
  });

  @override
  State<CreateAccount> createState() =>
      _CreateAccountState();
}

class _CreateAccountState extends State<CreateAccount> {
  final GlobalKey<FormState> _formKey =
      GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        if (!mounted) {
          return;
        }

        context.read<AuthProvider>().clear();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final double screenW =
        Device.width(context);

    final double screenH =
        Device.height(context);

    final Themeprovider themeProvider =
        context.watch<Themeprovider>();

    final AuthProvider authProvider =
        context.watch<AuthProvider>();

    final bool isDark =
        themeProvider.isDark;

    return SafeArea(
      child: Scaffold(
        backgroundColor: isDark
            ? AppColors.darkBackground
            : AppColors.lightBackground,
        body: Form(
          key: _formKey,
          child: SingleChildScrollView(
            physics:
                const BouncingScrollPhysics(),
            padding: EdgeInsets.symmetric(
              horizontal: screenW * 0.05,
            ),
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                SizedBox(
                  height: screenH * 0.055,
                ),

                Text(
                  "LET'S GET STARTED",
                  style:
                      GoogleFonts.ibmPlexSansArabic(
                    fontSize: screenW * 0.04,
                    fontWeight: FontWeight.w500,
                    color: isDark
                        ? AppColors.darkAccent
                        : AppColors.lightAccent,
                  ),
                ),

                SizedBox(
                  height: screenH * 0.018,
                ),

                Text(
                  'Create your account',
                  style:
                      GoogleFonts.ibmPlexSansArabic(
                    fontSize: screenW * 0.08,
                    fontWeight: FontWeight.bold,
                    color: isDark
                        ? AppColors.darkText
                        : AppColors.lightText,
                  ),
                ),

                SizedBox(
                  height: screenH * 0.012,
                ),

                Text(
                  'One minute stands between you and real insight into your money.',
                  style:
                      GoogleFonts.ibmPlexSansArabic(
                    fontSize: screenW * 0.038,
                    fontWeight: FontWeight.w500,
                    height: 1.5,
                    color: isDark
                        ? AppColors.darkSubText
                        : AppColors.lightSubText,
                  ),
                ),

                SizedBox(
                  height: screenH * 0.03,
                ),

                // ================= FULL NAME =================

                _SectionTitle(
                  title: 'Full name',
                  isDark: isDark,
                  screenW: screenW,
                ),

                SizedBox(
                  height: screenH * 0.01,
                ),

                CustomTextfield(
                  controller:
                      authProvider.nameController,
                  hint: 'Enter your full name',
                  type: TextFieldType.name,
                  icon: Icons.person_outline,
                  validator: (value) {
                    final String name =
                        value?.trim() ?? '';

                    if (name.isEmpty) {
                      return 'Full name is required';
                    }

                    if (name.length < 3) {
                      return 'Enter a valid full name';
                    }

                    return null;
                  },
                ),

                SizedBox(
                  height: screenH * 0.022,
                ),

                // ================= PHONE =================

                _SectionTitle(
                  title: 'Phone number',
                  isDark: isDark,
                  screenW: screenW,
                ),

                SizedBox(
                  height: screenH * 0.01,
                ),

                CustomPhoneField(
                  controller:
                      authProvider.phoneController,
                  validator: (value) {
                    final String phone =
                        value?.trim() ?? '';

                    if (phone.isEmpty) {
                      return 'Phone number is required';
                    }

                    if (phone.length != 9) {
                      return 'Enter a valid 9-digit phone number';
                    }

                    if (!phone.startsWith('7')) {
                      return 'Phone number must start with 7';
                    }

                    return null;
                  },
                ),

                SizedBox(
                  height: screenH * 0.022,
                ),

                // ================= EMAIL =================

                _SectionTitle(
                  title: 'Email',
                  isDark: isDark,
                  screenW: screenW,
                ),

                SizedBox(
                  height: screenH * 0.01,
                ),

                CustomTextfield(
                  controller:
                      authProvider.emailController,
                  hint: 'Enter your email',
                  type: TextFieldType.email,
                  icon: Icons.email_outlined,
                  enabled:
                      !authProvider.emailVerified,
                  validator: (value) {
                    final String email =
                        value?.trim() ?? '';

                    if (email.isEmpty) {
                      return 'Email is required';
                    }

                    final RegExp emailRegex =
                        RegExp(
                      r'^[^@\s]+@[^@\s]+\.[^@\s]+$',
                    );

                    if (!emailRegex
                        .hasMatch(email)) {
                      return 'Enter a valid email';
                    }

                    return null;
                  },
                  onChanged: (_) {
                    authProvider.onEmailChanged();
                  },
                ),

                SizedBox(
                  height: screenH * 0.014,
                ),

                // ================= SEND EMAIL CODE =================

                if (!authProvider.emailVerified)
                  SizedBox(
                    width: double.infinity,
                    height: screenH * 0.058,
                    child: ElevatedButton.icon(
                      onPressed: authProvider
                              .isSendingEmailOtp
                          ? null
                          : () async {
                              await _sendEmailOtp(
                                authProvider,
                              );
                            },
                      style:
                          ElevatedButton.styleFrom(
                        backgroundColor: isDark
                            ? AppColors.darkSecondary
                            : AppColors.lightSecondary,
                        foregroundColor:
                            AppColors.darkBorder,
                        disabledBackgroundColor:
                            (isDark
                                    ? AppColors
                                        .darkSecondary
                                    : AppColors
                                        .lightSecondary)
                                .withOpacity(0.45),
                        elevation: 0,
                        shape:
                            RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(
                            10,
                          ),
                        ),
                      ),
                      icon: authProvider
                              .isSendingEmailOtp
                          ? const SizedBox(
                              width: 19,
                              height: 19,
                              child:
                                  CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(
                              Icons
                                  .mark_email_read_outlined,
                            ),
                      label: Text(
                        authProvider
                                .showEmailOtpField
                            ? 'Resend Email Code'
                            : 'Confirm Email',
                        style: TextStyle(
                          fontSize:
                              screenW * 0.038,
                          fontWeight:
                              FontWeight.w600,
                        ),
                      ),
                    ),
                  ),

                // ================= EMAIL OTP =================

                if (authProvider.showEmailOtpField &&
                    !authProvider.emailVerified) ...[
                  SizedBox(
                    height: screenH * 0.018,
                  ),

                  _EmailCodeInfoCard(
                    email: authProvider.email,
                    isDark: isDark,
                    screenW: screenW,
                  ),

                  SizedBox(
                    height: screenH * 0.016,
                  ),

                  CustomTextfield(
                    controller: authProvider
                        .emailOtpController,
                    hint:
                        'Enter 6-digit email code',
                    type: TextFieldType.number,
                    icon: Icons.security_outlined,
                    onChanged: (value) async {
                      if (value.trim().length ==
                              6 &&
                          !authProvider
                              .isVerifyingEmailOtp) {
                        await _verifyEmailOtp(
                          authProvider,
                        );
                      }
                    },
                  ),

                  SizedBox(
                    height: screenH * 0.012,
                  ),

                  SizedBox(
                    width: double.infinity,
                    height: screenH * 0.058,
                    child: ElevatedButton(
                      onPressed: authProvider
                              .isVerifyingEmailOtp
                          ? null
                          : () async {
                              await _verifyEmailOtp(
                                authProvider,
                              );
                            },
                      style:
                          ElevatedButton.styleFrom(
                        backgroundColor: isDark
                            ? AppColors.darkPrimary
                            : AppColors.lightPrimary,
                        foregroundColor:
                            AppColors.darkBorder,
                        disabledBackgroundColor:
                            (isDark
                                    ? AppColors
                                        .darkPrimary
                                    : AppColors
                                        .lightPrimary)
                                .withOpacity(0.45),
                        elevation: 0,
                        shape:
                            RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(
                            10,
                          ),
                        ),
                      ),
                      child: authProvider
                              .isVerifyingEmailOtp
                          ? const SizedBox(
                              width: 21,
                              height: 21,
                              child:
                                  CircularProgressIndicator(
                                strokeWidth: 2.2,
                                color: Colors.white,
                              ),
                            )
                          : Text(
                              'Verify Email Code',
                              style: TextStyle(
                                fontSize:
                                    screenW * 0.04,
                                fontWeight:
                                    FontWeight.w600,
                              ),
                            ),
                    ),
                  ),
                ],

                // ================= EMAIL VERIFIED =================

                if (authProvider.emailVerified) ...[
                  SizedBox(
                    height: screenH * 0.014,
                  ),

                  _VerifiedEmailCard(
                    isDark: isDark,
                    screenW: screenW,
                  ),
                ],

                SizedBox(
                  height: screenH * 0.022,
                ),

                // ================= BIRTH DATE =================

                _SectionTitle(
                  title: 'Date of birth',
                  isDark: isDark,
                  screenW: screenW,
                ),

                SizedBox(
                  height: screenH * 0.01,
                ),

                CustomTextfield(
                  controller: authProvider
                      .birthDateController,
                  hint:
                      'Select your birth date',
                  icon:
                      Icons.calendar_month_outlined,
                  type: TextFieldType.date,
                  readOnly: true,
                  validator: (value) {
                    if (value == null ||
                        value.trim().isEmpty) {
                      return 'Date of birth is required';
                    }

                    return null;
                  },
                  onTap: () async {
                    final DateTime? date =
                        await Navigator.push<
                            DateTime>(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>
                            BirthDateScreen(
                          initialDate:
                              authProvider.birthDate,
                        ),
                      ),
                    );

                    if (date != null &&
                        context.mounted) {
                      authProvider
                          .setBirthDate(date);
                    }
                  },
                ),

                SizedBox(
                  height: screenH * 0.022,
                ),

                // ================= PASSWORD =================

                _SectionTitle(
                  title: 'Password',
                  isDark: isDark,
                  screenW: screenW,
                ),

                SizedBox(
                  height: screenH * 0.01,
                ),

                CustomTextfield(
                  controller: authProvider
                      .passwordController,
                  hint:
                      '8+ chars, upper, lower, number',
                  icon:
                      Icons.lock_outline_rounded,
                  type: TextFieldType.password,
                  validator: (value) {
                    if (value == null ||
                        value.isEmpty) {
                      return 'validation.password_required'
                          .tr();
                    }

                    if (value.length < 8) {
                      return 'Password must be at least 8 characters';
                    }

                    if (!RegExp(
                      r'(?=.*[a-z])',
                    ).hasMatch(value)) {
                      return 'Password must contain a lowercase letter';
                    }

                    if (!RegExp(
                      r'(?=.*[A-Z])',
                    ).hasMatch(value)) {
                      return 'Password must contain an uppercase letter';
                    }

                    if (!RegExp(
                      r'(?=.*\d)',
                    ).hasMatch(value)) {
                      return 'Password must contain a number';
                    }

                    return null;
                  },
                ),

                // ================= PROVIDER ERROR =================

                if (authProvider.errorMessage !=
                    null) ...[
                  SizedBox(
                    height: screenH * 0.018,
                  ),

                  _ErrorCard(
                    message:
                        authProvider.errorMessage!,
                    isDark: isDark,
                    onClose:
                        authProvider.clearError,
                  ),
                ],

                SizedBox(
                  height: screenH * 0.032,
                ),

                // ================= SEND PHONE OTP =================

                SizedBox(
                  width: double.infinity,
                  height: screenH * 0.065,
                  child: ElevatedButton(
                    onPressed:
                        authProvider.isLoading
                            ? null
                            : () async {
                                await _sendPhoneOtp(
                                  authProvider,
                                );
                              },
                    style:
                        ElevatedButton.styleFrom(
                      backgroundColor: isDark
                          ? AppColors.darkPrimary
                          : AppColors.lightPrimary,
                      foregroundColor:
                          AppColors.darkBorder,
                      disabledBackgroundColor:
                          (isDark
                                  ? AppColors
                                      .darkPrimary
                                  : AppColors
                                      .lightPrimary)
                              .withOpacity(0.45),
                      elevation: 0,
                      shape:
                          RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(
                          10,
                        ),
                      ),
                    ),
                    child: authProvider.isLoading
                        ? const SizedBox(
                            width: 23,
                            height: 23,
                            child:
                                CircularProgressIndicator(
                              strokeWidth: 2.4,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            'Send Phone Verification Code',
                            style: TextStyle(
                              fontSize:
                                  screenW * 0.047,
                              fontWeight:
                                  FontWeight.w600,
                            ),
                          ),
                  ),
                ),

                SizedBox(
                  height: screenH * 0.035,
                ),

                Center(
                  child: InkWell(
                    onTap: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              const Login(),
                        ),
                      );
                    },
                    child: Text(
                      'Already have an account? Sign in',
                      style: TextStyle(
                        color: isDark
                            ? AppColors.darkSecondary
                            : AppColors.lightSecondary,
                        fontSize:
                            screenW * 0.04,
                        fontWeight:
                            FontWeight.w600,
                      ),
                    ),
                  ),
                ),

                SizedBox(
                  height: screenH * 0.04,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // =====================================================
  // UI HANDLER: SEND EMAIL OTP
  // =====================================================

  Future<void> _sendEmailOtp(
    AuthProvider authProvider,
  ) async {
    FocusScope.of(context).unfocus();

    final bool success =
        await authProvider.sendEmailOtp();

    if (!mounted) {
      return;
    }

    _showMessage(
      success
          ? 'Verification code sent to your email'
          : authProvider.errorMessage ??
              'Could not send email verification code',
      isError: !success,
    );
  }

  // =====================================================
  // UI HANDLER: VERIFY EMAIL OTP
  // =====================================================

  Future<void> _verifyEmailOtp(
    AuthProvider authProvider,
  ) async {
    FocusScope.of(context).unfocus();

    final bool success =
        await authProvider.verifyEmailOtp();

    if (!mounted) {
      return;
    }

    _showMessage(
      success
          ? 'Email verified successfully'
          : authProvider.errorMessage ??
              'Email verification failed',
      isError: !success,
    );
  }

  // =====================================================
  // UI HANDLER: SEND PHONE OTP
  // =====================================================

  Future<void> _sendPhoneOtp(
    AuthProvider authProvider,
  ) async {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    final Map<String, dynamic>? result =
        await authProvider
            .sendRegistrationOtp();

    if (!mounted) {
      return;
    }

    if (result == null) {
      _showMessage(
        authProvider.errorMessage ??
            'Could not send phone verification code',
        isError: true,
      );

      return;
    }

    final dynamic rawData =
        result['data'];

    final Map<String, dynamic> data =
        rawData is Map
            ? Map<String, dynamic>.from(
                rawData,
              )
            : <String, dynamic>{};

    final String? devOtpCode =
        data['otpCode']?.toString();

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => OtpScreen(
          phoneNumber:
              authProvider.fullPhoneNumber,
          devOtpCode: devOtpCode,
          isRegistration: true,
          fullName: authProvider.fullName,
          birthDate:
              authProvider.birthDateIso,
          password: authProvider.password,
          email: authProvider.email,
        ),
      ),
    );
  }

  // =====================================================
  // UI MESSAGE
  // =====================================================

  void _showMessage(
    String message, {
    bool isError = false,
  }) {
    final bool isDark =
        context.read<Themeprovider>().isDark;

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: isError
              ? (isDark
                  ? AppColors.darkError
                  : AppColors.lightError)
              : (isDark
                  ? AppColors.darkSecondary
                  : AppColors.lightSecondary),
          behavior:
              SnackBarBehavior.floating,
        ),
      );
  }
}

// =====================================================
// SECTION TITLE
// =====================================================

class _SectionTitle extends StatelessWidget {
  final String title;
  final bool isDark;
  final double screenW;

  const _SectionTitle({
    required this.title,
    required this.isDark,
    required this.screenW,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: screenW * 0.02,
      ),
      child: Text(
        title,
        style: TextStyle(
          fontSize: screenW * 0.04,
          color: isDark
              ? AppColors.darkSubText
              : AppColors.lightSubText,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

// =====================================================
// EMAIL CODE INFO CARD
// =====================================================

class _EmailCodeInfoCard
    extends StatelessWidget {
  final String email;
  final bool isDark;
  final double screenW;

  const _EmailCodeInfoCard({
    required this.email,
    required this.isDark,
    required this.screenW,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkSecondary
                .withOpacity(0.10)
            : AppColors.lightSecondary
                .withOpacity(0.10),
        borderRadius:
            BorderRadius.circular(13),
        border: Border.all(
          color: isDark
              ? AppColors.darkSecondary
                  .withOpacity(0.25)
              : AppColors.lightSecondary
                  .withOpacity(0.25),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.mark_email_unread_outlined,
            color: isDark
                ? AppColors.darkSecondary
                : AppColors.lightSecondary,
          ),

          const SizedBox(width: 10),

          Expanded(
            child: Text(
              'Enter the verification code sent to $email',
              style:
                  GoogleFonts.ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkText
                    : AppColors.lightText,
                fontSize:
                    screenW * 0.031,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================
// VERIFIED EMAIL CARD
// =====================================================

class _VerifiedEmailCard
    extends StatelessWidget {
  final bool isDark;
  final double screenW;

  const _VerifiedEmailCard({
    required this.isDark,
    required this.screenW,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: (isDark
                ? AppColors.darkSecondary
                : AppColors.lightSecondary)
            .withOpacity(0.11),
        borderRadius:
            BorderRadius.circular(13),
        border: Border.all(
          color: isDark
              ? AppColors.darkSecondary
              : AppColors.lightSecondary,
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.verified_rounded,
            color: isDark
                ? AppColors.darkSecondary
                : AppColors.lightSecondary,
          ),

          const SizedBox(width: 10),

          Expanded(
            child: Text(
              'Email verified successfully',
              style:
                  GoogleFonts.ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkSecondary
                    : AppColors.lightSecondary,
                fontSize:
                    screenW * 0.034,
                fontWeight:
                    FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================
// ERROR CARD
// =====================================================

class _ErrorCard extends StatelessWidget {
  final String message;
  final bool isDark;
  final VoidCallback onClose;

  const _ErrorCard({
    required this.message,
    required this.isDark,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    final Color errorColor = isDark
        ? AppColors.darkError
        : AppColors.lightError;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(
        left: 13,
        top: 7,
        bottom: 7,
      ),
      decoration: BoxDecoration(
        color:
            errorColor.withOpacity(0.10),
        borderRadius:
            BorderRadius.circular(13),
        border: Border.all(
          color:
              errorColor.withOpacity(0.20),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.error_outline_rounded,
            color: errorColor,
          ),

          const SizedBox(width: 9),

          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: errorColor,
              ),
            ),
          ),

          IconButton(
            onPressed: onClose,
            icon: Icon(
              Icons.close_rounded,
              color: errorColor,
              size: 18,
            ),
          ),
        ],
      ),
    );
  }
}