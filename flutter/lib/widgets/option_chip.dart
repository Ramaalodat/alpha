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
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
            decoration: BoxDecoration(
              color: isSelected
                  ? (themeprovider.isDark
                      ? AppColors.darkPrimary
                      : AppColors.lightPrimary)
                  : (themeprovider.isDark
                      ? AppColors.darkCard
                      : AppColors.lightCard),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected
                    ? Colors.transparent
                    : (themeprovider.isDark
                        ? AppColors.darkBorder
                        : AppColors.lightBorder),
              ),
            ),
            child: Text(
              item,
              style: TextStyle(
                color: isSelected
                    ? Colors.white
                    : (themeprovider.isDark
                        ? AppColors.darkText
                        : AppColors.lightText),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
