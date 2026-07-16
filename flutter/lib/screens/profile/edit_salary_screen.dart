import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/user_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class EditSalaryScreen extends StatefulWidget {
  final double currentSalary;
  const EditSalaryScreen({super.key, required this.currentSalary});

  @override
  State<EditSalaryScreen> createState() => _EditSalaryScreenState();
}

class _EditSalaryScreenState extends State<EditSalaryScreen> {
  late final TextEditingController _salaryCtrl;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _salaryCtrl = TextEditingController(
      text: widget.currentSalary > 0
          ? widget.currentSalary.toStringAsFixed(
              widget.currentSalary == widget.currentSalary.roundToDouble()
                  ? 0
                  : 2,
            )
          : '',
    );
  }

  @override
  void dispose() {
    _salaryCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final newSalary = double.tryParse(_salaryCtrl.text);
    if (newSalary == null || newSalary < 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Enter a valid amount'), backgroundColor: Colors.red));
      return;
    }
    if (newSalary == widget.currentSalary) {
      Navigator.pop(context, false);
      return;
    }

    setState(() => _isLoading = true);
    try {
      await UserService.updateMonthlyIncome(monthlyIncome: newSalary);
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
    final isDark = theme.isDark;
    final text = isDark ? AppColors.darkText : AppColors.lightText;
    final sub = isDark ? AppColors.darkSubText : AppColors.lightSubText;
    final card = isDark ? AppColors.darkCard : AppColors.lightCard;
    final border = isDark ? AppColors.darkBorder : AppColors.lightBorder;
    final primary = isDark ? AppColors.darkPrimary : AppColors.lightPrimary;

    return Scaffold(
      backgroundColor:
          isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: text),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Update Salary',
            style: TextStyle(color: text, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Current salary card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Current Salary',
                      style: TextStyle(color: sub, fontSize: 14)),
                  const SizedBox(height: 8),
                  Text(
                    '${widget.currentSalary.toStringAsFixed(widget.currentSalary == widget.currentSalary.roundToDouble() ? 0 : 2)} JOD',
                    style: TextStyle(
                        color: text, fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Text('Your previous salary is preserved in history',
                      style: TextStyle(color: sub, fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // New salary input
            Text('New Salary',
                style: TextStyle(
                    color: text, fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            TextField(
              controller: _salaryCtrl,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(
                hintText: 'Enter new salary',
                suffixText: 'JOD',
                prefixIcon: const Icon(Icons.payments_outlined),
                filled: true,
                fillColor: card,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: border)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: border)),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: primary, width: 2)),
              ),
              style: TextStyle(color: text, fontSize: 18),
            ),
            const SizedBox(height: 32),

            // Save button
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Text('Save New Salary',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
