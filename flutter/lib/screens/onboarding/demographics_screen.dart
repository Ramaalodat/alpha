import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/api_exception.dart';
import 'package:alpha_app/services/user_service.dart';
import 'package:flutter/material.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';

class DemographicsScreen extends StatefulWidget {
  const DemographicsScreen({super.key});

  @override
  State<DemographicsScreen> createState() => _DemographicsScreenState();
}

class _DemographicsScreenState extends State<DemographicsScreen> {
  String? _selectedGender;
  String? _selectedMaritalStatus;
  int _familyMembers = 1;
  bool _isHeadOfHousehold = false;
  bool _isStudent = false;
  bool _isLoading = false;

  Future<void> _continue() async {
    if (_selectedGender == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Please select your gender'),
            backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await UserService.updateDemographics(
        gender: _selectedGender!,
        maritalStatus: _selectedMaritalStatus,
        isHeadOfHousehold: _isHeadOfHousehold,
        isStudent: _isStudent,
      );
      await UserService.updateFamilySize(familySize: _familyMembers);

      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/onboarding/financial-info');
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
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<Themeprovider>(context);
    final screenW = MediaQuery.of(context).size.width;
    final screenH = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor:
          theme.isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Personal Info',
            style: TextStyle(
                color: theme.isDark ? AppColors.darkText : AppColors.lightText,
                fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: screenW * 0.05),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            Text('Tell us about yourself',
                style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: theme.isDark
                        ? AppColors.darkText
                        : AppColors.lightText)),
            const SizedBox(height: 8),
            Text('This helps us personalize your experience',
                style: TextStyle(
                    color: theme.isDark
                        ? AppColors.darkSubText
                        : AppColors.lightSubText)),
            const SizedBox(height: 32),

            SizedBox(height: screenH * 0.02),
            LinearPercentIndicator(
              lineHeight: screenH * 0.02,
              percent: 0.33,
              backgroundColor:
                  theme.isDark ? AppColors.darkBorder : AppColors.lightBorder,
              progressColor: theme.isDark
                  ? AppColors.darkSecondary
                  : AppColors.lightSecondary,
              barRadius: const Radius.circular(10),
              animation: false,
              animationDuration: 1000,
            ),
            SizedBox(height: screenH * 0.03),

            // Gender
            _buildSectionTitle(theme, 'Gender'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                    child: _buildChoiceChip(
                        theme,
                        'Male',
                        _selectedGender == 'MALE',
                        () => setState(() => _selectedGender = 'MALE'),
                        Icons.male)),
                const SizedBox(width: 12),
                Expanded(
                    child: _buildChoiceChip(
                        theme,
                        'Female',
                        _selectedGender == 'FEMALE',
                        () => setState(() => _selectedGender = 'FEMALE'),
                        Icons.female)),
              ],
            ),
            const SizedBox(height: 24),

            // Marital Status
            _buildSectionTitle(theme, 'Marital Status'),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _buildSmallChip(
                    theme,
                    'Single',
                    _selectedMaritalStatus == 'SINGLE',
                    () => setState(() => _selectedMaritalStatus = 'SINGLE')),
                _buildSmallChip(
                    theme,
                    'Married',
                    _selectedMaritalStatus == 'MARRIED',
                    () => setState(() => _selectedMaritalStatus = 'MARRIED')),
                _buildSmallChip(
                    theme,
                    'Other',
                    _selectedMaritalStatus == 'OTHER',
                    () => setState(() => _selectedMaritalStatus = 'OTHER')),
              ],
            ),
            const SizedBox(height: 24),

            _buildSectionTitle(theme, 'Family members'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: theme.isDark ? AppColors.darkCard : AppColors.lightCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: theme.isDark
                        ? AppColors.darkBorder
                        : AppColors.lightBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildCounterButton(
                    theme,
                    icon: Icons.remove,
                    onTap: _familyMembers > 1
                        ? () => setState(() => _familyMembers--)
                        : null,
                  ),
                  Text(
                    '$_familyMembers',
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color.fromARGB(255, 0, 108, 90),
                    ),
                  ),
                  _buildCounterButton(
                    theme,
                    icon: Icons.add,
                    onTap: _familyMembers < 20
                        ? () => setState(() => _familyMembers++)
                        : null,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Toggles
            _buildToggleTile(theme, 'Head of household', _isHeadOfHousehold,
                (v) => setState(() => _isHeadOfHousehold = v)),
            _buildToggleTile(theme, 'University student', _isStudent,
                (v) => setState(() => _isStudent = v)),
            const SizedBox(height: 40),

            // Continue button
            Center(
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _continue,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.isDark
                            ? AppColors.darkPrimary
                            : AppColors.lightPrimary,
                        fixedSize: Size(screenW * 0.8, 55),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Continue',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w600)),
                    ),
            ),
            const SizedBox(height: 16),
            Center(
              child: TextButton(
                onPressed: _isLoading
                    ? null
                    : () => Navigator.pushReplacementNamed(
                        context, '/onboarding/financial-info'),
                child: Text('Skip for now',
                    style: TextStyle(
                        color: theme.isDark
                            ? AppColors.darkSecondary
                            : AppColors.lightSecondary)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(Themeprovider theme, String title) {
    return Text(title,
        style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: theme.isDark ? AppColors.darkText : AppColors.lightText));
  }

  Widget _buildChoiceChip(Themeprovider theme, String label, bool selected,
      VoidCallback onTap, IconData icon) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: selected
              ? (theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary)
              : (theme.isDark ? AppColors.darkCard : AppColors.lightCard),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: selected
                  ? Colors.transparent
                  : (theme.isDark
                      ? AppColors.darkBorder
                      : AppColors.lightBorder)),
        ),
        child: Column(
          children: [
            Icon(icon,
                size: 32,
                color: selected
                    ? Colors.white
                    : (theme.isDark
                        ? AppColors.darkSecondary
                        : AppColors.lightSecondary)),
            const SizedBox(height: 8),
            Text(label,
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: selected
                        ? Colors.white
                        : (theme.isDark
                            ? AppColors.darkText
                            : AppColors.lightText))),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallChip(
      Themeprovider theme, String label, bool selected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
        decoration: BoxDecoration(
          color: selected
              ? (theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary)
              : (theme.isDark ? AppColors.darkCard : AppColors.lightCard),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color: selected
                  ? Colors.transparent
                  : (theme.isDark
                      ? AppColors.darkBorder
                      : AppColors.lightBorder)),
        ),
        child: Text(label,
            style: TextStyle(
                color: selected
                    ? Colors.white
                    : (theme.isDark ? AppColors.darkText : AppColors.lightText),
                fontWeight: FontWeight.w500)),
      ),
    );
  }

  Widget _buildToggleTile(Themeprovider theme, String title, bool value,
      ValueChanged<bool> onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: theme.isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: theme.isDark ? AppColors.darkBorder : AppColors.lightBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title,
              style: TextStyle(
                  fontSize: 16,
                  color:
                      theme.isDark ? AppColors.darkText : AppColors.lightText)),
          Switch(
              value: value,
              onChanged: onChanged,
              activeThumbColor: theme.isDark
                  ? AppColors.darkPrimary
                  : AppColors.lightPrimary),
        ],
      ),
    );
  }

  Widget _buildCounterButton(
    Themeprovider theme, {
    required IconData icon,
    required VoidCallback? onTap,
  }) {
    final isEnabled = onTap != null;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: theme.isDark
              ? AppColors.darkBackground
              : AppColors.lightBackground,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.familyMembersAccent, width: 1.5),
        ),
        child: Icon(
          icon,
          color: isEnabled
              ? AppColors.familyMembersAccent
              : AppColors.familyMembersAccent.withOpacity(0.45),
        ),
      ),
    );
  }
}
