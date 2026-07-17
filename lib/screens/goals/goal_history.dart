
import 'package:flutter/material.dart';

class MyGoalsApp extends StatelessWidget {
  const MyGoalsApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My Goals',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0D1111),
        primaryColor: const Color(0xFF00D296), // Primary Green
      ),
      home: const MyGoalsScreen(),
    );
  }
}

class MyGoalsScreen extends StatefulWidget {
  const MyGoalsScreen({Key? key}) : super(key: key);

  @override
  State<MyGoalsScreen> createState() => _MyGoalsScreenState();
}

class _MyGoalsScreenState extends State<MyGoalsScreen> {
  int _selectedIndex = 2; // Index for 'Goals'

  // Helper function to get icons
  IconData _getGoalIcon(String title) {
    if (title.contains('Laptop')) return Icons.laptop_mac;
    if (title.contains('Aqaba')) return Icons.flight;
    return Icons.flag;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Custom AppBar for status bar and top actions
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'My Goals',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        actions: [
          // Add Goal Icon Button (Clickable)
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1A2223),
                borderRadius: BorderRadius.circular(12),
              ),
              child: IconButton(
                icon: const Icon(Icons.add, color: Colors.white),
                onPressed: () {
                  // Handle add goal
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Add New Goal Tapped')),
                  );
                },
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '2 active goals',
                style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 16),
              ),
              const SizedBox(height: 24),

              // 1. Large Goal Card (Clickable)
              _buildClickableCard(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Clicked: New Laptop Goal')),
                  );
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.laptop_mac, color: Color(0xFF9CA3AF), size: 28),
                            const SizedBox(width: 12),
                            const Text(
                              'New Laptop',
                              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        // "45 days left" tag
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF3CD).withOpacity(0.15), // Yellow-ish
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            '45 days left',
                            style: TextStyle(color: Color(0xFFFBC02D), fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        // Custom Circular Progress Indicator
                        SizedBox(
                          width: 80,
                          height: 80,
                          child: Stack(
                            children: [
                              Center(
                                child: SizedBox(
                                  width: 70,
                                  height: 70,
                                  child: CircularProgressIndicator(
                                    value: 0.70, // 70%
                                    strokeWidth: 8,
                                    backgroundColor: const Color(0xFF263238),
                                    valueColor: AlwaysStoppedAnimation<Color>(const Color(0xFF00D296)),
                                  ),
                                ),
                              ),
                              Center(
                                child: const Text(
                                  '70%',
                                  style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 24),
                        // Savings Info
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Saved so far', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 14)),
                            const SizedBox(height: 4),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.baseline,
                              textBaseline: TextBaseline.alphabetic,
                              children: [
                                const Text(
                                  '700',
                                  style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                                ),
                                const Text(
                                  ' of 1,000 JD',
                                  style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 16),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Recommended Saving Section
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F1818),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.shield_moon, color: Color(0xFFFBC02D), size: 22),
                          const SizedBox(width: 10),
                          const Text(
                            'Recommended Monthly Saving',
                            style: TextStyle(color: Color(0xFF00D296), fontSize: 14, fontWeight: FontWeight.w500),
                          ),
                          const Spacer(),
                          const Text(
                            '80 JD',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const Text(
                            ' / month',
                            style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // 2. Small Goal Card (Clickable)
              _buildClickableCard(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Clicked: Trip to Aqaba Goal')),
                  );
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.flight, color: Color(0xFF9CA3AF), size: 28),
                            const SizedBox(width: 12),
                            const Text(
                              'Trip to Aqaba',
                              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        // "90 days left" tag
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFCCFBF1).withOpacity(0.15), // Teal-ish
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            '90 days left',
                            style: TextStyle(color: Color(0xFF00D296), fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Linear Progress Indicator
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: const LinearProgressIndicator(
                        value: 0.4, // Placeholder for 40%
                        minHeight: 8,
                        backgroundColor: Color(0xFF263238),
                        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF00D296)),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('200 JD', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 14)),
                        const Text('Goal 500', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 14)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 3. Add New Goal Card (Dashed Border - Clickable)
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Add New Goal Button Tapped')),
                  );
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 24),
                  decoration: BoxDecoration(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF263238), width: 2, style: BorderStyle.solid),
                  ),
                  child: const Center(
                    child: Text(
                      '+ Add a new goal',
                      style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 80), // Space for navigation bar
            ],
          ),
        ),
      ),
      // Bottom Navigation Bar
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF161B1C),
          borderRadius: const BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, spreadRadius: 2)],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(Icons.home_outlined, 'Home', 0),
                _buildNavItem(Icons.menu, 'Expenses', 1),
                _buildCenterNavItem(Icons.lightbulb_outline, 2),
                _buildNavItem(Icons.access_time, 'Goals', 3), // Changed icon slightly to match design intent
                _buildNavItem(Icons.person_outline, 'Profile', 4),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Helper to build standard Nav Items
  Widget _buildNavItem(IconData icon, String label, int index) {
    final isSelected = index == _selectedIndex;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Navigating to $label')),
        );
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: isSelected ? const Color(0xFF00D296) : const Color(0xFF757575), size: 26),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: isSelected ? const Color(0xFF00D296) : const Color(0xFF757575),
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  // Helper to build the central highlighted Nav Item
  Widget _buildCenterNavItem(IconData icon, int index) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Center Action Tapped')),
        );
      },
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Glowing background
          Container(
            width: 55,
            height: 55,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF00D296).withOpacity(0.5),
                  blurRadius: 15,
                  spreadRadius: 2,
                ),
              ],
            ),
          ),
          // Actual button
          Container(
            width: 50,
            height: 50,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [Color(0xFFB9FBC0), Color(0xFF00D296)], // Light to dark green
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: const Icon(Icons.lightbulb_outline, color: Colors.black87, size: 28),
          ),
        ],
      ),
    );
  }

  // Helper to build a clean, tappable Card
  Widget _buildClickableCard({required Widget child, required VoidCallback onTap}) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        splashColor: const Color(0xFF00D296).withOpacity(0.1),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF161B1C),
            borderRadius: BorderRadius.circular(24),
          ),
          child: child,
        ),
      ),
    );
  }
}