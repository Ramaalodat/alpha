import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class OptionChip extends StatelessWidget {
  final List<String> items;
  final String? selected;
  final ValueChanged<String> onTap;

  const OptionChip({
    super.key,
    required this.items,
    this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final themeprovider = Provider.of<Themeprovider>(context);
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: items.map((item) {
        final isSelected = item == selected;
        return InkWell(
          onTap: () => onTap(item),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
            decoration: BoxDecoration(
              color: isSelected
                  ? (themeprovider.isDark
                      ? AppColors.darkPrimary.withOpacity(0.05)
                      : AppColors.lightPrimary.withOpacity(0.05))
                  : (themeprovider.isDark
                      ? AppColors.darkBorder
                      : AppColors.lightSubText.withOpacity(0.2)),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected
                    ? (themeprovider.isDark
                        ? AppColors.darkPrimary
                        : AppColors.lightPrimary)
                    : Colors.transparent,
                width: 1.5,
              ),
            ),
            child: Text(
              item,
              style: TextStyle(
                color: isSelected
                    ? (themeprovider.isDark
                        ? AppColors.darkPrimary
                        : AppColors.lightPrimary)
                    : (themeprovider.isDark
                        ? AppColors.darkSubText
                        : AppColors.lightSubText),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
