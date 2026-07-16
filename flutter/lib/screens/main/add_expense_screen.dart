import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/finance_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class AddExpenseScreen extends StatefulWidget {
  const AddExpenseScreen({super.key});

  @override
  State<AddExpenseScreen> createState() => _AddExpenseScreenState();
}

class _AddExpenseScreenState extends State<AddExpenseScreen> {
  final _amountCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  String? _selectedCategoryId;
  String? _paymentMethod;
  DateTime _expenseDate = DateTime.now();
  bool _isLoading = false;
  List<dynamic> _categories = [];

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      final cats = await FinanceService.loadExpenseCategories();
      if (mounted) setState(() => _categories = cats);
    } catch (_) {}
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final amount = double.tryParse(_amountCtrl.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Enter a valid amount'), backgroundColor: Colors.red));
      return;
    }
    if (_selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Select a category'), backgroundColor: Colors.red));
      return;
    }

    setState(() => _isLoading = true);
    try {
      await FinanceService.createExpense(
        categoryId: _selectedCategoryId!,
        amount: amount,
        description: _descCtrl.text.isNotEmpty ? _descCtrl.text : null,
        expenseDate: _expenseDate.toIso8601String(),
        paymentMethod: _paymentMethod,
      );
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<Themeprovider>(context);
    final text = theme.isDark ? AppColors.darkText : AppColors.lightText;
    final sub = theme.isDark ? AppColors.darkSubText : AppColors.lightSubText;
    final card = theme.isDark ? AppColors.darkCard : AppColors.lightCard;
    final border = theme.isDark ? AppColors.darkBorder : AppColors.lightBorder;
    final primary =
        theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary;

    return Scaffold(
      backgroundColor:
          theme.isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppBar(
          title: const Text('Add Expense'),
          backgroundColor: Colors.transparent,
          elevation: 0),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('New Expense',
                style: TextStyle(
                    fontSize: 24, fontWeight: FontWeight.bold, color: text)),
            const SizedBox(height: 24),
            TextField(
              controller: _amountCtrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                  hintText: 'Amount (JOD)',
                  prefixIcon: const Icon(Icons.payments_outlined),
                  filled: true,
                  fillColor: card,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: border)),
                  enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: border))),
              style: TextStyle(color: text),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _selectedCategoryId,
              decoration: InputDecoration(
                  hintText: 'Category',
                  filled: true,
                  fillColor: card,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: border)),
                  enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: border))),
              dropdownColor: card,
              style: TextStyle(color: text),
              items: _categories
                  .map((c) => DropdownMenuItem(
                      value: c['id'] as String,
                      child: Text(c['name']?.toString() ?? 'Category')))
                  .toList(),
              onChanged: (v) => setState(() => _selectedCategoryId = v),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descCtrl,
              decoration: InputDecoration(
                  hintText: 'Description (optional)',
                  prefixIcon: const Icon(Icons.description_outlined),
                  filled: true,
                  fillColor: card,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: border)),
                  enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: border))),
              style: TextStyle(color: text),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _paymentMethod,
              decoration: InputDecoration(
                  hintText: 'Payment method',
                  filled: true,
                  fillColor: card,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: border)),
                  enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: border))),
              dropdownColor: card,
              style: TextStyle(color: text),
              items: ['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT']
                  .map((v) => DropdownMenuItem(
                      value: v, child: Text(v.replaceAll('_', ' '))))
                  .toList(),
              onChanged: (v) => setState(() => _paymentMethod = v),
            ),
            const SizedBox(height: 16),
            InkWell(
              onTap: () async {
                final d = await showDatePicker(
                    context: context,
                    initialDate: _expenseDate,
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now());
                if (d != null) setState(() => _expenseDate = d);
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                    color: card,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: border)),
                child: Row(children: [
                  Icon(Icons.calendar_today, color: sub),
                  const SizedBox(width: 12),
                  Text(
                      '${_expenseDate.day}/${_expenseDate.month}/${_expenseDate.year}',
                      style: TextStyle(color: text)),
                ]),
              ),
            ),
            const SizedBox(height: 32),
            Center(
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _save,
                      style: ElevatedButton.styleFrom(
                          backgroundColor: primary,
                          fixedSize: const Size(double.infinity, 55),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12))),
                      child: const Text('Save Expense',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w600)),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
