import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/models/expense_model.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

class ExpenseCard extends StatelessWidget {
  final ExpenseModel expense;
  final VoidCallback onDelete;
  final VoidCallback? onEdit;
  final VoidCallback? onTap;

  const ExpenseCard({
    super.key,
    required this.expense,
    required this.onDelete,
    this.onEdit,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark =
        context.watch<Themeprovider>().isDark;

    final Color categoryColor =
        _categoryColor(expense.category);

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(
        bottom: 16,
      ),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF172624)
            : Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.04)
              : Colors.black.withOpacity(0.06),
        ),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 14,
                  offset: const Offset(0, 6),
                ),
              ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(22),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(22),
          child: Padding(
            padding: const EdgeInsets.all(17),
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                _ExpenseHeader(
                  expense: expense,
                  isDark: isDark,
                  categoryColor: categoryColor,
                  onEdit: onEdit,
                  onDelete: onDelete,
                ),

                const SizedBox(height: 17),

                _ExpenseDetailsGrid(
                  expense: expense,
                  isDark: isDark,
                  categoryColor: categoryColor,
                ),

                if (expense.note != null &&
                    expense.note!.trim().isNotEmpty) ...[
                  const SizedBox(height: 14),

                  _ExpenseNote(
                    note: expense.note!,
                    isDark: isDark,
                  ),
                ],

                const SizedBox(height: 14),

                _ExpenseInsight(
                  expense: expense,
                  isDark: isDark,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// =====================================================
// HEADER
// =====================================================

class _ExpenseHeader extends StatelessWidget {
  final ExpenseModel expense;
  final bool isDark;
  final Color categoryColor;
  final VoidCallback? onEdit;
  final VoidCallback onDelete;

  const _ExpenseHeader({
    required this.expense,
    required this.isDark,
    required this.categoryColor,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: categoryColor.withOpacity(0.13),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(
            _categoryIcon(expense.category),
            color: categoryColor,
            size: 26,
          ),
        ),

        const SizedBox(width: 13),

        Expanded(
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Text(
                expense.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.ibmPlexSansArabic(
                  color: isDark
                      ? AppColors.darkText
                      : AppColors.lightText,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 4),

              Wrap(
                spacing: 7,
                runSpacing: 5,
                crossAxisAlignment:
                    WrapCrossAlignment.center,
                children: [
                  _SmallLabel(
                    text: expense.category,
                    color: categoryColor,
                  ),

                  _SmallLabel(
                    text: _sourceLabel(
                      expense.source,
                    ),
                    color: _sourceColor(
                      expense.source,
                    ),
                  ),

                  _SmallLabel(
                    text: expense.expenseType ==
                            ExpenseType.need
                        ? 'Need'
                        : 'Want',
                    color: expense.expenseType ==
                            ExpenseType.need
                        ? const Color(0xFF34D399)
                        : const Color(0xFFF4C95D),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(width: 8),

        Column(
          crossAxisAlignment:
              CrossAxisAlignment.end,
          children: [
            Text(
              '${expense.amount.toStringAsFixed(2)} JOD',
              style: GoogleFonts.ibmPlexSansArabic(
                color: categoryColor,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 3),

            Text(
              DateFormat(
                'dd MMM yyyy',
              ).format(expense.date),
              style: GoogleFonts.ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkSubText
                    : AppColors.lightSubText,
                fontSize: 9,
              ),
            ),
          ],
        ),

        PopupMenuButton<String>(
          tooltip: 'Expense options',
          padding: EdgeInsets.zero,
          color: isDark
              ? const Color(0xFF203330)
              : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          icon: Icon(
            Icons.more_vert_rounded,
            color: isDark
                ? AppColors.darkSubText
                : AppColors.lightSubText,
          ),
          onSelected: (value) {
            if (value == 'edit') {
              onEdit?.call();
            }

            if (value == 'delete') {
              onDelete();
            }
          },
          itemBuilder: (_) {
            return [
              if (onEdit != null)
                PopupMenuItem<String>(
                  value: 'edit',
                  child: Row(
                    children: [
                      Icon(
                        Icons.edit_outlined,
                        color: isDark
                            ? AppColors.darkText
                            : AppColors.lightText,
                        size: 20,
                      ),

                      const SizedBox(width: 9),

                      Text(
                        'Edit Expense',
                        style: GoogleFonts
                            .ibmPlexSansArabic(
                          color: isDark
                              ? AppColors.darkText
                              : AppColors.lightText,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),

              PopupMenuItem<String>(
                value: 'delete',
                child: Row(
                  children: [
                    const Icon(
                      Icons.delete_outline_rounded,
                      color: Color(0xFFFF6B6B),
                    ),

                    const SizedBox(width: 9),

                    Text(
                      'Delete Expense',
                      style: GoogleFonts
                          .ibmPlexSansArabic(
                        color:
                            const Color(0xFFFF6B6B),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ];
          },
        ),
      ],
    );
  }
}

// =====================================================
// SMALL LABEL
// =====================================================

class _SmallLabel extends StatelessWidget {
  final String text;
  final Color color;

  const _SmallLabel({
    required this.text,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.11),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: GoogleFonts.ibmPlexSansArabic(
          color: color,
          fontSize: 9,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

// =====================================================
// DETAILS GRID
// =====================================================

class _ExpenseDetailsGrid extends StatelessWidget {
  final ExpenseModel expense;
  final bool isDark;
  final Color categoryColor;

  const _ExpenseDetailsGrid({
    required this.expense,
    required this.isDark,
    required this.categoryColor,
  });

  @override
  Widget build(BuildContext context) {
    final bool recurring =
        expense.movementType ==
            ExpenseMovementType.recurring;

    return LayoutBuilder(
      builder: (
        context,
        constraints,
      ) {
        final double itemWidth =
            (constraints.maxWidth - 10) / 2;

        return Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            SizedBox(
              width: itemWidth,
              child: _InfoTile(
                icon: Icons
                    .account_balance_wallet_outlined,
                title: 'Payment',
                value: expense.paymentMethod,
                color: categoryColor,
                isDark: isDark,
              ),
            ),

            SizedBox(
              width: itemWidth,
              child: _InfoTile(
                icon: recurring
                    ? Icons.autorenew_rounded
                    : Icons.bolt_outlined,
                title: 'Movement',
                value: recurring
                    ? 'Recurring'
                    : 'Occasional',
                color: recurring
                    ? const Color(0xFF14B8A6)
                    : const Color(0xFFF4C95D),
                isDark: isDark,
              ),
            ),

            if (recurring)
              SizedBox(
                width: itemWidth,
                child: _InfoTile(
                  icon: Icons
                      .calendar_view_week_outlined,
                  title: 'Coverage',
                  value: _coverageLabel(
                    expense.coveragePeriod,
                  ),
                  color:
                      const Color(0xFF4F9CF9),
                  isDark: isDark,
                ),
              ),

            SizedBox(
              width: itemWidth,
              child: _InfoTile(
                icon: _sourceIcon(
                  expense.source,
                ),
                title: 'Source',
                value: _sourceLabel(
                  expense.source,
                ),
                color: _sourceColor(
                  expense.source,
                ),
                isDark: isDark,
              ),
            ),
          ],
        );
      },
    );
  }
}

// =====================================================
// INFO TILE
// =====================================================

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;
  final bool isDark;

  const _InfoTile({
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
     constraints: const BoxConstraints(
    minHeight: 62,
  ),
      padding: const EdgeInsets.symmetric(
        horizontal: 11,
        vertical: 10,
      ),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF203330)
            : AppColors.lightBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.04)
              : Colors.black.withOpacity(0.04),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 31,
            height: 31,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(
              icon,
              color: color,
              size: 17,
            ),
          ),

          const SizedBox(width: 8),

          Expanded(
            child: Column(
              mainAxisAlignment:
                  MainAxisAlignment.center,
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkSubText
                        : AppColors.lightSubText,
                    fontSize: 8,
                  ),
                ),

                const SizedBox(height: 2),

                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkText
                        : AppColors.lightText,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================
// NOTE
// =====================================================

class _ExpenseNote extends StatelessWidget {
  final String note;
  final bool isDark;

  const _ExpenseNote({
    required this.note,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: 13,
        vertical: 11,
      ),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF142320)
            : AppColors.lightBackground,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.notes_rounded,
            color: isDark
                ? AppColors.darkSubText
                : AppColors.lightSubText,
            size: 18,
          ),

          const SizedBox(width: 9),

          Expanded(
            child: Text(
              note,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkSubText
                    : AppColors.lightSubText,
                fontSize: 10,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================
// ALPHA INSIGHT
// =====================================================

class _ExpenseInsight extends StatelessWidget {
  final ExpenseModel expense;
  final bool isDark;

  const _ExpenseInsight({
    required this.expense,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final String insight =
        expense.aiInsight?.trim().isNotEmpty == true
            ? expense.aiInsight!.trim()
            : _defaultInsight(expense);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: 14,
        vertical: 12,
      ),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkSecondary
                .withOpacity(0.09)
            : AppColors.lightSecondary
                .withOpacity(0.09),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: const Color(0xFF34D399)
              .withOpacity(0.10),
        ),
      ),
      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Container(
            width: 35,
            height: 35,
            decoration: BoxDecoration(
              color: const Color(0xFF34D399)
                  .withOpacity(0.13),
              borderRadius: BorderRadius.circular(11),
            ),
            child: const Icon(
              Icons.auto_awesome_rounded,
              color: Color(0xFF34D399),
              size: 18,
            ),
          ),

          const SizedBox(width: 10),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  'Alpha Insight',
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color:
                        const Color(0xFF34D399),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  insight,
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkText
                        : AppColors.lightText,
                    fontSize: 10,
                    height: 1.5,
                  ),
                ),

                if (expense.confidence != null) ...[
                  const SizedBox(height: 7),

                  Text(
                    'Recognition confidence: '
                    '${_confidencePercentage(expense.confidence!)}%',
                    style: GoogleFonts
                        .ibmPlexSansArabic(
                      color: isDark
                          ? AppColors.darkSubText
                          : AppColors.lightSubText,
                      fontSize: 9,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================
// CATEGORY HELPERS
// =====================================================

IconData _categoryIcon(
  String category,
) {
  switch (category) {
    case 'Food':
      return Icons.restaurant_outlined;

    case 'Shopping':
      return Icons.shopping_bag_outlined;

    case 'Transport':
      return Icons.directions_car_outlined;

    case 'Bills':
      return Icons.receipt_long_outlined;

    case 'Health':
      return Icons.favorite_outline_rounded;

    case 'Education':
      return Icons.school_outlined;

    case 'Entertainment':
      return Icons.movie_outlined;

    case 'Travel':
      return Icons.flight_takeoff_outlined;

    case 'Investment':
      return Icons.trending_up_rounded;

    case 'Other':
    default:
      return Icons.payments_outlined;
  }
}

Color _categoryColor(
  String category,
) {
  switch (category) {
    case 'Food':
      return const Color(0xFF34D399);

    case 'Shopping':
      return const Color(0xFF9B7EDE);

    case 'Transport':
      return const Color(0xFFF4C95D);

    case 'Bills':
      return const Color(0xFF4F9CF9);

    case 'Health':
      return const Color(0xFFFF6B6B);

    case 'Education':
      return const Color(0xFF14B8A6);

    case 'Entertainment':
      return const Color(0xFFEC76A8);

    case 'Travel':
      return const Color(0xFF6E7FE8);

    case 'Investment':
      return const Color(0xFFD4A72C);

    case 'Other':
    default:
      return const Color(0xFF8A9A96);
  }
}

// =====================================================
// SOURCE HELPERS
// =====================================================

String _sourceLabel(
  ExpenseSource source,
) {
  switch (source) {
    case ExpenseSource.manual:
      return 'Manual';

    case ExpenseSource.receipt:
      return 'Receipt';

    case ExpenseSource.voice:
      return 'Voice';

    case ExpenseSource.bank:
      return 'Bank';
  }
}

IconData _sourceIcon(
  ExpenseSource source,
) {
  switch (source) {
    case ExpenseSource.manual:
      return Icons.edit_outlined;

    case ExpenseSource.receipt:
      return Icons.document_scanner_outlined;

    case ExpenseSource.voice:
      return Icons.mic_none_rounded;

    case ExpenseSource.bank:
      return Icons.account_balance_outlined;
  }
}

Color _sourceColor(
  ExpenseSource source,
) {
  switch (source) {
    case ExpenseSource.manual:
      return const Color(0xFFF4C95D);

    case ExpenseSource.receipt:
      return const Color(0xFF34D399);

    case ExpenseSource.voice:
      return const Color(0xFF9B7EDE);

    case ExpenseSource.bank:
      return const Color(0xFF4F9CF9);
  }
}

// =====================================================
// COVERAGE
// =====================================================

String _coverageLabel(
  ExpenseCoveragePeriod period,
) {
  switch (period) {
    case ExpenseCoveragePeriod.oneDay:
      return '1 Day';

    case ExpenseCoveragePeriod.threeDays:
      return '3 Days';

    case ExpenseCoveragePeriod.oneWeek:
      return '1 Week';

    case ExpenseCoveragePeriod.twoWeeks:
      return '2 Weeks';

    case ExpenseCoveragePeriod.monthly:
      return 'Monthly';
  }
}

// =====================================================
// DEFAULT INSIGHT
// =====================================================

String _defaultInsight(
  ExpenseModel expense,
) {
  if (expense.expenseType ==
      ExpenseType.want) {
    return 'This expense is classified as a secondary want. Review its effect on your financial goals.';
  }

  if (expense.movementType ==
      ExpenseMovementType.recurring) {
    return 'This recurring expense covers ${_coverageLabel(expense.coveragePeriod)} and will be included in your planned commitments.';
  }

  if (expense.amount >= 100) {
    return 'This is a relatively high expense. Review its effect on your remaining monthly balance.';
  }

  if (expense.source ==
      ExpenseSource.bank) {
    return 'This expense was imported automatically from your banking activity.';
  }

  return 'This expense will be included in your actual spending analysis.';
}

int _confidencePercentage(
  double confidence,
) {
  if (confidence <= 1) {
    return (confidence * 100)
        .clamp(0, 100)
        .round();
  }

  return confidence.clamp(0, 100).round();
}