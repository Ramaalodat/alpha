import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/user_service.dart';
import 'package:alpha_app/screens/profile/birth_date_screen.dart';
import 'package:alpha_app/widgets/custom_textfield.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class EditPersonalInfoScreen extends StatefulWidget {
  final String currentName;
  final String? currentBirthDate;

  const EditPersonalInfoScreen({
    super.key,
    required this.currentName,
    this.currentBirthDate,
  });

  @override
  State<EditPersonalInfoScreen> createState() => _EditPersonalInfoScreenState();
}

class _EditPersonalInfoScreenState extends State<EditPersonalInfoScreen> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _birthDateCtrl;
  DateTime? _selectedBirthDate;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.currentName);
    _birthDateCtrl = TextEditingController();

    if (widget.currentBirthDate != null && widget.currentBirthDate!.isNotEmpty) {
      try {
        _selectedBirthDate = DateTime.parse(widget.currentBirthDate!);
        _birthDateCtrl.text =
            "${_selectedBirthDate!.day}/${_selectedBirthDate!.month}/${_selectedBirthDate!.year}";
      } catch (e) {
        // Fallback if parsing fails
      }
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _birthDateCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your full name'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    
    if (_selectedBirthDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your date of birth'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await UserService.updateBasicInfo(
        fullName: name,
        birthDate: _selectedBirthDate!.toIso8601String(),
      );
      if (!mounted) return;
      Navigator.pop(context, true);
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
    final isDark = theme.isDark;
    final text = isDark ? AppColors.darkText : AppColors.lightText;
    final sub = isDark ? AppColors.darkSubText : AppColors.lightSubText;
    final card = isDark ? AppColors.darkCard : AppColors.lightCard;
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
        title: Text('Edit Personal Info',
            style: TextStyle(color: text, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Full Name',
                style: TextStyle(
                    color: sub, fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: card,
                borderRadius: BorderRadius.circular(16),
              ),
              child: CustomTextfield(
                controller: _nameCtrl,
                hint: 'Enter your full name',
                icon: Icons.person,
                type: TextFieldType.name,
              ),
            ),
            const SizedBox(height: 24),
            Text('Date of Birth',
                style: TextStyle(
                    color: sub, fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: card,
                borderRadius: BorderRadius.circular(16),
              ),
              child: CustomTextfield(
                controller: _birthDateCtrl,
                hint: 'Date of Birth',
                icon: Icons.calendar_month,
                type: TextFieldType.date,
                readOnly: true,
                onTap: () async {
                  final date = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BirthDateScreen(
                        initialDate: _selectedBirthDate,
                      ),
                    ),
                  );
                  if (date != null) {
                    setState(() {
                      _selectedBirthDate = date;
                      _birthDateCtrl.text =
                          "${date.day}/${date.month}/${date.year}";
                    });
                  }
                },
              ),
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Save',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
