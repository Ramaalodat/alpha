import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/models/home_model.dart';
import 'package:alpha_app/providers/home_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/main/dashboard_screen.dart';
import 'package:alpha_app/screens/ai_assistant/chat_screen.dart';
import 'package:alpha_app/screens/challenges/chanllenges_screen.dart';
import 'package:alpha_app/screens/main/add_expense_screen.dart';
import 'package:alpha_app/screens/receipts/receipt_input_screen.dart';
import 'package:alpha_app/screens/main/notifications_screen.dart';
import 'package:alpha_app/screens/main/goals_screen.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _didLoadData = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (!_didLoadData) {
      _didLoadData = true;

      WidgetsBinding.instance.addPostFrameCallback(
        (_) {
          if (!mounted) return;

          context.read<HomeProvider>().loadHomeData();
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final homeProvider = context.watch<HomeProvider>();

    final themeProvider = context.watch<Themeprovider>();

    final isDark = themeProvider.isDark;

    final homeData = homeProvider.homeData;

    final screenWidth = MediaQuery.sizeOf(context).width;

    return Scaffold(
      backgroundColor:
          isDark ? const Color(0xFF131A19) : AppColors.lightBackground,
      body: SafeArea(
        child: _buildBody(
          context: context,
          homeProvider: homeProvider,
          homeData: homeData,
          isDark: isDark,
          screenWidth: screenWidth,
        ),
      ),
    );
  }

  Widget _buildBody({
    required BuildContext context,
    required HomeProvider homeProvider,
    required HomeModel? homeData,
    required bool isDark,
    required double screenWidth,
  }) {
    if (homeProvider.isLoading && homeData == null) {
      return Center(
        child: CircularProgressIndicator(
          color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
        ),
      );
    }

    if (homeProvider.hasError && homeData == null) {
      return _HomeErrorView(
        message: homeProvider.errorMessage ?? "Something went wrong",
        isDark: isDark,
        onRetry: () {
          context.read<HomeProvider>().loadHomeData();
        },
      );
    }

    if (homeData == null) {
      return const SizedBox.shrink();
    }

    return RefreshIndicator(
      color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
      onRefresh: () async {
        await context.read<HomeProvider>().loadHomeData();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(
          parent: BouncingScrollPhysics(),
        ),
        padding: EdgeInsets.fromLTRB(
          screenWidth * 0.055,
          20,
          screenWidth * 0.055,
          125,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _HomeHeader(
              userName: homeData.userName,
              isDark: isDark,
              onNotificationTap: () {},
            ),
            const SizedBox(height: 22),
            _FinancialScoreCard(
              score: homeData.financialScore,
              isDark: isDark,
            ),
            const SizedBox(height: 18),
            _FinancialSummarySection(
              income: homeData.income,
              expenses: homeData.expenses,
              savings: homeData.savings,
              isDark: isDark,
            ),
            const SizedBox(height: 22),
            _TodayInsightCard(
              insight: homeData.todayInsight,
              isDark: isDark,
              onViewAdvice: () {},
            ),
            if (homeData.goal != null) ...[
              const SizedBox(height: 22),
              _SectionTitle(
                title: "Goal Progress",
                isDark: isDark,
                actionText: "View All",
                onActionTap: () {},
              ),
              const SizedBox(height: 12),
              _GoalProgressCard(
                goal: homeData.goal!,
                isDark: isDark,
              ),
            ],
            if (homeData.challenge != null) ...[
              const SizedBox(height: 22),
              Text(
                "Active Challenge",
                style: GoogleFonts.ibmPlexSansArabic(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              _ChallengeCard(
                challenge: homeData.challenge!,
                isDark: isDark,
              ),
            ],
            const SizedBox(height: 22),
            _QuickActionsGrid(
              isDark: isDark,
              onAddExpense: () {
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const AddExpenseScreen()));
              },
              onAskBasira: () {
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const ChatScreen()));
              },
              onGoalsTap: () {
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const GoalsScreen()));
              },
              onScanReceipt: () {
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const ReceiptInputScreen()));
              },
              onChallengesTap: () {
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const ChallengesScreen()));
              },
              onAnalyticsTap: () {
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const DashboardScreen()));
              },
            ),
            const SizedBox(height: 22),
            Row(
              children: [
                Expanded(
                  child: Container(
                    height: 80,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1A2622) : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.05)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Top Gainers",
                          style: GoogleFonts.ibmPlexSansArabic(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "Stock performance",
                          style: GoogleFonts.ibmPlexSansArabic(
                            color: AppColors.darkSubText,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    height: 80,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1A2622) : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.05)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Upcoming Bills",
                          style: GoogleFonts.ibmPlexSansArabic(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "2 due this week",
                          style: GoogleFonts.ibmPlexSansArabic(
                            color: AppColors.darkSubText,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// =====================================================
// HEADER
// =====================================================

class _HomeHeader extends StatelessWidget {
  final String userName;
  final bool isDark;
  final VoidCallback onNotificationTap;

  const _HomeHeader({
    required this.userName,
    required this.isDark,
    required this.onNotificationTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E2320) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFF4C95D).withOpacity(0.4),
        ),
        boxShadow: isDark
            ? [
                BoxShadow(
                  color: const Color(0xFFF4C95D).withOpacity(0.05),
                  blurRadius: 20,
                  spreadRadius: 2,
                )
              ]
            : [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF34D399),
              border: Border.all(color: const Color(0xFFF4C95D), width: 2),
            ),
            child: Text(
              userName.isNotEmpty ? userName[0].toUpperCase() : "U",
              style: GoogleFonts.ibmPlexSansArabic(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  userName,
                  maxLines: 1,
                  style: GoogleFonts.ibmPlexSansArabic(
                    color: isDark ? Colors.white : AppColors.lightText,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  "Level 24 | 14,850 XP",
                  style: GoogleFonts.ibmPlexSansArabic(
                    color:
                        isDark ? AppColors.darkSubText : AppColors.lightSubText,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          Row(
            children: [
              Stack(
                clipBehavior: Clip.none,
                alignment: Alignment.center,
                children: [
                  const Icon(
                    Icons.emoji_events_rounded,
                    color: Color(0xFFFFD700),
                    size: 38,
                  ),
                  Positioned(
                    top: -4,
                    right: -4,
                    child: const Icon(Icons.auto_awesome,
                        color: Color(0xFFF4C95D), size: 14),
                  ),
                  Positioned(
                    bottom: -4,
                    left: -4,
                    child: const Icon(Icons.auto_awesome,
                        color: Color(0xFF34D399), size: 12),
                  ),
                ],
              ),
              const SizedBox(width: 14),
              Container(
                width: 1,
                height: 30,
                color: isDark
                    ? Colors.white.withOpacity(0.1)
                    : Colors.black.withOpacity(0.1),
              ),
              const SizedBox(width: 14),
              GestureDetector(
                onTap: () {
                  Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const NotificationsScreen()));
                },
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E2320) : Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: const Color(0xFFF4C95D).withOpacity(0.4)),
                        boxShadow: isDark
                            ? [
                                BoxShadow(
                                  color:
                                      const Color(0xFFF4C95D).withOpacity(0.1),
                                  blurRadius: 8,
                                  spreadRadius: 1,
                                )
                              ]
                            : [],
                      ),
                      child: const Icon(
                        Icons.notifications_rounded,
                        color: Color(0xFFF4C95D),
                        size: 22,
                      ),
                    ),
                    Positioned(
                      top: 6,
                      right: 6,
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444), // Bright red
                          shape: BoxShape.circle,
                          border: Border.all(
                            color:
                                isDark ? const Color(0xFF1E2320) : Colors.white,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// =====================================================
// FINANCIAL SCORE
// =====================================================

class _FinancialScoreCard extends StatelessWidget {
  final int score;
  final bool isDark;

  const _FinancialScoreCard({
    required this.score,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final safeScore = score.clamp(0, 100);
    final scoreProgress = safeScore / 100;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF131A19) : Colors.white,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.03)
              : Colors.black.withOpacity(0.04),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "FINANCIAL SCORE",
            style: GoogleFonts.ibmPlexSansArabic(
              color: isDark ? Colors.white : AppColors.lightText,
              fontSize: 14,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 20),
          Center(
            child: CircularPercentIndicator(
              radius: 110,
              lineWidth: 18,
              percent: scoreProgress.clamp(0.0, 1.0),
              animation: true,
              animationDuration: 850,
              circularStrokeCap: CircularStrokeCap.round,
              arcType: ArcType.HALF,
              arcBackgroundColor:
                  isDark ? const Color(0xFF243A35) : const Color(0xFFE7F1ED),
              linearGradient: const LinearGradient(
                colors: [Color(0xFF34D399), Color(0xFFF4C95D)],
              ),
              center: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 30),
                  Text(
                    score.toString(),
                    style: GoogleFonts.ibmPlexSansArabic(
                      color: isDark ? Colors.white : AppColors.lightText,
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _scoreLevel(score),
                    style: GoogleFonts.ibmPlexSansArabic(
                      color: isDark
                          ? AppColors.darkSubText
                          : AppColors.lightSubText,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "Last Update: Today",
                    style: GoogleFonts.ibmPlexSansArabic(
                      color: isDark
                          ? AppColors.darkSubText
                          : AppColors.lightSubText,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    "+15 pts",
                    style: GoogleFonts.ibmPlexSansArabic(
                      color: const Color(0xFF34D399),
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _scoreMessage(int score) {
    if (score >= 80) {
      return "Your financial habits are looking great. Keep it up!";
    }

    if (score >= 60) {
      return "You're doing well, with some room for improvement.";
    }

    if (score >= 40) {
      return "Small changes can help improve your financial health.";
    }

    return "Start by tracking spending and building a simple saving plan.";
  }

  String _scoreLevel(int score) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";

    return "Needs Attention";
  }
}

// =====================================================
// SUMMARY
// =====================================================

class _FinancialSummarySection extends StatelessWidget {
  final double income;
  final double expenses;
  final double savings;
  final bool isDark;

  const _FinancialSummarySection({
    required this.income,
    required this.expenses,
    required this.savings,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _SummaryCard(
            title: "Income",
            amount: income,
            icon: Icons.payments_outlined,
            color: const Color(0xFF34D399),
            isDark: isDark,
            bottomText: "↑ +12%",
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _SummaryCard(
            title: "Expenses",
            amount: expenses,
            icon: Icons.credit_card_outlined,
            color: const Color(0xFFF4C95D),
            isDark: isDark,
            bottomText: "↓ -8%",
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _SummaryCard(
            title: "Savings",
            amount: savings,
            icon: Icons.savings_outlined,
            color: const Color(0xFF34D399),
            isDark: isDark,
            bottomText: "52% Ratio",
          ),
        ),
      ],
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final double amount;
  final IconData icon;
  final Color color;
  final bool isDark;
  final String bottomText;

  const _SummaryCard({
    required this.title,
    required this.amount,
    required this.icon,
    required this.color,
    required this.isDark,
    required this.bottomText,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF131A19) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color.withOpacity(0.4),
          width: 1.5,
        ),
        boxShadow: isDark
            ? [
                BoxShadow(
                  color: color.withOpacity(0.05),
                  blurRadius: 15,
                  spreadRadius: 2,
                )
              ]
            : null,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            color: color,
            size: 26,
          ),
          const SizedBox(height: 8),
          Text(
            title.toUpperCase(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.ibmPlexSansArabic(
              color: color,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.1,
            ),
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              "\$${amount.toStringAsFixed(2)}",
              style: GoogleFonts.ibmPlexSansArabic(
                color: isDark ? Colors.white : AppColors.lightText,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            bottomText,
            style: GoogleFonts.ibmPlexSansArabic(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================
// SECTION TITLE
// =====================================================

class _SectionTitle extends StatelessWidget {
  final String title;
  final bool isDark;
  final String? actionText;
  final VoidCallback? onActionTap;

  const _SectionTitle({
    required this.title,
    required this.isDark,
    this.actionText,
    this.onActionTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.ibmPlexSansArabic(
              color: isDark ? AppColors.darkText : AppColors.lightText,
              fontSize: 17,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        if (actionText != null)
          TextButton(
            onPressed: onActionTap,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(
                horizontal: 6,
              ),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              actionText!,
              style: GoogleFonts.ibmPlexSansArabic(
                color: const Color(0xFF34D399),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
      ],
    );
  }
}

// =====================================================
// TODAY INSIGHT
// =====================================================

class _TodayInsightCard extends StatelessWidget {
  final String insight;
  final bool isDark;
  final VoidCallback onViewAdvice;

  const _TodayInsightCard({
    required this.insight,
    required this.isDark,
    required this.onViewAdvice,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1A2622) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFD9F99D).withOpacity(0.6),
          width: 1.5,
        ),
        boxShadow: isDark
            ? [
                BoxShadow(
                  color: const Color(0xFFD9F99D).withOpacity(0.1),
                  blurRadius: 30,
                  spreadRadius: 2,
                )
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                "AI Smart Insight ✨",
                style: GoogleFonts.ibmPlexSansArabic(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            insight,
            style: GoogleFonts.ibmPlexSansArabic(
              color: AppColors.darkSubText,
              fontSize: 14,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: onViewAdvice,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD9F99D),
                foregroundColor: const Color(0xFF111827),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: Text(
                "Optimize Now",
                style: GoogleFonts.ibmPlexSansArabic(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================
// GOAL PROGRESS
// =====================================================

class _GoalProgressCard extends StatelessWidget {
  final HomeGoal goal;
  final bool isDark;

  const _GoalProgressCard({
    required this.goal,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final progress = goal.progress.clamp(0.0, 1.0);

    final percentage = (progress * 100).round();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF172624) : Colors.white,
        borderRadius: BorderRadius.circular(23),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.04)
              : Colors.black.withOpacity(0.04),
        ),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withOpacity(
                    0.04,
                  ),
                  blurRadius: 14,
                  offset: const Offset(0, 6),
                ),
              ],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: const Color(0xFFF4C95D).withOpacity(0.13),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.flag_outlined,
              color: Color(0xFFF4C95D),
              size: 25,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        goal.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.ibmPlexSansArabic(
                          color: isDark ? Colors.white : AppColors.lightText,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      "$percentage%",
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: const Color(
                          0xFFF4C95D,
                        ),
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  "Keep saving to reach your goal",
                  style: GoogleFonts.ibmPlexSansArabic(
                    color:
                        isDark ? AppColors.darkSubText : AppColors.lightSubText,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 7,
                    backgroundColor: isDark
                        ? const Color(
                            0xFF273A36,
                          )
                        : const Color(
                            0xFFF0F0EA,
                          ),
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      Color(0xFFF4C95D),
                    ),
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
// CHALLENGE
// =====================================================

class _ChallengeCard extends StatelessWidget {
  final HomeChallenge challenge;
  final bool isDark;

  const _ChallengeCard({
    required this.challenge,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E2320) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFF4C95D).withOpacity(0.3),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: const Color(0xFFF4C95D).withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.emoji_events_rounded,
              color: Color(0xFFF4C95D),
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Weekly Savings Sprint",
                  style: GoogleFonts.ibmPlexSansArabic(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      "Rank #3 | ",
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: AppColors.darkSubText,
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      "Days Left 4",
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Goal: Save \$150 by Sunday",
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: AppColors.darkSubText,
                        fontSize: 11,
                      ),
                    ),
                    Text(
                      "\$102/\$150",
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: Colors.white,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: const LinearProgressIndicator(
                        value: 0.68,
                        minHeight: 6,
                        backgroundColor: Color(0xFF273A36),
                        valueColor:
                            AlwaysStoppedAnimation<Color>(Color(0xFFF4C95D)),
                      ),
                    ),
                    Positioned(
                      left: MediaQuery.of(context).size.width * 0.4,
                      top: -6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF4C95D),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          "68%",
                          style: GoogleFonts.ibmPlexSansArabic(
                            color: const Color(0xFF131A19),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Participants",
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: AppColors.darkSubText,
                        fontSize: 12,
                      ),
                    ),
                    Row(
                      children: [
                        _buildAvatar(Colors.blue, "1"),
                        Transform.translate(
                            offset: const Offset(-8, 0),
                            child: _buildAvatar(Colors.red, "2")),
                        Transform.translate(
                            offset: const Offset(-16, 0),
                            child: _buildAvatar(Colors.green, "3")),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatar(Color color, String text) {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFF1E2320), width: 1.5),
      ),
      alignment: Alignment.center,
      child: Text(
        text,
        style: const TextStyle(
            color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}

// =====================================================
// QUICK ACTIONS
// =====================================================

class _QuickActionsGrid extends StatelessWidget {
  final bool isDark;
  final VoidCallback onAddExpense;
  final VoidCallback onAskBasira;
  final VoidCallback onGoalsTap;
  final VoidCallback onScanReceipt;
  final VoidCallback onChallengesTap;
  final VoidCallback onAnalyticsTap;

  const _QuickActionsGrid({
    required this.isDark,
    required this.onAddExpense,
    required this.onAskBasira,
    required this.onGoalsTap,
    required this.onScanReceipt,
    required this.onChallengesTap,
    required this.onAnalyticsTap,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 3,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 0.9,
      children: [
        _QuickActionCard(
          title: "Scan Receipt",
          icon: Icons.camera_alt,
          color: const Color(0xFF34D399),
          isDark: isDark,
          onTap: onScanReceipt,
        ),
        _QuickActionCard(
          title: "Ask AI",
          icon: Icons.auto_awesome,
          color: const Color(0xFFF4C95D),
          isDark: isDark,
          onTap: onAskBasira,
        ),
        _QuickActionCard(
          title: "My Goals",
          icon: Icons.track_changes_rounded,
          color: const Color(0xFFF97316),
          isDark: isDark,
          onTap: onGoalsTap,
        ),
        _QuickActionCard(
          title: "Add Expense",
          icon: Icons.add,
          color: const Color(0xFFEF4444),
          isDark: isDark,
          onTap: onAddExpense,
        ),
        _QuickActionCard(
          title: "Challenges",
          icon: Icons.emoji_events_rounded,
          color: const Color(0xFFF4C95D),
          isDark: isDark,
          onTap: onChallengesTap,
        ),
        _QuickActionCard(
          title: "Analytics",
          icon: Icons.bar_chart_rounded,
          color: const Color(0xFF3B82F6),
          isDark: isDark,
          onTap: onAnalyticsTap,
        ),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final bool isDark;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.title,
    required this.icon,
    required this.color,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Ink(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E2320) : Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  icon,
                  color: isDark ? const Color(0xFF111816) : Colors.white,
                  size: 26,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.ibmPlexSansArabic(
                  color: isDark ? Colors.white : AppColors.lightText,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// =====================================================
// ERROR VIEW
// =====================================================

class _HomeErrorView extends StatelessWidget {
  final String message;
  final bool isDark;
  final VoidCallback onRetry;

  const _HomeErrorView({
    required this.message,
    required this.isDark,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 74,
              height: 74,
              decoration: BoxDecoration(
                color: const Color(0xFFFF6B6B).withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.cloud_off_outlined,
                color: Color(0xFFFF6B6B),
                size: 35,
              ),
            ),
            const SizedBox(height: 18),
            Text(
              "Unable to load home data",
              textAlign: TextAlign.center,
              style: GoogleFonts.ibmPlexSansArabic(
                color: isDark ? AppColors.darkText : AppColors.lightText,
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: GoogleFonts.ibmPlexSansArabic(
                color: isDark ? AppColors.darkSubText : AppColors.lightSubText,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(
                Icons.refresh_rounded,
              ),
              label: const Text("Try Again"),
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 22,
                  vertical: 13,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(
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
