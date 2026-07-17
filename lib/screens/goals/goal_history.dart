import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/providers/goal_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/goals/new_goal_screen.dart';
import 'package:alpha_app/widgets/goals/goal_card.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class MyGoalsScreen extends StatelessWidget {
  const MyGoalsScreen({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final goalProvider = context.watch<GoalProvider>();
    final themeProvider =
        context.watch<Themeprovider>();

    final screenW = Device.width(context);
    final screenH = Device.height(context);

    final goals = goalProvider.activeGoals;

    return Scaffold(
      backgroundColor: themeProvider.isDark
          ? AppColors.darkBackground
          : AppColors.lightBackground,

      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: screenW * 0.06,
          ),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              SizedBox(height: screenH * 0.025),

              // ================= HEADER =================

              Row(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,
                      children: [
                        Text(
                          "My Goals",
                          style: GoogleFonts
                              .ibmPlexSansArabic(
                            color: themeProvider.isDark
                                ? AppColors.darkText
                                : AppColors.lightText,
                            fontSize: screenW * 0.07,
                            fontWeight: FontWeight.bold,
                          ),
                        ),

                        SizedBox(
                          height: screenH * 0.004,
                        ),

                        Text(
                          "${goals.length} active ${goals.length == 1 ? "goal" : "goals"}",
                          style: GoogleFonts
                              .ibmPlexSansArabic(
                            color: themeProvider.isDark
                                ? AppColors.darkSubText
                                : AppColors.lightSubText,
                            fontSize: screenW * 0.035,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),

                  InkWell(
                    onTap: () =>
                        _openNewGoalScreen(context),
                    borderRadius:
                        BorderRadius.circular(13),
                    child: Container(
                      width: screenW * 0.12,
                      height: screenW * 0.12,
                      decoration: BoxDecoration(
                        color: themeProvider.isDark
                            ? const Color(0xFF203330)
                            : AppColors.lightSecondary
                                .withOpacity(0.12),
                        borderRadius:
                            BorderRadius.circular(13),
                      ),
                      child: Icon(
                        Icons.add,
                        color: themeProvider.isDark
                            ? AppColors.darkSubText
                            : AppColors.lightPrimary,
                        size: screenW * 0.075,
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(height: screenH * 0.025),

              // ================= LIST =================

              Expanded(
                child: ListView(
                  physics:
                      const BouncingScrollPhysics(),
                  padding: EdgeInsets.only(
                    bottom: screenH * 0.14,
                  ),
                  children: [
                    if (goals.isEmpty)
                      _DeletedAllGoalsMessage(
                        isDark:
                            themeProvider.isDark,
                        screenW: screenW,
                      ),

                   ...goals.map(
  (goal) => GoalCard(
    goal: goal,
    onDelete: () {
      _showDeleteGoalDialog(
        context,
        goal.id ?? "",
        goal.title,
      );
    },
  ),
),

                    _AddGoalButton(
                      isDark: themeProvider.isDark,
                      onTap: () =>
                          _openNewGoalScreen(context),
                    ),

                    SizedBox(height: screenH * 0.02),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openNewGoalScreen(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const NewGoalScreen(),
      ),
    );
  }
}

// =====================================================
// EMPTY AFTER DELETE
// =====================================================

class _DeletedAllGoalsMessage extends StatelessWidget {
  final bool isDark;
  final double screenW;

  const _DeletedAllGoalsMessage({
    required this.isDark,
    required this.screenW,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(
        top: 30,
        bottom: 24,
      ),
      child: Column(
        children: [
          Icon(
            Icons.flag_outlined,
            size: screenW * 0.15,
            color: isDark
                ? AppColors.darkSubText
                : AppColors.lightSubText,
          ),

          const SizedBox(height: 12),

          Text(
            "You don't have any active goals",
            textAlign: TextAlign.center,
            style: GoogleFonts.ibmPlexSansArabic(
              color: isDark
                  ? AppColors.darkText
                  : AppColors.lightText,
              fontSize: screenW * 0.045,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 5),

          Text(
            "Add a new goal to continue your saving journey.",
            textAlign: TextAlign.center,
            style: GoogleFonts.ibmPlexSansArabic(
              color: isDark
                  ? AppColors.darkSubText
                  : AppColors.lightSubText,
              fontSize: screenW * 0.034,
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================
// ADD GOAL BUTTON
// =====================================================

class _AddGoalButton extends StatelessWidget {
  final bool isDark;
  final VoidCallback onTap;

  const _AddGoalButton({
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: CustomPaint(
        painter: _DashedBorderPainter(
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
              "+ Add a new goal",
              style: GoogleFonts.ibmPlexSansArabic(
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

// =====================================================
// DASHED BORDER
// =====================================================

class _DashedBorderPainter extends CustomPainter {
  final Color color;

  const _DashedBorderPainter({
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    const dashWidth = 5.0;
    const dashSpace = 4.0;

    final borderPath = Path()
      ..addRRect(
        RRect.fromRectAndRadius(
          Offset.zero & size,
          const Radius.circular(22),
        ),
      );

    for (final metric
        in borderPath.computeMetrics()) {
      double distance = 0;

      while (distance < metric.length) {
        final nextDistance =
            (distance + dashWidth)
                .clamp(0.0, metric.length);

        canvas.drawPath(
          metric.extractPath(
            distance,
            nextDistance,
          ),
          paint,
        );

        distance += dashWidth + dashSpace;
      }
    }
  }

  @override
  bool shouldRepaint(
    covariant _DashedBorderPainter oldDelegate,
  ) {
    return oldDelegate.color != color;
  }
}

void _showDeleteGoalDialog(
  BuildContext context,
  String goalId,
  String goalTitle,
) {
  final themeProvider =
      context.read<Themeprovider>();

  showDialog<void>(
    context: context,
    builder: (dialogContext) {
      return AlertDialog(
        backgroundColor:
            themeProvider.isDark
                ? const Color(0xFF172624)
                : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius:
              BorderRadius.circular(22),
        ),
        title: Text(
          "Delete Goal",
          style:
              GoogleFonts.ibmPlexSansArabic(
            color: themeProvider.isDark
                ? AppColors.darkText
                : AppColors.lightText,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Text(
          "Are you sure you want to delete \"$goalTitle\"?",
          style:
              GoogleFonts.ibmPlexSansArabic(
            color: themeProvider.isDark
                ? AppColors.darkSubText
                : AppColors.lightSubText,
            fontSize: 14,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext);
            },
            child: Text(
              "Cancel",
              style: GoogleFonts
                  .ibmPlexSansArabic(
                color: themeProvider.isDark
                    ? AppColors.darkSubText
                    : AppColors
                        .lightSubText,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),

          TextButton(
            onPressed: () {
              context
                  .read<GoalProvider>()
                  .removeGoal(goalId);

              Navigator.pop(dialogContext);

              ScaffoldMessenger.of(context)
                  .showSnackBar(
                SnackBar(
                  content: Text(
                    "Goal deleted successfully",
                    style: GoogleFonts
                        .ibmPlexSansArabic(),
                  ),
                  behavior:
                      SnackBarBehavior.floating,
                ),
              );
            },
            child: Text(
              "Delete",
              style: GoogleFonts
                  .ibmPlexSansArabic(
                color:
                    const Color(0xFFFF6B6B),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      );
    },
  );
}