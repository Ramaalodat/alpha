import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/models/home_model.dart';
import 'package:alpha_app/providers/home_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
  });

  @override
  State<HomeScreen> createState() =>
      _HomeScreenState();
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

          context
              .read<HomeProvider>()
              .loadHomeData();
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final homeProvider =
        context.watch<HomeProvider>();

    final themeProvider =
        context.watch<Themeprovider>();

    final isDark = themeProvider.isDark;

    final homeData = homeProvider.homeData;

    final screenWidth =
        MediaQuery.sizeOf(context).width;

    return Scaffold(
      backgroundColor: isDark
          ? AppColors.darkBackground
          : AppColors.lightBackground,
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
    if (homeProvider.isLoading &&
        homeData == null) {
      return Center(
        child: CircularProgressIndicator(
          color: isDark
              ? AppColors.darkPrimary
              : AppColors.lightPrimary,
        ),
      );
    }

    if (homeProvider.hasError &&
        homeData == null) {
      return _HomeErrorView(
        message: homeProvider.errorMessage ??
            "Something went wrong",
        isDark: isDark,
        onRetry: () {
          context
              .read<HomeProvider>()
              .loadHomeData();
        },
      );
    }

    if (homeData == null) {
      return const SizedBox.shrink();
    }

    return RefreshIndicator(
      color: isDark
          ? AppColors.darkPrimary
          : AppColors.lightPrimary,
      onRefresh: () async {
        await context
            .read<HomeProvider>()
            .loadHomeData();
      },
      child: SingleChildScrollView(
        physics:
            const AlwaysScrollableScrollPhysics(
          parent: BouncingScrollPhysics(),
        ),
        padding: EdgeInsets.fromLTRB(
          screenWidth * 0.055,
          20,
          screenWidth * 0.055,
          125,
        ),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
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

            _SectionTitle(
              title: "Today's Insight",
              isDark: isDark,
            ),

            const SizedBox(height: 12),

            _TodayInsightCard(
              insight: homeData.todayInsight,
              isDark: isDark,
              onViewAdvice: () {
                // افتحي صفحة BASIRA لاحقًا
              },
            ),

            if (homeData.goal != null) ...[
              const SizedBox(height: 22),

              _SectionTitle(
                title: "Goal Progress",
                isDark: isDark,
                actionText: "View All",
                onActionTap: () {
                  // الانتقال لصفحة الأهداف
                },
              ),

              const SizedBox(height: 12),

              _GoalProgressCard(
                goal: homeData.goal!,
                isDark: isDark,
              ),
            ],

            if (homeData.challenge != null) ...[
              const SizedBox(height: 22),

              _SectionTitle(
                title: "Active Challenge",
                isDark: isDark,
                actionText: "View",
                onActionTap: () {},
              ),

              const SizedBox(height: 12),

              _ChallengeCard(
                challenge:
                    homeData.challenge!,
                isDark: isDark,
              ),
            ],

            const SizedBox(height: 22),

            _SectionTitle(
              title: "Quick Actions",
              isDark: isDark,
            ),

            const SizedBox(height: 12),

            _QuickActionsGrid(
              isDark: isDark,
              onAddExpense: () {},
              onAskBasira: () {},
              onGoalsTap: () {},
              onChallengesTap: () {},
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
    final displayName = userName.trim().isEmpty
        ? "User"
        : userName.trim();

    final firstLetter =
        displayName[0].toUpperCase();

    return Row(
      children: [
        Container(
          width: 49,
          height: 49,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF34D399),
                Color(0xFF14B8A6),
              ],
            ),
            borderRadius:
                BorderRadius.circular(16),
          ),
          child: Text(
            firstLetter,
            style:
                GoogleFonts.ibmPlexSansArabic(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),

        const SizedBox(width: 13),

        Expanded(
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Text(
                "Hello, $displayName 👋",
                maxLines: 1,
                overflow:
                    TextOverflow.ellipsis,
                style: GoogleFonts
                    .ibmPlexSansArabic(
                  color: isDark
                      ? AppColors.darkText
                      : AppColors.lightText,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 2),

              Text(
                "Let's improve your finances today",
                maxLines: 1,
                overflow:
                    TextOverflow.ellipsis,
                style: GoogleFonts
                    .ibmPlexSansArabic(
                  color: isDark
                      ? AppColors.darkSubText
                      : AppColors.lightSubText,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),

        const SizedBox(width: 10),

        InkWell(
          onTap: onNotificationTap,
          borderRadius:
              BorderRadius.circular(15),
          child: Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: isDark
                  ? const Color(0xFF172624)
                  : Colors.white,
              borderRadius:
                  BorderRadius.circular(15),
              border: Border.all(
                color: isDark
                    ? Colors.white
                        .withOpacity(0.05)
                    : Colors.black
                        .withOpacity(0.05),
              ),
              boxShadow: isDark
                  ? null
                  : [
                      BoxShadow(
                        color: Colors.black
                            .withOpacity(0.04),
                        blurRadius: 12,
                        offset:
                            const Offset(0, 5),
                      ),
                    ],
            ),
            child: const Icon(
              Icons.notifications_none_rounded,
              color: Color(0xFFF4C95D),
              size: 24,
            ),
          ),
        ),
      ],
    );
  }
}

// =====================================================
// FINANCIAL SCORE
// =====================================================

class _FinancialScoreCard
    extends StatelessWidget {
  final int score;
  final bool isDark;

  const _FinancialScoreCard({
    required this.score,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final safeScore =
        score.clamp(0, 100);

    final scoreProgress =
        safeScore / 100;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: isDark
            ? const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF172B27),
                  Color(0xFF12231F),
                ],
              )
            : null,
        color: isDark ? null : Colors.white,
        borderRadius:
            BorderRadius.circular(26),
        border: Border.all(
          color: isDark
              ? const Color(0xFF34D399)
                  .withOpacity(0.13)
              : Colors.black
                  .withOpacity(0.04),
        ),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color:
                      Colors.black.withOpacity(
                    0.045,
                  ),
                  blurRadius: 18,
                  offset: const Offset(0, 7),
                ),
              ],
      ),
      child: Row(
        children: [
          CircularPercentIndicator(
            radius: 55,
            lineWidth: 9,
            percent:
                scoreProgress.clamp(0.0, 1.0),
            animation: true,
            animationDuration: 850,
            circularStrokeCap:
                CircularStrokeCap.round,
            backgroundColor: isDark
                ? const Color(0xFF243A35)
                : const Color(0xFFE7F1ED),
            progressColor:
                const Color(0xFF34D399),
            center: Column(
              mainAxisAlignment:
                  MainAxisAlignment.center,
              children: [
                Text(
                  "$safeScore",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? Colors.white
                        : AppColors.lightText,
                    fontSize: 27,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                Text(
                  "Score",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkSubText
                        : AppColors
                            .lightSubText,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: 20),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  "Financial Score",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? Colors.white
                        : AppColors.lightText,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 7),

                Text(
                  _scoreMessage(safeScore),
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkSubText
                        : AppColors
                            .lightSubText,
                    fontSize: 12,
                    height: 1.5,
                  ),
                ),

                const SizedBox(height: 12),

                Container(
                  padding:
                      const EdgeInsets.symmetric(
                    horizontal: 11,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color:
                        const Color(0xFF34D399)
                            .withOpacity(0.13),
                    borderRadius:
                        BorderRadius.circular(30),
                  ),
                  child: Text(
                    _scoreLevel(safeScore),
                    style: GoogleFonts
                        .ibmPlexSansArabic(
                      color:
                          const Color(0xFF34D399),
                      fontSize: 11,
                      fontWeight:
                          FontWeight.w600,
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

class _FinancialSummarySection
    extends StatelessWidget {
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
            icon: Icons
                .south_west_rounded,
            color:
                const Color(0xFF34D399),
            isDark: isDark,
          ),
        ),

        const SizedBox(width: 10),

        Expanded(
          child: _SummaryCard(
            title: "Expenses",
            amount: expenses,
            icon:
                Icons.north_east_rounded,
            color:
                const Color(0xFFFF6B6B),
            isDark: isDark,
          ),
        ),

        const SizedBox(width: 10),

        Expanded(
          child: _SummaryCard(
            title: "Savings",
            amount: savings,
            icon: Icons
                .account_balance_wallet_outlined,
            color:
                const Color(0xFFF4C95D),
            isDark: isDark,
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

  const _SummaryCard({
    required this.title,
    required this.amount,
    required this.icon,
    required this.color,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 118,
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 13,
      ),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF172624)
            : Colors.white,
        borderRadius:
            BorderRadius.circular(20),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.04)
              : Colors.black.withOpacity(0.04),
        ),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color:
                      Colors.black.withOpacity(
                    0.035,
                  ),
                  blurRadius: 12,
                  offset: const Offset(0, 5),
                ),
              ],
      ),
      child: Column(
        mainAxisAlignment:
            MainAxisAlignment.center,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius:
                  BorderRadius.circular(11),
            ),
            child: Icon(
              icon,
              color: color,
              size: 18,
            ),
          ),

          const SizedBox(height: 7),

          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style:
                GoogleFonts.ibmPlexSansArabic(
              color: isDark
                  ? AppColors.darkSubText
                  : AppColors.lightSubText,
              fontSize: 10,
            ),
          ),

          const SizedBox(height: 3),

          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              "${amount.toStringAsFixed(0)} JD",
              style: GoogleFonts
                  .ibmPlexSansArabic(
                color: isDark
                    ? Colors.white
                    : AppColors.lightText,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
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
            style:
                GoogleFonts.ibmPlexSansArabic(
              color: isDark
                  ? AppColors.darkText
                  : AppColors.lightText,
              fontSize: 17,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),

        if (actionText != null)
          TextButton(
            onPressed: onActionTap,
            style: TextButton.styleFrom(
              padding:
                  const EdgeInsets.symmetric(
                horizontal: 6,
              ),
              minimumSize: Size.zero,
              tapTargetSize:
                  MaterialTapTargetSize
                      .shrinkWrap,
            ),
            child: Text(
              actionText!,
              style: GoogleFonts
                  .ibmPlexSansArabic(
                color:
                    const Color(0xFF34D399),
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

class _TodayInsightCard
    extends StatelessWidget {
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
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: isDark
            ? LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  const Color(0xFF1F2920),
                  const Color(0xFF18231E),
                  const Color(0xFFF4C95D)
                      .withOpacity(0.08),
                ],
              )
            : const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFFFFFCED),
                  Color(0xFFFFF8D8),
                ],
              ),
        borderRadius:
            BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFF4C95D)
              .withOpacity(
            isDark ? 0.28 : 0.38,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color:
                      const Color(0xFFF4C95D)
                          .withOpacity(0.15),
                  borderRadius:
                      BorderRadius.circular(
                    12,
                  ),
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  color: Color(0xFFF4C95D),
                  size: 21,
                ),
              ),

              const SizedBox(width: 10),

              Expanded(
                child: Text(
                  "BASIRA Smart Insight",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? Colors.white
                        : AppColors.lightText,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),

              Container(
                padding:
                    const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color:
                      const Color(0xFFF4C95D)
                          .withOpacity(0.14),
                  borderRadius:
                      BorderRadius.circular(
                    20,
                  ),
                ),
                child: Text(
                  "AI",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color:
                        const Color(0xFFF4C95D),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          Text(
            insight.isEmpty
                ? "Your financial insight will appear here."
                : insight,
            style:
                GoogleFonts.ibmPlexSansArabic(
              color: isDark
                  ? AppColors.darkText
                  : AppColors.lightText,
              fontSize: 13,
              height: 1.65,
            ),
          ),

          const SizedBox(height: 15),

          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              onPressed: onViewAdvice,
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    const Color(0xFFF4C95D),
                foregroundColor:
                    const Color(0xFF1F2937),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius:
                      BorderRadius.circular(
                    15,
                  ),
                ),
              ),
              child: Text(
                "View Advice",
                style: GoogleFonts
                    .ibmPlexSansArabic(
                  fontSize: 13,
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

class _GoalProgressCard
    extends StatelessWidget {
  final HomeGoal goal;
  final bool isDark;

  const _GoalProgressCard({
    required this.goal,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final progress =
        goal.progress.clamp(0.0, 1.0);

    final percentage =
        (progress * 100).round();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF172624)
            : Colors.white,
        borderRadius:
            BorderRadius.circular(23),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.04)
              : Colors.black.withOpacity(0.04),
        ),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color:
                      Colors.black.withOpacity(
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
              color: const Color(0xFFF4C95D)
                  .withOpacity(0.13),
              borderRadius:
                  BorderRadius.circular(16),
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
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        goal.name,
                        maxLines: 1,
                        overflow:
                            TextOverflow.ellipsis,
                        style: GoogleFonts
                            .ibmPlexSansArabic(
                          color: isDark
                              ? Colors.white
                              : AppColors
                                  .lightText,
                          fontSize: 15,
                          fontWeight:
                              FontWeight.bold,
                        ),
                      ),
                    ),

                    const SizedBox(width: 8),

                    Text(
                      "$percentage%",
                      style: GoogleFonts
                          .ibmPlexSansArabic(
                        color: const Color(
                          0xFFF4C95D,
                        ),
                        fontSize: 13,
                        fontWeight:
                            FontWeight.bold,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 6),

                Text(
                  "Keep saving to reach your goal",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkSubText
                        : AppColors
                            .lightSubText,
                    fontSize: 11,
                  ),
                ),

                const SizedBox(height: 10),

                ClipRRect(
                  borderRadius:
                      BorderRadius.circular(20),
                  child:
                      LinearProgressIndicator(
                    value: progress,
                    minHeight: 7,
                    backgroundColor: isDark
                        ? const Color(
                            0xFF273A36,
                          )
                        : const Color(
                            0xFFF0F0EA,
                          ),
                    valueColor:
                        const AlwaysStoppedAnimation<
                            Color>(
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
    final progress =
        challenge.progress.clamp(0.0, 1.0);

    final percentage =
        (progress * 100).round();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF172624)
            : Colors.white,
        borderRadius:
            BorderRadius.circular(23),
        border: Border.all(
          color: const Color(0xFF34D399)
              .withOpacity(
            isDark ? 0.14 : 0.11,
          ),
        ),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color:
                      Colors.black.withOpacity(
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
              color: const Color(0xFF34D399)
                  .withOpacity(0.13),
              borderRadius:
                  BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.emoji_events_outlined,
              color: Color(0xFF34D399),
              size: 25,
            ),
          ),

          const SizedBox(width: 14),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        challenge.name,
                        maxLines: 1,
                        overflow:
                            TextOverflow.ellipsis,
                        style: GoogleFonts
                            .ibmPlexSansArabic(
                          color: isDark
                              ? Colors.white
                              : AppColors
                                  .lightText,
                          fontSize: 15,
                          fontWeight:
                              FontWeight.bold,
                        ),
                      ),
                    ),

                    const SizedBox(width: 8),

                    Text(
                      "$percentage%",
                      style: GoogleFonts
                          .ibmPlexSansArabic(
                        color: const Color(
                          0xFF34D399,
                        ),
                        fontSize: 13,
                        fontWeight:
                            FontWeight.bold,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 6),

                Text(
                  "You're getting closer to completing it",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkSubText
                        : AppColors
                            .lightSubText,
                    fontSize: 11,
                  ),
                ),

                const SizedBox(height: 10),

                ClipRRect(
                  borderRadius:
                      BorderRadius.circular(20),
                  child:
                      LinearProgressIndicator(
                    value: progress,
                    minHeight: 7,
                    backgroundColor: isDark
                        ? const Color(
                            0xFF273A36,
                          )
                        : const Color(
                            0xFFEAF3EF,
                          ),
                    valueColor:
                        const AlwaysStoppedAnimation<
                            Color>(
                      Color(0xFF34D399),
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
// QUICK ACTIONS
// =====================================================

class _QuickActionsGrid
    extends StatelessWidget {
  final bool isDark;
  final VoidCallback onAddExpense;
  final VoidCallback onAskBasira;
  final VoidCallback onGoalsTap;
  final VoidCallback onChallengesTap;

  const _QuickActionsGrid({
    required this.isDark,
    required this.onAddExpense,
    required this.onAskBasira,
    required this.onGoalsTap,
    required this.onChallengesTap,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics:
          const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.45,
      children: [
        _QuickActionCard(
          title: "Add Expense",
          subtitle: "Record spending",
          icon: Icons.add_rounded,
          color:
              const Color(0xFFFF6B6B),
          isDark: isDark,
          onTap: onAddExpense,
        ),

        _QuickActionCard(
          title: "Ask BASIRA",
          subtitle: "Get smart advice",
          icon:
              Icons.auto_awesome_outlined,
          color:
              const Color(0xFF14B8A6),
          isDark: isDark,
          onTap: onAskBasira,
        ),

        _QuickActionCard(
          title: "My Goals",
          subtitle: "Track progress",
          icon: Icons.flag_outlined,
          color:
              const Color(0xFFF4C95D),
          isDark: isDark,
          onTap: onGoalsTap,
        ),

        _QuickActionCard(
          title: "Challenges",
          subtitle: "Build good habits",
          icon:
              Icons.emoji_events_outlined,
          color:
              const Color(0xFF34D399),
          isDark: isDark,
          onTap: onChallengesTap,
        ),
      ],
    );
  }
}

class _QuickActionCard
    extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final bool isDark;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.title,
    required this.subtitle,
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
        borderRadius:
            BorderRadius.circular(20),
        child: Ink(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDark
                ? const Color(0xFF172624)
                : Colors.white,
            borderRadius:
                BorderRadius.circular(20),
            border: Border.all(
              color: isDark
                  ? Colors.white
                      .withOpacity(0.04)
                  : Colors.black
                      .withOpacity(0.04),
            ),
            boxShadow: isDark
                ? null
                : [
                    BoxShadow(
                      color: Colors.black
                          .withOpacity(0.035),
                      blurRadius: 12,
                      offset:
                          const Offset(0, 5),
                    ),
                  ],
          ),
          child: Row(
            children: [
              Container(
                width: 43,
                height: 43,
                decoration: BoxDecoration(
                  color:
                      color.withOpacity(0.13),
                  borderRadius:
                      BorderRadius.circular(
                    13,
                  ),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 22,
                ),
              ),

              const SizedBox(width: 10),

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
                      overflow:
                          TextOverflow.ellipsis,
                      style: GoogleFonts
                          .ibmPlexSansArabic(
                        color: isDark
                            ? Colors.white
                            : AppColors
                                .lightText,
                        fontSize: 12,
                        fontWeight:
                            FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 3),

                    Text(
                      subtitle,
                      maxLines: 1,
                      overflow:
                          TextOverflow.ellipsis,
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
                  ],
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

class _HomeErrorView
    extends StatelessWidget {
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
                color: const Color(0xFFFF6B6B)
                    .withOpacity(0.12),
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
              style:
                  GoogleFonts.ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkText
                    : AppColors.lightText,
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              message,
              textAlign: TextAlign.center,
              style:
                  GoogleFonts.ibmPlexSansArabic(
                color: isDark
                    ? AppColors.darkSubText
                    : AppColors.lightSubText,
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
                backgroundColor: isDark
                    ? AppColors.darkPrimary
                    : AppColors.lightPrimary,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(
                  horizontal: 22,
                  vertical: 13,
                ),
                shape: RoundedRectangleBorder(
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