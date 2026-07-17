import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class MultiSelectChip extends StatelessWidget {
  final List<String> items;
  final List<String> selectedItems;
  final ValueChanged<String> onTap;

  const MultiSelectChip({
    super.key,
    required this.items,
    required this.selectedItems,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final themeprovider = Provider.of<Themeprovider>(context);
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: items.map((item) {
          final isSelected = selectedItems.contains(item);
          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: InkWell(
              onTap: () => onTap(item),
              borderRadius: BorderRadius.circular(10),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.transparent
                      : (themeprovider.isDark
                          ? AppColors.darkBorder
                          : const Color(0xFFC1C7CD)), // Light grey from image
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected
                        ? (themeprovider.isDark
                            ? AppColors.darkPrimary
                            : AppColors.lightPrimary)
                        : Colors.transparent,
                    width: isSelected ? 1.5 : 0.0,
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
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
