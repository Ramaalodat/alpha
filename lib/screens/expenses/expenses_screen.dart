import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/models/expense_model.dart';
import 'package:alpha_app/providers/expense_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/expenses/new_expense_screen.dart';
import 'package:alpha_app/widgets/expenses/expense_card.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ExpensesScreen extends StatelessWidget {
  const ExpensesScreen({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final expenseProvider =
        context.watch<ExpenseProvider>();

    final themeProvider =
        context.watch<Themeprovider>();

    final bool isDark =
        themeProvider.isDark;

    final double screenW =
        Device.width(context);

    final double screenH =
        Device.height(context);

    final expenses =
        expenseProvider.expenses;

    return Scaffold(
      backgroundColor: isDark
          ? AppColors.darkBackground
          : AppColors.lightBackground,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: screenW * 0.055,
          ),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: screenH * 0.025,
              ),

              _Header(
                isDark: isDark,
                screenW: screenW,
                expenseCount:
                    expenses.length,
                onAddPressed: () {
                  _openNewExpenseScreen(
                    context,
                  );
                },
              ),

              SizedBox(
                height: screenH * 0.025,
              ),

              Expanded(
                child: expenses.isEmpty
                    ? _EmptyExpensesView(
                        isDark: isDark,
                        screenW: screenW,
                        onAddPressed: () {
                          _openNewExpenseScreen(
                            context,
                          );
                        },
                      )
                    : ListView(
                        physics:
                            const BouncingScrollPhysics(),
                        padding: EdgeInsets.only(
                          bottom:
                              screenH * 0.14,
                        ),
                        children: [
                          _SpendingOverviewCard(
                            provider:
                                expenseProvider,
                            isDark: isDark,
                          ),

                          SizedBox(
                            height:
                                screenH * 0.018,
                          ),

                          _MonthlyComparisonCard(
                            currentMonthTotal:
                                expenseProvider
                                    .currentMonthTotal,
                            previousMonthTotal:
                                expenseProvider
                                    .previousMonthTotal,
                            isDark: isDark,
                          ),

                          SizedBox(
                            height:
                                screenH * 0.018,
                          ),

                          _TopCategoryCard(
                            category:
                                expenseProvider
                                    .topCategory,
                            amount:
                                expenseProvider
                                    .topCategoryAmount,
                            isDark: isDark,
                          ),

                          SizedBox(
                            height:
                                screenH * 0.018,
                          ),

                          _AlphaInsightCard(
                            insight:
                                expenseProvider
                                    .spendingInsight,
                            isDark: isDark,
                          ),

                          SizedBox(
                            height:
                                screenH * 0.025,
                          ),

                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  "Recent Expenses",
                                  style: GoogleFonts
                                      .ibmPlexSansArabic(
                                    color: isDark
                                        ? AppColors
                                            .darkText
                                        : AppColors
                                            .lightText,
                                    fontSize:
                                        screenW *
                                            0.048,
                                    fontWeight:
                                        FontWeight
                                            .bold,
                                  ),
                                ),
                              ),

                              Text(
                                "${expenses.length} total",
                                style: GoogleFonts
                                    .ibmPlexSansArabic(
                                  color: isDark
                                      ? AppColors
                                          .darkSubText
                                      : AppColors
                                          .lightSubText,
                                  fontSize:
                                      screenW *
                                          0.031,
                                ),
                              ),
                            ],
                          ),

                          SizedBox(
                            height:
                                screenH * 0.014,
                          ),

                          ...expenses.map(
                            (expense) =>
                                ExpenseCard(
                              expense:
                                  expense,
                              onDelete: () {
                                _showDeleteExpenseDialog(
                                  context,
                                  expense,
                                );
                              },
                            ),
                          ),

                          _AddExpenseButton(
                            isDark: isDark,
                            onTap: () {
                              _openNewExpenseScreen(
                                context,
                              );
                            },
                          ),
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openNewExpenseScreen(
    BuildContext context,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) =>
            const NewExpenseScreen(),
      ),
    );
  }
}

// =====================================================
// HEADER
// =====================================================

class _Header extends StatelessWidget {
  final bool isDark;
  final double screenW;
  final int expenseCount;
  final VoidCallback onAddPressed;

  const _Header({
    required this.isDark,
    required this.screenW,
    required this.expenseCount,
    required this.onAddPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment:
          CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Text(
                "Expenses",
                style: GoogleFonts
                    .ibmPlexSansArabic(
                  color: isDark
                      ? AppColors.darkText
                      : AppColors.lightText,
                  fontSize: screenW * 0.07,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 3),

              Text(
                "$expenseCount ${expenseCount == 1 ? "expense" : "expenses"} recorded",
                style: GoogleFonts
                    .ibmPlexSansArabic(
                  color: isDark
                      ? AppColors.darkSubText
                      : AppColors.lightSubText,
                  fontSize: screenW * 0.034,
                ),
              ),
            ],
          ),
        ),

        InkWell(
          onTap: onAddPressed,
          borderRadius:
              BorderRadius.circular(13),
          child: Container(
            width: screenW * 0.12,
            height: screenW * 0.12,
            decoration: BoxDecoration(
              color: isDark
                  ? const Color(0xFF203330)
                  : AppColors.lightSecondary
                      .withOpacity(0.12),
              borderRadius:
                  BorderRadius.circular(13),
            ),
            child: Icon(
              Icons.add_rounded,
              color: isDark
                  ? AppColors.darkSubText
                  : AppColors.lightPrimary,
              size: screenW * 0.075,
            ),
          ),
        ),
      ],
    );
  }
}

// =====================================================
// SPENDING OVERVIEW
// =====================================================

class _SpendingOverviewCard
    extends StatelessWidget {
  final ExpenseProvider provider;
  final bool isDark;

  const _SpendingOverviewCard({
    required this.provider,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final categoryTotals =
        provider.currentMonthCategoryTotals;

    final total =
        provider.currentMonthTotal;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF172624)
            : Colors.white,
        borderRadius:
            BorderRadius.circular(24),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.04)
              : Colors.black.withOpacity(0.05),
        ),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color:
                      Colors.black.withOpacity(0.04),
                  blurRadius: 16,
                  offset: const Offset(0, 7),
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Text(
            "This Month",
            style:
                GoogleFonts.ibmPlexSansArabic(
              color: isDark
                  ? AppColors.darkSubText
                  : AppColors.lightSubText,
              fontSize: 12,
            ),
          ),

          const SizedBox(height: 5),

          Text(
            "${total.toStringAsFixed(2)} JOD",
            style:
                GoogleFonts.ibmPlexSansArabic(
              color: isDark
                  ? AppColors.darkText
                  : AppColors.lightText,
              fontSize: 25,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 20),

          SizedBox(
            height: 220,
            child: Row(
              children: [
                Expanded(
                  child: _SpendingDonutChart(
                    total: total,
                    categoryTotals:
                        categoryTotals,
                    isDark: isDark,
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: _CategoryLegend(
                    categoryTotals:
                        categoryTotals,
                    total: total,
                    isDark: isDark,
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
// DONUT CHART
// =====================================================

class _SpendingDonutChart
    extends StatelessWidget {
  final double total;
  final Map<String, double>
      categoryTotals;
  final bool isDark;

  const _SpendingDonutChart({
    required this.total,
    required this.categoryTotals,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    if (categoryTotals.isEmpty ||
        total <= 0) {
      return Center(
        child: Text(
          "No data",
          style:
              GoogleFonts.ibmPlexSansArabic(
            color: isDark
                ? AppColors.darkSubText
                : AppColors.lightSubText,
          ),
        ),
      );
    }

    final entries =
        categoryTotals.entries.toList();

    return Stack(
      alignment: Alignment.center,
      children: [
        PieChart(
          PieChartData(
            centerSpaceRadius: 52,
            sectionsSpace: 3,
            startDegreeOffset: -90,
            borderData:
                FlBorderData(show: false),
            pieTouchData: PieTouchData(
              enabled: true,
            ),
            sections:
                entries.map((entry) {
              final percentage =
                  total == 0
                      ? 0
                      : entry.value /
                          total *
                          100;

              return PieChartSectionData(
                value: entry.value,
                color: _expenseCategoryColor(
                  entry.key,
                ),
                radius: 27,
                showTitle:
                    percentage >= 10,
                title:
                    "${percentage.round()}%",
                titleStyle:
                    const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight:
                      FontWeight.bold,
                ),
              );
            }).toList(),
          ),
        ),

        Column(
          mainAxisSize:
              MainAxisSize.min,
          children: [
            Text(
              "Total",
              style: GoogleFonts
                  .ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkSubText
                    : AppColors.lightSubText,
                fontSize: 10,
              ),
            ),

            Text(
              total.toStringAsFixed(0),
              style: GoogleFonts
                  .ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkText
                    : AppColors.lightText,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),

            Text(
              "JOD",
              style: GoogleFonts
                  .ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkSubText
                    : AppColors.lightSubText,
                fontSize: 9,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// =====================================================
// CATEGORY LEGEND
// =====================================================

class _CategoryLegend extends StatelessWidget {
  final Map<String, double>
      categoryTotals;
  final double total;
  final bool isDark;

  const _CategoryLegend({
    required this.categoryTotals,
    required this.total,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final entries =
        categoryTotals.entries.toList()
          ..sort(
            (a, b) =>
                b.value.compareTo(a.value),
          );

    final displayedEntries =
        entries.take(5);

    return ListView(
      shrinkWrap: true,
      physics:
          const NeverScrollableScrollPhysics(),
      children:
          displayedEntries.map((entry) {
        final percentage =
            total == 0
                ? 0
                : entry.value / total * 100;

        return Padding(
          padding:
              const EdgeInsets.only(
            bottom: 12,
          ),
          child: Row(
            children: [
              Container(
                width: 9,
                height: 9,
                decoration: BoxDecoration(
                  color:
                      _expenseCategoryColor(
                    entry.key,
                  ),
                  shape: BoxShape.circle,
                ),
              ),

              const SizedBox(width: 8),

              Expanded(
                child: Text(
                  entry.key,
                  maxLines: 1,
                  overflow:
                      TextOverflow.ellipsis,
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkText
                        : AppColors.lightText,
                    fontSize: 10,
                  ),
                ),
              ),

              Text(
                "${percentage.round()}%",
                style: GoogleFonts
                    .ibmPlexSansArabic(
                  color: isDark
                      ? AppColors.darkSubText
                      : AppColors.lightSubText,
                  fontSize: 9,
                  fontWeight:
                      FontWeight.w600,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

// =====================================================
// MONTHLY COMPARISON
// =====================================================

class _MonthlyComparisonCard
    extends StatelessWidget {
  final double currentMonthTotal;
  final double previousMonthTotal;
  final bool isDark;

  const _MonthlyComparisonCard({
    required this.currentMonthTotal,
    required this.previousMonthTotal,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final maxValue = [
      currentMonthTotal,
      previousMonthTotal,
      1.0,
    ].reduce(
      (a, b) => a > b ? a : b,
    );

    final difference =
        currentMonthTotal -
            previousMonthTotal;

    final bool increased =
        difference > 0;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF172624)
            : Colors.white,
        borderRadius:
            BorderRadius.circular(22),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.04)
              : Colors.black.withOpacity(0.05),
        ),
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  "Monthly Comparison",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkText
                        : AppColors.lightText,
                    fontSize: 15,
                    fontWeight:
                        FontWeight.bold,
                  ),
                ),
              ),

              Container(
                padding:
                    const EdgeInsets.symmetric(
                  horizontal: 9,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: (increased
                          ? const Color(
                              0xFFFF6B6B,
                            )
                          : const Color(
                              0xFF34D399,
                            ))
                      .withOpacity(0.12),
                  borderRadius:
                      BorderRadius.circular(8),
                ),
                child: Text(
                  difference == 0
                      ? "No change"
                      : "${increased ? "+" : ""}${difference.toStringAsFixed(0)} JOD",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: increased
                        ? const Color(
                            0xFFFF6B6B,
                          )
                        : const Color(
                            0xFF34D399,
                          ),
                    fontSize: 10,
                    fontWeight:
                        FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          SizedBox(
            height: 150,
            child: BarChart(
              BarChartData(
                maxY: maxValue * 1.25,
                alignment:
                    BarChartAlignment.spaceAround,
                borderData:
                    FlBorderData(show: false),
                gridData:
                    const FlGridData(
                  show: false,
                ),
                titlesData:
                    FlTitlesData(
                  topTitles:
                      const AxisTitles(
                    sideTitles:
                        SideTitles(
                      showTitles: false,
                    ),
                  ),
                  rightTitles:
                      const AxisTitles(
                    sideTitles:
                        SideTitles(
                      showTitles: false,
                    ),
                  ),
                  leftTitles:
                      const AxisTitles(
                    sideTitles:
                        SideTitles(
                      showTitles: false,
                    ),
                  ),
                  bottomTitles:
                      AxisTitles(
                    sideTitles:
                        SideTitles(
                      showTitles: true,
                      getTitlesWidget:
                          (
                        value,
                        meta,
                      ) {
                        return Padding(
                          padding:
                              const EdgeInsets
                                  .only(
                            top: 8,
                          ),
                          child: Text(
                            value == 0
                                ? "Previous"
                                : "Current",
                            style: GoogleFonts
                                .ibmPlexSansArabic(
                              color: isDark
                                  ? AppColors
                                      .darkSubText
                                  : AppColors
                                      .lightSubText,
                              fontSize: 9,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
                barGroups: [
                  BarChartGroupData(
                    x: 0,
                    barRods: [
                      BarChartRodData(
                        toY:
                            previousMonthTotal,
                        width: 31,
                        borderRadius:
                            BorderRadius.circular(
                          8,
                        ),
                        color:
                            const Color(
                          0xFF14B8A6,
                        ),
                      ),
                    ],
                  ),
                  BarChartGroupData(
                    x: 1,
                    barRods: [
                      BarChartRodData(
                        toY:
                            currentMonthTotal,
                        width: 31,
                        borderRadius:
                            BorderRadius.circular(
                          8,
                        ),
                        color:
                            const Color(
                          0xFFF4C95D,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 5),

          Row(
            children: [
              Expanded(
                child: _ComparisonValue(
                  title:
                      "Previous month",
                  amount:
                      previousMonthTotal,
                  color:
                      const Color(
                    0xFF14B8A6,
                  ),
                  isDark: isDark,
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: _ComparisonValue(
                  title:
                      "Current month",
                  amount:
                      currentMonthTotal,
                  color:
                      const Color(
                    0xFFF4C95D,
                  ),
                  isDark: isDark,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ComparisonValue
    extends StatelessWidget {
  final String title;
  final double amount;
  final Color color;
  final bool isDark;

  const _ComparisonValue({
    required this.title,
    required this.amount,
    required this.color,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding:
          const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color:
            color.withOpacity(0.08),
        borderRadius:
            BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Text(
            title,
            maxLines: 1,
            overflow:
                TextOverflow.ellipsis,
            style:
                GoogleFonts.ibmPlexSansArabic(
              color: isDark
                  ? AppColors.darkSubText
                  : AppColors.lightSubText,
              fontSize: 9,
            ),
          ),

          const SizedBox(height: 4),

          Text(
            "${amount.toStringAsFixed(0)} JOD",
            style:
                GoogleFonts.ibmPlexSansArabic(
              color: color,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================
// TOP CATEGORY
// =====================================================

class _TopCategoryCard
    extends StatelessWidget {
  final String category;
  final double amount;
  final bool isDark;

  const _TopCategoryCard({
    required this.category,
    required this.amount,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final safeCategory =
        category.isEmpty
            ? "No category"
            : category;

    final color =
        _expenseCategoryColor(
      safeCategory,
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF172624)
            : Colors.white,
        borderRadius:
            BorderRadius.circular(21),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.04)
              : Colors.black.withOpacity(0.05),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color:
                  color.withOpacity(0.13),
              borderRadius:
                  BorderRadius.circular(16),
            ),
            child: Icon(
              _expenseCategoryIcon(
                safeCategory,
              ),
              color: color,
              size: 25,
            ),
          ),

          const SizedBox(width: 13),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  "Top Spending Category",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkSubText
                        : AppColors.lightSubText,
                    fontSize: 10,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  safeCategory,
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkText
                        : AppColors.lightText,
                    fontSize: 16,
                    fontWeight:
                        FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

          Text(
            "${amount.toStringAsFixed(2)} JOD",
            style:
                GoogleFonts.ibmPlexSansArabic(
              color: color,
              fontSize: 15,
              fontWeight: FontWeight.bold,
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

class _AlphaInsightCard
    extends StatelessWidget {
  final String insight;
  final bool isDark;

  const _AlphaInsightCard({
    required this.insight,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkSecondary
                .withOpacity(0.10)
            : AppColors.lightSecondary
                .withOpacity(0.10),
        borderRadius:
            BorderRadius.circular(21),
        border: Border.all(
          color: const Color(
            0xFF34D399,
          ).withOpacity(0.14),
        ),
      ),
      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Container(
            width: 43,
            height: 43,
            decoration: BoxDecoration(
              color:
                  const Color(0xFF34D399)
                      .withOpacity(0.13),
              borderRadius:
                  BorderRadius.circular(13),
            ),
            child: const Icon(
              Icons.auto_awesome_rounded,
              color: Color(0xFF34D399),
              size: 22,
            ),
          ),

          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  "Alpha Insight",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color:
                        const Color(0xFF34D399),
                    fontSize: 13,
                    fontWeight:
                        FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 5),

                Text(
                  insight,
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkText
                        : AppColors.lightText,
                    fontSize: 11,
                    height: 1.5,
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
// EMPTY STATE
// =====================================================

class _EmptyExpensesView
    extends StatelessWidget {
  final bool isDark;
  final double screenW;
  final VoidCallback onAddPressed;

  const _EmptyExpensesView({
    required this.isDark,
    required this.screenW,
    required this.onAddPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding:
            const EdgeInsets.symmetric(
          horizontal: 25,
        ),
        child: Column(
          mainAxisSize:
              MainAxisSize.min,
          children: [
            Container(
              width: screenW * 0.28,
              height: screenW * 0.28,
              decoration: BoxDecoration(
                color: const Color(
                  0xFF34D399,
                ).withOpacity(0.10),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons
                    .account_balance_wallet_outlined,
                color:
                    const Color(0xFF34D399),
                size: screenW * 0.13,
              ),
            ),

            const SizedBox(height: 20),

            Text(
              "No expenses yet",
              textAlign:
                  TextAlign.center,
              style: GoogleFonts
                  .ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkText
                    : AppColors.lightText,
                fontSize:
                    screenW * 0.052,
                fontWeight:
                    FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              "Start recording your expenses to unlock spending analysis and personalized Alpha insights.",
              textAlign:
                  TextAlign.center,
              style: GoogleFonts
                  .ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkSubText
                    : AppColors.lightSubText,
                fontSize:
                    screenW * 0.034,
                height: 1.6,
              ),
            ),

            const SizedBox(height: 22),

            ElevatedButton.icon(
              onPressed:
                  onAddPressed,
              icon: const Icon(
                Icons.add_rounded,
              ),
              label: Text(
                "Add your first expense",
                style: GoogleFonts
                    .ibmPlexSansArabic(
                  fontWeight:
                      FontWeight.bold,
                ),
              ),
              style:
                  ElevatedButton.styleFrom(
                backgroundColor:
                    const Color(
                  0xFF34D399,
                ),
                foregroundColor:
                    const Color(
                  0xFF09231E,
                ),
                elevation: 0,
                padding:
                    const EdgeInsets
                        .symmetric(
                  horizontal: 20,
                  vertical: 13,
                ),
                shape:
                    RoundedRectangleBorder(
                  borderRadius:
                      BorderRadius.circular(
                    14,
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

// =====================================================
// ADD BUTTON
// =====================================================

class _AddExpenseButton
    extends StatelessWidget {
  final bool isDark;
  final VoidCallback onTap;

  const _AddExpenseButton({
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius:
          BorderRadius.circular(22),
      child: CustomPaint(
        painter:
            _DashedBorderPainter(
          color: isDark
              ? const Color(0xFF29433E)
              : AppColors.lightSecondary
                  .withOpacity(0.40),
        ),
        child: SizedBox(
          width: double.infinity,
          height: 58,
          child: Center(
            child: Text(
              "+ Add a new expense",
              style: GoogleFonts
                  .ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkSubText
                    : AppColors.lightSubText,
                fontSize: 13,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _DashedBorderPainter
    extends CustomPainter {
  final Color color;

  const _DashedBorderPainter({
    required this.color,
  });

  @override
  void paint(
    Canvas canvas,
    Size size,
  ) {
    final paint = Paint()
      ..color = color
      ..style =
          PaintingStyle.stroke
      ..strokeWidth = 1;

    const dashWidth = 5.0;
    const dashSpace = 4.0;

    final path = Path()
      ..addRRect(
        RRect.fromRectAndRadius(
          Offset.zero & size,
          const Radius.circular(22),
        ),
      );

    for (final metric
        in path.computeMetrics()) {
      double distance = 0;

      while (
          distance < metric.length) {
        final end =
            (distance + dashWidth)
                .clamp(
          0.0,
          metric.length,
        );

        canvas.drawPath(
          metric.extractPath(
            distance,
            end,
          ),
          paint,
        );

        distance +=
            dashWidth + dashSpace;
      }
    }
  }

  @override
  bool shouldRepaint(
    covariant _DashedBorderPainter
        oldDelegate,
  ) {
    return oldDelegate.color != color;
  }
}

// =====================================================
// DELETE DIALOG
// =====================================================

void _showDeleteExpenseDialog(
  BuildContext context,
  ExpenseModel expense,
) {
  final themeProvider =
      context.read<Themeprovider>();

  showDialog<void>(
    context: context,
    builder: (dialogContext) {
      return AlertDialog(
        backgroundColor:
            themeProvider.isDark
                ? const Color(
                    0xFF172624,
                  )
                : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius:
              BorderRadius.circular(22),
        ),
        title: Text(
          "Delete Expense",
          style: GoogleFonts
              .ibmPlexSansArabic(
            color: themeProvider.isDark
                ? AppColors.darkText
                : AppColors.lightText,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Text(
          "Are you sure you want to delete \"${expense.title}\"?",
          style: GoogleFonts
              .ibmPlexSansArabic(
            color: themeProvider.isDark
                ? AppColors.darkSubText
                : AppColors.lightSubText,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(
                dialogContext,
              );
            },
            child: const Text(
              "Cancel",
            ),
          ),

          TextButton(
            onPressed: () {
              context
                  .read<ExpenseProvider>()
                  .deleteExpense(
                    expense.id,
                  );

              Navigator.pop(
                dialogContext,
              );

              ScaffoldMessenger.of(
                context,
              ).showSnackBar(
                const SnackBar(
                  content: Text(
                    "Expense deleted successfully",
                  ),
                  behavior:
                      SnackBarBehavior
                          .floating,
                ),
              );
            },
            child: const Text(
              "Delete",
              style: TextStyle(
                color:
                    Color(0xFFFF6B6B),
                fontWeight:
                    FontWeight.bold,
              ),
            ),
          ),
        ],
      );
    },
  );
}

// =====================================================
// CATEGORY HELPERS
// =====================================================

IconData _expenseCategoryIcon(
  String category,
) {
  switch (category) {
    case "Food":
      return Icons.restaurant_outlined;

    case "Shopping":
      return Icons.shopping_bag_outlined;

    case "Transport":
      return Icons.directions_car_outlined;

    case "Bills":
      return Icons.receipt_long_outlined;

    case "Health":
      return Icons.favorite_outline;

    case "Education":
      return Icons.school_outlined;

    case "Entertainment":
      return Icons.movie_outlined;

    case "Travel":
      return Icons.flight_takeoff_outlined;

    case "Investment":
      return Icons.trending_up_rounded;

    default:
      return Icons.payments_outlined;
  }
}

Color _expenseCategoryColor(
  String category,
) {
  switch (category) {
    case "Food":
      return const Color(0xFF34D399);

    case "Shopping":
      return const Color(0xFF9B7EDE);

    case "Transport":
      return const Color(0xFFF4C95D);

    case "Bills":
      return const Color(0xFF4F9CF9);

    case "Health":
      return const Color(0xFFFF6B6B);

    case "Education":
      return const Color(0xFF14B8A6);

    case "Entertainment":
      return const Color(0xFFEC76A8);

    case "Travel":
      return const Color(0xFF6E7FE8);

    case "Investment":
      return const Color(0xFFD4A72C);

    default:
      return const Color(0xFF8A9A96);
  }
}