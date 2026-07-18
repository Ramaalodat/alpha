import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/home/home_screen.dart';
import 'package:alpha_app/screens/main/expenses_screen.dart';
import 'package:alpha_app/screens/main/goals_screen.dart';
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

  final List<Widget> _screens = [
    const HomeScreen(),
    const ExpensesScreen(),
    const GoalsScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<Themeprovider>(context);
    final isDark = theme.isDark;

    final bgColor = isDark ? AppColors.darkBackground : AppColors.lightBackground;
    final navColor = isDark ? AppColors.darkCard : AppColors.lightCard;
    final unselectedColor = isDark ? Colors.grey[600] : Colors.grey[400];
    final selectedColor = const Color(0xFF34D399);

    return Scaffold(
      backgroundColor: bgColor,
      body: _screens[_currentIndex],
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Open BASIRA Smart Insight / Chat
        },
        backgroundColor: const Color(0xFF86E3A8), // Light green gradient feel
        elevation: 4,
        shape: const CircleBorder(),
        child: Icon(Icons.auto_awesome, color: isDark ? AppColors.darkBackground : Colors.white, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        color: navColor,
        shape: const CircularNotchedRectangle(),
        notchMargin: 8.0,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(icon: Icons.home_filled, label: "Home", index: 0, selectedColor: selectedColor, unselectedColor: unselectedColor!),
              _buildNavItem(icon: Icons.receipt_long_rounded, label: "Expenses", index: 1, selectedColor: selectedColor, unselectedColor: unselectedColor),
              const SizedBox(width: 40), // Space for FAB
              _buildNavItem(icon: Icons.track_changes_rounded, label: "Goals", index: 2, selectedColor: selectedColor, unselectedColor: unselectedColor),
              _buildNavItem(icon: Icons.person_rounded, label: "Profile", index: 3, selectedColor: selectedColor, unselectedColor: unselectedColor),
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
