import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/home/home_screen.dart';
import 'package:alpha_app/screens/main/dashboard_screen.dart';
import 'package:alpha_app/screens/main/goals_screen.dart';
import 'package:alpha_app/screens/ai_assistant/chat_screen.dart';
import 'package:alpha_app/screens/profile/profile_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      const HomeScreen(),
      const GoalsScreen(),
      const DashboardScreen(),
      const ChatScreen(),
      const ProfileScreen(),
    ];

    final theme = Provider.of<Themeprovider>(context);
    final isDark = theme.isDark;

    final bgColor = isDark ? AppColors.darkBackground : AppColors.lightBackground;
    final navColor = isDark ? AppColors.darkCard : AppColors.lightCard;
    final unselectedColor = isDark ? Colors.grey[600] : Colors.grey[400];
    final selectedColor = const Color(0xFF34D399);

    return Scaffold(
      backgroundColor: bgColor,
      body: screens[_currentIndex],
      bottomNavigationBar: Container(
        height: 80,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF131A19) : Colors.white,
          border: Border(
            top: BorderSide(
              color: isDark
                  ? Colors.white.withOpacity(0.05)
                  : Colors.black.withOpacity(0.05),
            ),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(icon: Icons.home_filled, label: "Home", index: 0, selectedColor: selectedColor, unselectedColor: unselectedColor!),
              _buildNavItem(icon: Icons.track_changes_rounded, label: "Goals", index: 1, selectedColor: selectedColor, unselectedColor: unselectedColor),
              _buildNavItem(icon: Icons.bar_chart_rounded, label: "Activity", index: 2, selectedColor: selectedColor, unselectedColor: unselectedColor),
              _buildNavItem(icon: Icons.chat_bubble_outline_rounded, label: "AI Coach", index: 3, selectedColor: selectedColor, unselectedColor: unselectedColor),
              _buildNavItem(icon: Icons.person_outline_rounded, label: "Profile", index: 4, selectedColor: selectedColor, unselectedColor: unselectedColor),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required int index,
    required Color selectedColor,
    required Color unselectedColor,
  }) {
    final isSelected = _currentIndex == index;
    final color = isSelected ? selectedColor : unselectedColor;

    return GestureDetector(
      onTap: () {
        setState(() {
          _currentIndex = index;
        });
      },
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}
