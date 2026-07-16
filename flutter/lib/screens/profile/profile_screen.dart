import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/auth_service.dart';
import 'package:alpha_app/services/user_service.dart';
import 'package:alpha_app/screens/profile/edit_salary_screen.dart';
import 'package:alpha_app/screens/profile/edit_personal_info_screen.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late Future<Map<String, dynamic>> _profileFuture;
  bool _isLoggingOut = false;
  bool _hasLoadedOnce = false;

  @override
  void initState() {
    super.initState();
    _profileFuture = UserService.getProfile();
  }

  /// Re-fetch profile every time the screen becomes visible again
  /// (e.g. after returning from edit-salary screen).
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_hasLoadedOnce) {
      _profileFuture = UserService.getProfile();
    }
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        final theme = Provider.of<Themeprovider>(ctx, listen: false);
        return AlertDialog(
          backgroundColor:
              theme.isDark ? AppColors.darkCard : AppColors.lightCard,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text('Log Out',
              style: TextStyle(
                  color:
                      theme.isDark ? AppColors.darkText : AppColors.lightText,
                  fontWeight: FontWeight.bold)),
          content: Text('Are you sure you want to log out?',
              style: TextStyle(
                  color: theme.isDark
                      ? AppColors.darkSubText
                      : AppColors.lightSubText)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: Text('Cancel',
                  style: TextStyle(
                      color: theme.isDark
                          ? AppColors.darkSubText
                          : AppColors.lightSubText)),
            ),
            TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Log Out',
                  style: TextStyle(
                      color: Colors.red, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) return;

    setState(() => _isLoggingOut = true);
    try {
      await AuthService.logout();
      if (!mounted) return;
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    } catch (_) {
      // Even if API call fails, clear tokens locally and go to login
      await AuthService.logout();
      if (!mounted) return;
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    } finally {
      if (mounted) setState(() => _isLoggingOut = false);
    }
  }

  Widget _buildCompleteProfileBanner(Themeprovider theme) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.isDark ? AppColors.darkPrimary.withOpacity(0.2) : AppColors.lightPrimary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline, color: theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'أكمل بيانات ملفك الشخصي',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: theme.isDark ? AppColors.darkText : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'احصل على تجربة أفضل بإكمال بياناتك',
                  style: TextStyle(
                    fontSize: 12,
                    color: theme.isDark ? AppColors.darkSubText : AppColors.lightSubText,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pushNamed(context, '/onboarding/demographics').then((_) {
                setState(() {
                  _profileFuture = UserService.getProfile();
                });
              });
            },
            child: Text(
              'إكمال',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<Themeprovider>(context);
    final isDark = theme.isDark;
    final bg = isDark ? AppColors.darkBackground : AppColors.lightBackground;
    final text = isDark ? AppColors.darkText : AppColors.lightText;
    final sub = isDark ? AppColors.darkSubText : AppColors.lightSubText;
    final card = isDark ? AppColors.darkCard : AppColors.lightCard;
    final border = isDark ? AppColors.darkBorder : AppColors.lightBorder;
    final primary = isDark ? AppColors.darkPrimary : AppColors.lightPrimary;
    final secondary =
        isDark ? AppColors.darkSecondary : AppColors.lightSecondary;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: text),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Profile',
            style: TextStyle(color: text, fontWeight: FontWeight.bold)),
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
                child: Text('Unable to load profile',
                    style: TextStyle(color: text)));
          }

          final user = snapshot.data ?? {};
          _hasLoadedOnce = true;
          final fullName = user['fullName'] ?? 'User';
          final phone = user['phoneNumber'] ?? '';
          final birthDate = user['birthDate'] != null
              ? _formatDate(user['birthDate'])
              : 'Not set';
          final gender = user['gender'] ?? 'Not set';
          final status = user['status'] ?? '';
          final memberSince =
              user['createdAt'] != null ? _formatDate(user['createdAt']) : '';

          // monthlyIncome lives inside the nested profiles array
          final profiles = (user['profiles'] as List?) ?? [];
          final currentProfile = profiles.isNotEmpty
              ? Map<String, dynamic>.from(profiles.first)
              : <String, dynamic>{};
          final monthlyIncome = double.tryParse(
                  currentProfile['monthlyIncome']?.toString() ?? '') ??
              0.0;

          return RefreshIndicator(
            onRefresh: () async {
              setState(() {
                _profileFuture = UserService.getProfile();
              });
            },
            color: primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  if (currentProfile['primarySpendingCategory'] == 'غير محدد')
                    _buildCompleteProfileBanner(theme),
                  const SizedBox(height: 16),
                  // Avatar
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [primary, secondary],
                      ),
                    ),
                    child: Center(
                      child: Text(
                        _initials(fullName),
                        style: GoogleFonts.ibmPlexSansArabic(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Name
                  Text(
                    fullName,
                    style: GoogleFonts.ibmPlexSansArabic(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: text,
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Status badge
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _statusLabel(status),
                      style: TextStyle(
                          color: primary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextButton.icon(
                    onPressed: () async {
                      final updated = await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => EditPersonalInfoScreen(
                            currentName: fullName,
                            currentBirthDate: user['birthDate'],
                          ),
                        ),
                      );
                      if (updated == true) {
                        setState(() {
                          _profileFuture = UserService.getProfile();
                        });
                      }
                    },
                    icon: Icon(Icons.edit, color: primary, size: 18),
                    label: Text('Edit Personal Info',
                        style: TextStyle(color: primary, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 16),

                  // Info cards
                  _buildInfoTile(
                      Icons.phone, 'Phone', phone, text, sub, card, border),
                  const SizedBox(height: 12),
                  _buildInfoTile(Icons.person, 'Gender', _genderLabel(gender),
                      text, sub, card, border),
                  const SizedBox(height: 12),
                  _buildInfoTile(Icons.cake, 'Date of Birth', birthDate, text,
                      sub, card, border),
                  if (memberSince.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    _buildInfoTile(Icons.calendar_today, 'Member Since',
                        memberSince, text, sub, card, border),
                  ],
                  const SizedBox(height: 12),
                  // Monthly Income – tappable to edit
                  _buildSalaryTile(
                      monthlyIncome, text, sub, card, border, primary),
                  const SizedBox(height: 40),

                  // Logout button
                  SizedBox(
                    width: double.infinity,
                    height: 55,
                    child: OutlinedButton.icon(
                      icon: _isLoggingOut
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.red))
                          : const Icon(Icons.logout,
                              color: Colors.red, size: 22),
                      label: Text(
                        _isLoggingOut ? 'Logging out...' : 'Log Out',
                        style: const TextStyle(
                            color: Colors.red,
                            fontSize: 17,
                            fontWeight: FontWeight.w600),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.red, width: 1.5),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: _isLoggingOut ? null : _logout,
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value, Color text,
      Color sub, Color card, Color border) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: sub.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: sub),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(color: sub, fontSize: 13)),
                const SizedBox(height: 2),
                Text(value,
                    style: TextStyle(
                        color: text,
                        fontSize: 16,
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSalaryTile(double monthlyIncome, Color text, Color sub,
      Color card, Color border, Color primary) {
    final formatted = monthlyIncome == monthlyIncome.roundToDouble()
        ? monthlyIncome.toInt().toString()
        : monthlyIncome.toStringAsFixed(2);
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () async {
        final updated = await Navigator.push<bool>(
          context,
          MaterialPageRoute(
            builder: (_) => EditSalaryScreen(currentSalary: monthlyIncome),
          ),
        );
        if (updated == true) {
          // Reload profile to show the new salary immediately
          setState(() {
            _profileFuture = UserService.getProfile();
          });
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: border),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: sub.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.payments_outlined, size: 20, color: sub),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Monthly Income',
                      style: TextStyle(color: sub, fontSize: 13)),
                  const SizedBox(height: 2),
                  Text('$formatted JOD',
                      style: TextStyle(
                          color: text,
                          fontSize: 16,
                          fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            Icon(Icons.edit_outlined, size: 20, color: primary),
          ],
        ),
      ),
    );
  }

  String _initials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    if (name.isNotEmpty) return name[0].toUpperCase();
    return '?';
  }

  String _formatDate(String iso) {
    try {
      final date = DateTime.parse(iso);
      return '${date.day}/${date.month}/${date.year}';
    } catch (_) {
      return iso;
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'VERIFIED':
        return 'Verified';
      case 'PENDING_VERIFICATION':
        return 'Pending Verification';
      case 'SUSPENDED':
        return 'Suspended';
      default:
        return status;
    }
  }

  String _genderLabel(String gender) {
    switch (gender) {
      case 'MALE':
        return 'Male';
      case 'FEMALE':
        return 'Female';
      default:
        return gender;
    }
  }
}
