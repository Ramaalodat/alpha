import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/api_exception.dart';
import 'package:alpha_app/services/onboarding_service.dart';
import 'package:flutter/material.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';

class FirstGoalScreen extends StatefulWidget {
  const FirstGoalScreen({super.key});

  @override
  State<FirstGoalScreen> createState() => _FirstGoalScreenState();
}

class _FirstGoalScreenState extends State<FirstGoalScreen> {
  final _nameCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _customEmojiCtrl = TextEditingController();
  DateTime? _targetDate;
  String _selectedIcon = '🎯';
  String? _customIcon;
  String _flexibility = 'FLEXIBLE';
  bool _isLoading = false;

  static const _icons = [
    '🎯',
    '🏦',
    '💰',
    '🏠',
    '🚗',
    '✈️',
    '🎓',
    '💻',
    '📱',
    '🛒',
    '🎁',
    '💎'
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _amountCtrl.dispose();
    _customEmojiCtrl.dispose();
    super.dispose();
  }

  void _showCustomEmojiDialog() {
    _customEmojiCtrl.clear();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Enter a custom emoji'),
        content: TextField(
          controller: _customEmojiCtrl,
          autofocus: true,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 32),
          maxLength: 2,
          decoration: const InputDecoration(
            hintText: '🎉',
            hintStyle: TextStyle(fontSize: 32),
            counterText: '',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              final emoji = _customEmojiCtrl.text.trim();
              if (emoji.isNotEmpty) {
                Navigator.pop(ctx);
                setState(() {
                  _customIcon = emoji;
                  _selectedIcon = emoji;
                });
              }
            },
            child: const Text('Use'),
          ),
        ],
      ),
    );
  }

  Future<void> _createGoal() async {
    if (_nameCtrl.text.trim().isEmpty) {
      _showError('Please enter a goal name');
      return;
    }
    final amount = double.tryParse(_amountCtrl.text);
    if (amount == null || amount <= 0) {
      _showError('Please enter a valid target amount');
      return;
    }
    if (_targetDate == null) {
      _showError('Please select a target date');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await OnboardingService.createFirstGoal(
        icon: _selectedIcon,
        name: _nameCtrl.text.trim(),
        targetAmount: amount,
        targetDate: _targetDate!.toIso8601String(),
        flexibility: _flexibility,
      );

      if (!mounted) return;
      Navigator.pushNamedAndRemoveUntil(
          context, '/dashboard', (route) => false);
    } on ApiException catch (e) {
      if (!mounted) return;
      _showError(_friendlyMessage(e));
    } catch (e) {
      if (!mounted) return;
      _showError('Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  /// Map backend error codes to user-friendly messages.
  String _friendlyMessage(ApiException e) {
    switch (e.code) {
      case 'ONBOARDING_INCOMPLETE':
        return 'Please complete the financial info step first.';
      case 'INVALID_AMOUNT':
        return 'Please enter a valid target amount.';
      case 'INVALID_DATE_RANGE':
        return 'Target date must be in the future.';
      case 'UNAUTHORIZED':
      case 'TOKEN_EXPIRED':
        return 'Your session has expired. Please log in again.';
      default:
        return e.message;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<Themeprovider>(context);
    final screenW = MediaQuery.of(context).size.width;
    final screenH = MediaQuery.of(context).size.height;
    final text = theme.isDark ? AppColors.darkText : AppColors.lightText;
    final sub = theme.isDark ? AppColors.darkSubText : AppColors.lightSubText;
    final primary =
        theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary;

    return Scaffold(
      backgroundColor:
          theme.isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('First Goal',
            style: TextStyle(color: text, fontWeight: FontWeight.bold)),

      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Set your first financial goal',
                style: TextStyle(
                    fontSize: 24, fontWeight: FontWeight.bold, color: text)),
            const SizedBox(height: 8),
            Text('Choose something meaningful to motivate your journey',
                style: TextStyle(color: sub)),
            const SizedBox(height: 32),

            SizedBox(height: screenH * 0.02),
            LinearPercentIndicator(
              lineHeight: screenH * 0.02,
              percent: 1.0,
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

            // Icon picker
            Text('Choose an icon',
                style: TextStyle(fontWeight: FontWeight.bold, color: text)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                ..._icons.map((icon) => _buildIconTile(theme, icon)),
                // Show custom emoji tile if one was picked
                if (_customIcon != null && !_icons.contains(_customIcon))
                  _buildIconTile(theme, _customIcon!),
                // "+" button for custom emoji
                _buildAddButton(theme),
              ],
            ),
            const SizedBox(height: 24),

            // Goal name
            TextField(
              controller: _nameCtrl,
              decoration: InputDecoration(
                hintText: 'Goal name (e.g., Emergency Fund)',
                prefixIcon: const Icon(Icons.flag_outlined),
                filled: true,
                fillColor:
                    theme.isDark ? AppColors.darkCard : AppColors.lightCard,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                        color: theme.isDark
                            ? AppColors.darkBorder
                            : AppColors.lightBorder)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                        color: theme.isDark
                            ? AppColors.darkBorder
                            : AppColors.lightBorder)),
              ),
              style: TextStyle(color: text),
            ),
            const SizedBox(height: 16),

            // Target amount
            TextField(
              controller: _amountCtrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                hintText: 'Target amount',
                suffixText: 'JOD',
                prefixIcon: const Icon(Icons.monetization_on_outlined),
                filled: true,
                fillColor:
                    theme.isDark ? AppColors.darkCard : AppColors.lightCard,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                        color: theme.isDark
                            ? AppColors.darkBorder
                            : AppColors.lightBorder)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                        color: theme.isDark
                            ? AppColors.darkBorder
                            : AppColors.lightBorder)),
              ),
              style: TextStyle(color: text),
            ),
            const SizedBox(height: 16),

            // Target date
            InkWell(
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now().add(const Duration(days: 90)),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 365 * 7)),
                );
                if (date != null) setState(() => _targetDate = date);
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color:
                      theme.isDark ? AppColors.darkCard : AppColors.lightCard,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: theme.isDark
                          ? AppColors.darkBorder
                          : AppColors.lightBorder),
                ),
                child: Row(
                  children: [
                    Icon(Icons.calendar_today,
                        color: theme.isDark
                            ? AppColors.darkSecondary
                            : AppColors.lightSecondary),
                    const SizedBox(width: 12),
                    Text(
                        _targetDate != null
                            ? '${_targetDate!.day}/${_targetDate!.month}/${_targetDate!.year}'
                            : 'Select target date',
                        style:
                            TextStyle(color: _targetDate != null ? text : sub)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Flexibility
            Text('Goal type',
                style: TextStyle(fontWeight: FontWeight.bold, color: text)),
            const SizedBox(height: 8),
            Row(children: [
              Expanded(
                  child: _buildFlexChip(
                      theme, 'Fixed (cannot postpone)', 'FIXED')),
              const SizedBox(width: 12),
              Expanded(child: _buildFlexChip(theme, 'Flexible', 'FLEXIBLE')),
            ]),
            const SizedBox(height: 40),

            Center(
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _createGoal,
                      style: ElevatedButton.styleFrom(
                          backgroundColor: primary,
                          fixedSize: Size(screenW * 0.8, 55),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12))),
                      child: Text('Create Goal & Start',
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
                    : () => Navigator.pushNamedAndRemoveUntil(
                        context, '/dashboard', (route) => false),
                child: Text('Skip for now', style: TextStyle(color: sub)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildFlexChip(Themeprovider theme, String label, String value) {
    final selected = _flexibility == value;
    final primary =
        theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary;
    return InkWell(
      onTap: () => setState(() => _flexibility = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: selected
              ? primary
              : (theme.isDark ? AppColors.darkCard : AppColors.lightCard),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: selected
                  ? Colors.transparent
                  : (theme.isDark
                      ? AppColors.darkBorder
                      : AppColors.lightBorder)),
        ),
        child: Text(label,
            textAlign: TextAlign.center,
            style: TextStyle(
                color: selected
                    ? Colors.white
                    : (theme.isDark ? AppColors.darkText : AppColors.lightText),
                fontWeight: FontWeight.w500)),
      ),
    );
  }

  Widget _buildIconTile(Themeprovider theme, String icon) {
    final primary =
        theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary;
    return InkWell(
      onTap: () => setState(() => _selectedIcon = icon),
      child: Container(
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          color: _selectedIcon == icon
              ? primary.withOpacity(0.2)
              : (theme.isDark ? AppColors.darkCard : AppColors.lightCard),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: _selectedIcon == icon ? primary : Colors.transparent),
        ),
        child: Center(child: Text(icon, style: const TextStyle(fontSize: 24))),
      ),
    );
  }

  Widget _buildAddButton(Themeprovider theme) {
    return InkWell(
      onTap: _showCustomEmojiDialog,
      child: Container(
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          color: theme.isDark ? AppColors.darkCard : AppColors.lightCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color:
                  theme.isDark ? AppColors.darkBorder : AppColors.lightBorder),
        ),
        child: Center(
          child: Icon(
            Icons.add,
            size: 28,
            color:
                theme.isDark ? AppColors.darkSubText : AppColors.lightSubText,
          ),
        ),
      ),
    );
  }
}
