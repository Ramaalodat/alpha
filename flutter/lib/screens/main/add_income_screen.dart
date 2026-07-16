import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/finance_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class AddIncomeScreen extends StatefulWidget {
  const AddIncomeScreen({super.key});

  @override
  State<AddIncomeScreen> createState() => _AddIncomeScreenState();
}

class _AddIncomeScreenState extends State<AddIncomeScreen> {
  final _amountCtrl = TextEditingController();
  final _sourceCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  bool _isRecurring = false;
  String? _frequency;
  DateTime _incomeDate = DateTime.now();
  bool _isLoading = false;

  @override
  void dispose() {
    _amountCtrl.dispose();
    _sourceCtrl.dispose();
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
    if (_sourceCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Enter a source'), backgroundColor: Colors.red));
      return;
    }
    if (_isRecurring && _frequency == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Select a frequency for recurring income'),
          backgroundColor: Colors.red));
      return;
    }

    setState(() => _isLoading = true);
    try {
      await FinanceService.createIncome(
        amount: amount,
        source: _sourceCtrl.text.trim(),
        description: _descCtrl.text.isNotEmpty ? _descCtrl.text : null,
        incomeDate: _incomeDate.toIso8601String(),
        isRecurring: _isRecurring,
        frequency: _frequency,
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
          title: const Text('Add Income'),
          backgroundColor: Colors.transparent,
          elevation: 0),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('New Income',
                style: TextStyle(
                    fontSize: 24, fontWeight: FontWeight.bold, color: text)),
            const SizedBox(height: 24),
            TextField(
                controller: _sourceCtrl,
                decoration: InputDecoration(
                    hintText: 'Source (e.g., Salary)',
                    prefixIcon: const Icon(Icons.work_outline),
                    filled: true,
                    fillColor: card,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: border)),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: border))),
                style: TextStyle(color: text)),
            const SizedBox(height: 16),
            TextField(
                controller: _amountCtrl,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                    hintText: 'Amount (JOD)',
                    prefixIcon: const Icon(Icons.monetization_on_outlined),
                    filled: true,
                    fillColor: card,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: border)),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: border))),
                style: TextStyle(color: text)),
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
                style: TextStyle(color: text)),
            const SizedBox(height: 16),
            InkWell(
              onTap: () async {
                final d = await showDatePicker(
                    context: context,
                    initialDate: _incomeDate,
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now().add(const Duration(days: 30)));
                if (d != null) setState(() => _incomeDate = d);
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
                      '${_incomeDate.day}/${_incomeDate.month}/${_incomeDate.year}',
                      style: TextStyle(color: text))
                ]),
              ),
            ),
            const SizedBox(height: 16),
            SwitchListTile(
                title: Text('Recurring income', style: TextStyle(color: text)),
                value: _isRecurring,
                onChanged: (v) => setState(() {
                      _isRecurring = v;
                      if (!v) _frequency = null;
                    }),
                activeThumbColor: primary),
            if (_isRecurring) ...[
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: _frequency,
                decoration: InputDecoration(
                    hintText: 'Frequency',
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
                items: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']
                    .map((v) => DropdownMenuItem(value: v, child: Text(v)))
                    .toList(),
                onChanged: (v) => setState(() => _frequency = v),
              ),
            ],
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
                      child: const Text('Save Income',
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
