import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/main/expenses_screen.dart';
import 'package:alpha_app/screens/main/goals_screen.dart';
import 'package:alpha_app/screens/main/incomes_screen.dart';
import 'package:alpha_app/screens/main/notifications_screen.dart';
import 'package:alpha_app/screens/profile/profile_screen.dart';
import 'package:alpha_app/services/dashboard_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<Map<String, dynamic>> _dashboardFuture;
  bool _hasLoadedOnce = false;

  Future<Map<String, dynamic>> _loadAllData() async {
    final dashboard = await DashboardService.loadDashboard();
    final buckets = await DashboardService.loadBucketBalances();
    return {
      'dashboard': dashboard,
      'buckets': buckets,
    };
  }

  @override
  void initState() {
    super.initState();
    _dashboardFuture = _loadAllData();
  }

  /// Re-fetch dashboard data every time the screen becomes visible again
  /// (e.g. after returning from profile, expenses, incomes, goals screens).
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_hasLoadedOnce) {
      _refreshDashboard();
    }
  }

  void _refreshDashboard() {
    setState(() {
      _dashboardFuture = _loadAllData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenW = Device.width(context);
    final screenH = Device.height(context);
    final theme = Provider.of<Themeprovider>(context);

    return Scaffold(
      backgroundColor:
          theme.isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Dashboard',
          style: TextStyle(
            color: theme.isDark ? AppColors.darkText : AppColors.lightText,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const ProfileScreen())),
            icon: Icon(Icons.person_outline,
                color: theme.isDark
                    ? AppColors.darkSecondary
                    : AppColors.lightSecondary),
          ),
          IconButton(
            onPressed: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const NotificationsScreen())),
            icon: Icon(Icons.notifications_none,
                color: theme.isDark
                    ? AppColors.darkSecondary
                    : AppColors.lightSecondary),
          ),
        ],
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _dashboardFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Text(
                'Unable to load dashboard right now',
                style: TextStyle(
                    color: theme.isDark
                        ? AppColors.darkText
                        : AppColors.lightText),
              ),
            );
          }

          final result = snapshot.data ?? {};
          final data = result['dashboard'] ?? {};
          final buckets = result['buckets'] as List<dynamic>? ?? [];

          _hasLoadedOnce = true;
          final user = Map<String, dynamic>.from(data['user'] ?? {});
          final goals = Map<String, dynamic>.from(data['goals'] ?? {});
          final expenses = Map<String, dynamic>.from(data['expenses'] ?? {});
          final incomes = Map<String, dynamic>.from(data['incomes'] ?? {});

          final fullName = user['fullName'] ?? '';
          final monthlyIncome = _num(user['monthlyIncome']);
          final basicExpenses = _num(user['basicExpenses']);
          final monthlyExpensesTotal = _num(expenses['monthlyExpenses']);
          final monthlyIncomeTotal = _num(incomes['monthlyIncomeTotal']);
          final monthlyBalance =
              monthlyIncome - basicExpenses - monthlyExpensesTotal;
          final totalGoals = (goals['totalGoals'] as num?)?.toInt() ?? 0;
          final activeGoals = (goals['activeGoals'] as num?)?.toInt() ?? 0;
          final overallProgress = _num(goals['overallProgress']);
          final totalSaved = _num(goals['totalSaved']);
          final totalTarget = _num(goals['totalTarget']);
          final remainingBudget = _num(expenses['remainingBudget']);

          return RefreshIndicator(
            onRefresh: () async => _refreshDashboard(),
            color:
                theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.all(screenW * 0.05),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if ((data['currentProfile']
                          as Map?)?['primarySpendingCategory'] ==
                      'غير محدد')
                    _buildCompleteProfileBanner(theme, screenW),
                  _buildHeroCard(theme, screenW, screenH, fullName,
                      monthlyBalance, monthlyIncome),
                  SizedBox(height: screenH * 0.02),
                  Row(
                    children: [
                      Expanded(
                          child: _buildStatCard(
                              theme,
                              'Expenses',
                              _fmt(monthlyExpensesTotal),
                              Icons.payments_outlined)),
                      SizedBox(width: screenW * 0.03),
                      Expanded(
                          child: _buildStatCard(
                              theme,
                              'Total Income',
                              _fmt(monthlyIncomeTotal),
                              Icons.account_balance_wallet_outlined)),
                    ],
                  ),
                  SizedBox(height: screenH * 0.02),
                  // Goals card
                  _buildGoalsCard(theme, screenW, totalGoals, activeGoals,
                      overallProgress, totalSaved, totalTarget),
                  SizedBox(height: screenH * 0.02),
                  // Budget card
                  _buildBudgetCard(theme, screenW, monthlyIncome, basicExpenses,
                      monthlyExpensesTotal, remainingBudget),
                  SizedBox(height: screenH * 0.02),
                  // Bucket Balances
                  if (buckets.isNotEmpty)
                    _buildBucketsCard(theme, screenW, buckets),
                  if (buckets.isNotEmpty) SizedBox(height: screenH * 0.02),
                  Text('Quick actions',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: theme.isDark
                              ? AppColors.darkText
                              : AppColors.lightText)),
                  SizedBox(height: screenH * 0.01),
                  Wrap(
                    spacing: screenW * 0.03,
                    runSpacing: screenH * 0.015,
                    children: [
                      _buildActionChip(context, theme, 'Expenses',
                          Icons.trending_down, const ExpensesScreen()),
                      _buildActionChip(context, theme, 'Incomes',
                          Icons.trending_up, const IncomesScreen()),
                      _buildActionChip(context, theme, 'Goals', Icons.flag,
                          const GoalsScreen()),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCompleteProfileBanner(Themeprovider theme, double w) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.isDark
            ? AppColors.darkPrimary.withOpacity(0.2)
            : AppColors.lightPrimary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color:
                theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline,
              color: theme.isDark
                  ? AppColors.darkPrimary
                  : AppColors.lightPrimary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'أكمل بيانات ملفك الشخصي',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color:
                        theme.isDark ? AppColors.darkText : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'احصل على تجربة أفضل بإكمال بياناتك',
                  style: TextStyle(
                    fontSize: 12,
                    color: theme.isDark
                        ? AppColors.darkSubText
                        : AppColors.lightSubText,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pushNamed(context, '/onboarding/demographics')
                  .then((_) => _refreshDashboard());
            },
            child: Text(
              'إكمال',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: theme.isDark
                    ? AppColors.darkPrimary
                    : AppColors.lightPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroCard(Themeprovider theme, double screenW, double screenH,
      String name, double monthlyBalance, double monthlyIncome) {
    final greeting = name.isNotEmpty ? 'Welcome back, $name' : 'Welcome back';
    final statusText = monthlyBalance >= 0
        ? 'Your finances are on track'
        : 'Spending exceeds your budget';
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(screenW * 0.05),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [
          theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
          theme.isDark ? AppColors.darkSecondary : AppColors.lightSecondary
        ]),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(greeting, style: TextStyle(color: Colors.white, fontSize: 16)),
          SizedBox(height: screenH * 0.008),
          Text(statusText,
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold)),
          SizedBox(height: screenH * 0.015),
          Text('Monthly balance: ${_fmt(monthlyBalance)}',
              style: TextStyle(color: Colors.white, fontSize: 18)),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      Themeprovider theme, String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
            color: theme.isDark ? AppColors.darkBorder : AppColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon,
              color: theme.isDark
                  ? AppColors.darkSecondary
                  : AppColors.lightSecondary),
          const SizedBox(height: 12),
          Text(title,
              style: TextStyle(
                  color: theme.isDark
                      ? AppColors.darkSubText
                      : AppColors.lightSubText)),
          const SizedBox(height: 4),
          Text(value,
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color:
                      theme.isDark ? AppColors.darkText : AppColors.lightText)),
        ],
      ),
    );
  }

  Widget _buildActionChip(BuildContext context, Themeprovider theme,
      String label, IconData icon, Widget screen) {
    return InkWell(
      onTap: () =>
          Navigator.push(context, MaterialPageRoute(builder: (_) => screen)),
      child: Container(
        width: 140,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: theme.isDark ? AppColors.darkCard : AppColors.lightCard,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
              color:
                  theme.isDark ? AppColors.darkBorder : AppColors.lightBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon,
                color: theme.isDark
                    ? AppColors.darkSecondary
                    : AppColors.lightSecondary),
            const SizedBox(height: 8),
            Text(label,
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: theme.isDark
                        ? AppColors.darkText
                        : AppColors.lightText)),
          ],
        ),
      ),
    );
  }

  Widget _buildGoalsCard(
      Themeprovider theme,
      double screenW,
      int totalGoals,
      int activeGoals,
      double overallProgress,
      double totalSaved,
      double totalTarget) {
    final text = theme.isDark ? AppColors.darkText : AppColors.lightText;
    final sub = theme.isDark ? AppColors.darkSubText : AppColors.lightSubText;
    final card = theme.isDark ? AppColors.darkCard : AppColors.lightCard;
    final border = theme.isDark ? AppColors.darkBorder : AppColors.lightBorder;
    final secondary =
        theme.isDark ? AppColors.darkSecondary : AppColors.lightSecondary;

    return Container(
      padding: EdgeInsets.all(screenW * 0.04),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.flag, color: secondary, size: 22),
              SizedBox(width: 8),
              Text('Goals',
                  style: TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold, color: text)),
              const Spacer(),
              Text('$activeGoals / $totalGoals active',
                  style: TextStyle(color: sub, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 12),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value:
                  totalTarget > 0 ? (overallProgress / 100).clamp(0.0, 1.0) : 0,
              minHeight: 10,
              backgroundColor: sub.withValues(alpha: 0.1),
              valueColor: AlwaysStoppedAnimation(secondary),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Saved: ${_fmt(totalSaved)}',
                  style: TextStyle(color: text, fontWeight: FontWeight.w600)),
              Text('Target: ${_fmt(totalTarget)}',
                  style: TextStyle(color: sub)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBudgetCard(
      Themeprovider theme,
      double screenW,
      double monthlyIncome,
      double basicExpenses,
      double monthlyExpensesTotal,
      double remainingBudget) {
    final text = theme.isDark ? AppColors.darkText : AppColors.lightText;
    final sub = theme.isDark ? AppColors.darkSubText : AppColors.lightSubText;
    final card = theme.isDark ? AppColors.darkCard : AppColors.lightCard;
    final border = theme.isDark ? AppColors.darkBorder : AppColors.lightBorder;
    final secondary =
        theme.isDark ? AppColors.darkSecondary : AppColors.lightSecondary;

    return Container(
      padding: EdgeInsets.all(screenW * 0.04),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.account_balance_wallet, color: secondary, size: 22),
              SizedBox(width: 8),
              Text('Budget',
                  style: TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold, color: text)),
            ],
          ),
          const SizedBox(height: 12),
          _budgetRow('Monthly Income', _fmt(monthlyIncome), text, sub),
          _budgetRow('Basic Expenses', _fmt(basicExpenses), text, sub),
          _budgetRow('Spent This Month', _fmt(monthlyExpensesTotal), text, sub),
          Divider(color: border, height: 20),
          _budgetRow('Remaining', _fmt(remainingBudget), text, sub, bold: true),
        ],
      ),
    );
  }

  Widget _budgetRow(String label, String value, Color text, Color sub,
      {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: sub, fontSize: 14)),
          Text(value,
              style: TextStyle(
                  color: text,
                  fontSize: 14,
                  fontWeight: bold ? FontWeight.bold : FontWeight.w500)),
        ],
      ),
    );
  }

  double _num(dynamic v) => (v as num?)?.toDouble() ?? 0;

  String _fmt(double v) {
    if (v == v.roundToDouble()) return v.toInt().toString();
    return v.toStringAsFixed(2);
  }

  Widget _buildBucketsCard(
      Themeprovider theme, double screenW, List<dynamic> buckets) {
    final text = theme.isDark ? AppColors.darkText : AppColors.lightText;
    final sub = theme.isDark ? AppColors.darkSubText : AppColors.lightSubText;
    final card = theme.isDark ? AppColors.darkCard : AppColors.lightCard;
    final border = theme.isDark ? AppColors.darkBorder : AppColors.lightBorder;
    final secondary =
        theme.isDark ? AppColors.darkSecondary : AppColors.lightSecondary;

    return Container(
      padding: EdgeInsets.all(screenW * 0.04),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.pie_chart_outline, color: secondary, size: 22),
              const SizedBox(width: 8),
              Text('Bucket Balances',
                  style: TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold, color: text)),
            ],
          ),
          const SizedBox(height: 16),
          ...buckets.map((b) {
            final bucketName = b['bucket'] ?? '';
            final balance = _num(b['balance']);
            final cap = _num(b['cap']);
            final spent = _num(b['spent']);
            final percentage = cap > 0 ? (spent / cap).clamp(0.0, 1.0) : 0.0;

            Color barColor = secondary;
            if (percentage > 0.9) {
              barColor = Colors.redAccent;
            } else if (percentage > 0.75) barColor = Colors.orangeAccent;

            return Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(bucketName,
                          style: TextStyle(
                              color: text, fontWeight: FontWeight.w600)),
                      Text('${_fmt(balance)} left',
                          style: TextStyle(
                              color: text, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: percentage,
                      minHeight: 8,
                      backgroundColor: sub.withValues(alpha: 0.1),
                      valueColor: AlwaysStoppedAnimation(barColor),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${_fmt(spent)} spent',
                          style: TextStyle(color: sub, fontSize: 12)),
                      Text('${_fmt(cap)} cap',
                          style: TextStyle(color: sub, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
