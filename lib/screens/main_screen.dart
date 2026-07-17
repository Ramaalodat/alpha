
import 'package:alpha_app/screens/ai_assistant/chat_screen.dart';
import 'package:alpha_app/screens/expenses/expenses_screen.dart';
import 'package:alpha_app/screens/goals/goal_history.dart';
import 'package:alpha_app/screens/home/home_screen.dart';
import 'package:alpha_app/screens/profile/profile_screen.dart';

import 'package:alpha_app/widgets/custom_nav_bar.dart';
import 'package:flutter/material.dart';

class MainNavigationScreen extends StatefulWidget {
  final int initialIndex;

  const MainNavigationScreen({
    super.key,
    this.initialIndex = 0,
  });

  @override
  State<MainNavigationScreen> createState() {
    return _MainNavigationScreenState();
  }
}

class _MainNavigationScreenState
    extends State<MainNavigationScreen> {
  late int _currentIndex;

  final List<Widget> _screens = const [
     HomeScreen(),
    ExpensesScreen(),
    ChatScreen(),
    MyGoalsScreen(),
     ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();

    _currentIndex =
        widget.initialIndex.clamp(0, 4);
  }

  void _changePage(int index) {
    if (_currentIndex == index) {
      return;
    }

    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,

      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),

      bottomNavigationBar:
          CustomBottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _changePage,
      ),
    );
  }
}