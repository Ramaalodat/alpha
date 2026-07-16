import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/finance_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class AddGoalScreen extends StatefulWidget {
  const AddGoalScreen({super.key});

  @override
  State<AddGoalScreen> createState() => _AddGoalScreenState();
}

class _AddGoalScreenState extends State<AddGoalScreen> {
  final _nameCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  DateTime? _targetDate;
  String _selectedIcon = '🎯';
  String? _priority;
  final String _flexibility = 'FLEXIBLE';
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
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_nameCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Enter a goal name'), backgroundColor: Colors.red));
      return;
    }
    final amount = double.tryParse(_amountCtrl.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Enter a valid amount'), backgroundColor: Colors.red));
      return;
    }
    if (_targetDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Select a target date'), backgroundColor: Colors.red));
      return;
    }

    setState(() => _isLoading = true);
    try {
      await FinanceService.createGoal(
        icon: _selectedIcon,
        name: _nameCtrl.text.trim(),
        targetAmount: amount,
        targetDate: _targetDate!.toIso8601String(),
        flexibility: _flexibility,
        priority: _priority,
        description: _descCtrl.text.isNotEmpty ? _descCtrl.text : null,
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
          title: const Text('Add Goal'),
          backgroundColor: Colors.transparent,
          elevation: 0),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('New Goal',
                style: TextStyle(
                    fontSize: 24, fontWeight: FontWeight.bold, color: text)),
            const SizedBox(height: 16),
            Wrap(
                spacing: 10,
                runSpacing: 10,
                children: _icons
                    .map((icon) => InkWell(
                          onTap: () => setState(() => _selectedIcon = icon),
                          child: Container(
                            width: 46,
                            height: 46,
                            decoration: BoxDecoration(
                                color: _selectedIcon == icon
                                    ? primary.withOpacity(0.2)
                                    : card,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                    color: _selectedIcon == icon
                                        ? primary
                                        : Colors.transparent)),
                            child: Center(
                                child: Text(icon,
                                    style: const TextStyle(fontSize: 22))),
                          ),
                        ))
                    .toList()),
            const SizedBox(height: 20),
            TextField(
                controller: _nameCtrl,
                decoration: InputDecoration(
                    hintText: 'Goal name',
                    prefixIcon: const Icon(Icons.flag_outlined),
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
                    hintText: 'Target amount (JOD)',
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
                    initialDate: DateTime.now().add(const Duration(days: 90)),
                    firstDate: DateTime.now(),
                    lastDate:
                        DateTime.now().add(const Duration(days: 365 * 7)));
                if (d != null) setState(() => _targetDate = d);
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
                      _targetDate != null
                          ? '${_targetDate!.day}/${_targetDate!.month}/${_targetDate!.year}'
                          : 'Target date',
                      style: TextStyle(color: _targetDate != null ? text : sub))
                ]),
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _priority,
              decoration: InputDecoration(
                  hintText: 'Priority',
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
              items: ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
                  .map((v) => DropdownMenuItem(value: v, child: Text(v)))
                  .toList(),
              onChanged: (v) => setState(() => _priority = v),
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
                        child: const Text('Create Goal',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w600)),
                      )),
          ],
        ),
      ),
    );
  }
}
