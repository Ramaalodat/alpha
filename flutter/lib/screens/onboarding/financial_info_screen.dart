import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/api_exception.dart';
import 'package:alpha_app/services/onboarding_service.dart';
import 'package:flutter/material.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';

class FinancialInfoScreen extends StatefulWidget {
  const FinancialInfoScreen({super.key});

  @override
  State<FinancialInfoScreen> createState() => _FinancialInfoScreenState();
}

class _FinancialInfoScreenState extends State<FinancialInfoScreen> {
  final _monthlyIncomeCtrl = TextEditingController();
  final _basicExpensesCtrl = TextEditingController();
  final _savingsGoalCtrl = TextEditingController();

  String? _relationshipWithMoney;
  String? _mainGoal12M;
  final List<_EntryItem> _incomeSources = [];
  final List<_EntryItem> _fixedExpenses = [];
  final List<_EntryItem> _variableExpenses = [];
  bool _isLoading = false;

  @override
  void dispose() {
    _monthlyIncomeCtrl.dispose();
    _basicExpensesCtrl.dispose();
    _savingsGoalCtrl.dispose();
    super.dispose();
  }

  double get _totalIncome => double.tryParse(_monthlyIncomeCtrl.text) ?? 0;
  double get _totalFixedExpenses => _fixedExpenses.fold(
      0, (s, e) => s + (double.tryParse(e.amountCtrl.text) ?? 0));
  double get _totalVariableExpenses => _variableExpenses.fold(
      0, (s, e) => s + (double.tryParse(e.amountCtrl.text) ?? 0));
  double get _totalExpenses =>
      (double.tryParse(_basicExpensesCtrl.text) ?? 0) +
      _totalFixedExpenses +
      _totalVariableExpenses;
  double get _balance => _totalIncome - _totalExpenses;

  Future<void> _continue() async {
    if (_totalIncome <= 0) {
      _showError('Please enter your monthly income');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await OnboardingService.completeFinancialInfo(
        monthlyIncome: _totalIncome,
        basicExpenses: double.tryParse(_basicExpensesCtrl.text) ?? 0,
        financialGoal: _mainGoal12M ?? 'OTHER',
        primarySpendingCategory: _relationshipWithMoney ?? 'BALANCED_SPENDING',
        relationshipWithMoney: _relationshipWithMoney,
        monthlyExtraSavingsGoal: double.tryParse(_savingsGoalCtrl.text),
        mainFinancialGoal12M: _mainGoal12M,
        incomeSources: _incomeSources
            .where((e) => e.amountCtrl.text.isNotEmpty)
            .map((e) => {
                  'sourceType': e.type ?? 'OTHER_INCOME',
                  'amount': double.parse(e.amountCtrl.text),
                  'description': e.labelCtrl.text,
                })
            .toList(),
        fixedExpenses: _fixedExpenses
            .where((e) => e.amountCtrl.text.isNotEmpty)
            .map((e) => {
                  'category': e.labelCtrl.text,
                  'amount': double.parse(e.amountCtrl.text),
                })
            .toList(),
        variableExpenses: _variableExpenses
            .where((e) => e.amountCtrl.text.isNotEmpty)
            .map((e) => {
                  'category': e.labelCtrl.text,
                  'amount': double.parse(e.amountCtrl.text),
                })
            .toList(),
      );

      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/onboarding/first-goal');
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
        return 'Please complete the previous step first.';
      case 'INVALID_AMOUNT':
        return 'Please enter valid amounts.';
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
    final screenH = MediaQuery.of(context).size.height;
    final bg =
        theme.isDark ? AppColors.darkBackground : AppColors.lightBackground;
    final text = theme.isDark ? AppColors.darkText : AppColors.lightText;
    final sub = theme.isDark ? AppColors.darkSubText : AppColors.lightSubText;
    final primary =
        theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Financial Info',
            style: TextStyle(color: text, fontWeight: FontWeight.bold)),

      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Your finances',
                style: TextStyle(
                    fontSize: 24, fontWeight: FontWeight.bold, color: text)),
            const SizedBox(height: 8),
            Text('Enter your monthly income and expenses (JOD)',
                style: TextStyle(color: sub)),
            const SizedBox(height: 24),

            SizedBox(height: screenH * 0.02),
            LinearPercentIndicator(
              lineHeight: screenH * 0.02,
              percent: 0.66,
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

            // Monthly Income
            _buildTextField(theme, _monthlyIncomeCtrl, 'Monthly Income',
                Icons.account_balance_wallet,
                isNumber: true),
            const SizedBox(height: 16),
            _buildTextField(theme, _basicExpensesCtrl, 'Basic Monthly Expenses',
                Icons.receipt_long,
                isNumber: true),
            const SizedBox(height: 24),

            // Relationship with money
            Text('How would you describe your relationship with money?',
                style: TextStyle(fontWeight: FontWeight.bold, color: text)),
            const SizedBox(height: 8),
            Wrap(spacing: 8, runSpacing: 8, children: [
              _buildSmallChip(
                  theme,
                  'Careful saver',
                  _relationshipWithMoney == 'SAVING_CAREFULLY',
                  () => setState(
                      () => _relationshipWithMoney = 'SAVING_CAREFULLY')),
              _buildSmallChip(
                  theme,
                  'Balanced',
                  _relationshipWithMoney == 'BALANCED_SPENDING',
                  () => setState(
                      () => _relationshipWithMoney = 'BALANCED_SPENDING')),
              _buildSmallChip(
                  theme,
                  'Emotional',
                  _relationshipWithMoney == 'EMOTIONAL_SPENDING',
                  () => setState(
                      () => _relationshipWithMoney = 'EMOTIONAL_SPENDING')),
            ]),
            const SizedBox(height: 24),

            // Savings goal
            _buildTextField(theme, _savingsGoalCtrl,
                'Monthly extra savings goal (JOD)', Icons.savings,
                isNumber: true),
            const SizedBox(height: 24),

            // Main financial goal 12M
            Text('Main financial goal for next 12 months?',
                style: TextStyle(fontWeight: FontWeight.bold, color: text)),
            const SizedBox(height: 8),
            Wrap(spacing: 8, runSpacing: 8, children: [
              _buildSmallChip(theme, 'Education', _mainGoal12M == 'EDUCATION',
                  () => setState(() => _mainGoal12M = 'EDUCATION')),
              _buildSmallChip(theme, 'Technology', _mainGoal12M == 'TECHNOLOGY',
                  () => setState(() => _mainGoal12M = 'TECHNOLOGY')),
              _buildSmallChip(theme, 'Travel', _mainGoal12M == 'TRAVEL',
                  () => setState(() => _mainGoal12M = 'TRAVEL')),
              _buildSmallChip(theme, 'Car', _mainGoal12M == 'CAR',
                  () => setState(() => _mainGoal12M = 'CAR')),
            ]),
            const SizedBox(height: 24),

            // Income sources
            _buildSectionHeader(
                theme,
                'Income Sources',
                () => setState(() => _incomeSources
                    .add(_EntryItem(label: 'Salary', type: 'REGULAR_SALARY')))),
            ..._incomeSources.asMap().entries.map((e) => _buildEntryRow(
                theme, e.value,
                onRemove: () =>
                    setState(() => _incomeSources.removeAt(e.key)))),
            const SizedBox(height: 16),

            // Fixed expenses
            _buildSectionHeader(
                theme,
                'Fixed Expenses',
                () => setState(() =>
                    _fixedExpenses.add(_EntryItem(label: 'Rent', type: null)))),
            ..._fixedExpenses.asMap().entries.map((e) => _buildEntryRow(
                theme, e.value,
                onRemove: () =>
                    setState(() => _fixedExpenses.removeAt(e.key)))),
            const SizedBox(height: 16),

            // Variable expenses
            _buildSectionHeader(
                theme,
                'Variable Expenses',
                () => setState(() => _variableExpenses
                    .add(_EntryItem(label: 'Food', type: null)))),
            ..._variableExpenses.asMap().entries.map((e) => _buildEntryRow(
                theme, e.value,
                onRemove: () =>
                    setState(() => _variableExpenses.removeAt(e.key)))),
            const SizedBox(height: 24),

            // Balance summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _balance >= 0
                    ? Colors.green.withOpacity(0.1)
                    : Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: _balance >= 0 ? Colors.green : Colors.red),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(_balance >= 0 ? 'Surplus' : 'Deficit',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: _balance >= 0 ? Colors.green : Colors.red,
                          fontSize: 16)),
                  Text('${_balance.toStringAsFixed(0)} JOD',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: _balance >= 0 ? Colors.green : Colors.red,
                          fontSize: 18)),
                ],
              ),
            ),
            const SizedBox(height: 32),

            Center(
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _balance < 0 ? null : _continue,
                      style: ElevatedButton.styleFrom(
                          backgroundColor: primary,
                          fixedSize: const Size(double.infinity, 55),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12))),
                      child: Text('Continue',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w600)),
                    ),
            ),
            if (_balance < 0) ...[
              const SizedBox(height: 8),
              Center(
                  child: Text(
                      'Expenses exceed income. Please adjust your entries.',
                      style: TextStyle(color: Colors.red, fontSize: 13),
                      textAlign: TextAlign.center)),
            ],
            const SizedBox(height: 16),
            Center(
              child: TextButton(
                onPressed: _isLoading
                    ? null
                    : () => Navigator.pushReplacementNamed(
                        context, '/onboarding/first-goal'),
                child: Text('Skip for now', style: TextStyle(color: sub)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(Themeprovider theme, TextEditingController ctrl,
      String hint, IconData icon,
      {bool isNumber = false}) {
    return TextField(
      controller: ctrl,
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon,
            color: theme.isDark
                ? AppColors.darkSecondary
                : AppColors.lightSecondary),
        suffixText: isNumber ? 'JOD' : null,
        filled: true,
        fillColor: theme.isDark ? AppColors.darkCard : AppColors.lightCard,
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
      style: TextStyle(
          color: theme.isDark ? AppColors.darkText : AppColors.lightText),
    );
  }

  Widget _buildSmallChip(
      Themeprovider theme, String label, bool selected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
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
                fontSize: 13)),
      ),
    );
  }

  Widget _buildSectionHeader(
      Themeprovider theme, String title, VoidCallback onAdd) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title,
              style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color:
                      theme.isDark ? AppColors.darkText : AppColors.lightText)),
          IconButton(
              onPressed: onAdd,
              icon: Icon(Icons.add_circle_outline,
                  color: theme.isDark
                      ? AppColors.darkSecondary
                      : AppColors.lightSecondary)),
        ],
      ),
    );
  }

  Widget _buildEntryRow(Themeprovider theme, _EntryItem item,
      {VoidCallback? onRemove}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(
              flex: 2,
              child: TextField(
                controller: item.labelCtrl,
                decoration: InputDecoration(
                    hintText: 'Name',
                    isDense: true,
                    filled: true,
                    fillColor:
                        theme.isDark ? AppColors.darkCard : AppColors.lightCard,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none)),
                style: TextStyle(
                    color:
                        theme.isDark ? AppColors.darkText : AppColors.lightText,
                    fontSize: 14),
              )),
          const SizedBox(width: 8),
          Expanded(
              child: TextField(
            controller: item.amountCtrl,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
                hintText: 'JOD',
                isDense: true,
                filled: true,
                fillColor:
                    theme.isDark ? AppColors.darkCard : AppColors.lightCard,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide.none)),
            style: TextStyle(
                color: theme.isDark ? AppColors.darkText : AppColors.lightText,
                fontSize: 14),
          )),
          IconButton(
              onPressed: onRemove,
              icon: Icon(Icons.close, size: 20, color: Colors.red.shade300)),
        ],
      ),
    );
  }
}

class _EntryItem {
  final TextEditingController labelCtrl;
  final TextEditingController amountCtrl;
  final String? type;

  _EntryItem({String label = '', this.type})
      : labelCtrl = TextEditingController(text: label),
        amountCtrl = TextEditingController();
}
