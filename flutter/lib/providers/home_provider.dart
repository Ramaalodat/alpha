import 'package:alpha_app/models/home_model.dart';
import 'package:alpha_app/services/dashboard_service.dart';
import 'package:alpha_app/services/finance_service.dart';
import 'package:flutter/material.dart';

class HomeProvider extends ChangeNotifier {
  HomeModel? _homeData;

  HomeModel? get homeData => _homeData;

  bool _isLoading = false;

  bool get isLoading => _isLoading;

  String? _errorMessage;

  String? get errorMessage => _errorMessage;

  bool get hasData => _homeData != null;

  bool get hasError {
    return _errorMessage != null && _errorMessage!.isNotEmpty;
  }

  // ================= FETCH DATA =================

  Future<void> loadHomeData() async {
    if (_isLoading) {
      return;
    }

    _isLoading = true;
    _errorMessage = null;

    notifyListeners();

    try {
      final results = await Future.wait([
        DashboardService.loadDashboard(),
        DashboardService.loadHealthScore(),
        DashboardService.loadInsights(),
        FinanceService.loadGoals().catchError((_) => <dynamic>[]),
      ]);

      final dashboard = results[0] as Map<String, dynamic>;
      final healthScore = results[1] as Map<String, dynamic>;
      final insights = results[2] as List<dynamic>;
      final goalsList = results[3] as List<dynamic>;

      // Extract user name
      final String fullName = dashboard['user']?['fullName'] ?? "User";
      final String firstName = fullName.split(' ').first;

      // Extract summary
      final double income = double.tryParse((dashboard['incomes']?['monthlyIncomeTotal'] ?? dashboard['user']?['monthlyIncome'] ?? 0).toString()) ?? 0.0;
      final double expenses = double.tryParse((dashboard['expenses']?['monthlyExpenses'] ?? 0).toString()) ?? 0.0;
      final double savings = (income - expenses) > 0 ? (income - expenses) : 0.0;

      // Extract health score
      final int score = int.tryParse((healthScore['score'] ?? 85).toString()) ?? 85;

      // Extract today insight
      String insightStr = "Welcome back to BASIRA! Take a moment to review your recent expenses.";
      if (insights.isNotEmpty && insights.first['description'] != null) {
        insightStr = insights.first['description'];
      } else if (healthScore['recommendations'] != null && (healthScore['recommendations'] as List).isNotEmpty) {
        insightStr = (healthScore['recommendations'] as List).first.toString();
      }

      // Extract active goal
      HomeGoal? homeGoal;
      final activeGoals = goalsList.where((g) => g['status'] == 'ACTIVE').toList();
      if (activeGoals.isNotEmpty) {
        final activeGoal = activeGoals.first;
        final target = double.tryParse((activeGoal['targetAmount'] ?? 0).toString()) ?? 0;
        final current = double.tryParse((activeGoal['currentAmount'] ?? 0).toString()) ?? 0;
        final progress = target > 0 ? (current / target) : 0.0;
        
        homeGoal = HomeGoal(
          id: activeGoal['id']?.toString() ?? "1",
          name: activeGoal['name']?.toString() ?? "Goal",
          progress: progress,
        );
      }

      _homeData = HomeModel(
        userName: firstName,
        financialScore: score,
        income: income,
        expenses: expenses,
        savings: savings,
        todayInsight: insightStr,
        goal: homeGoal,
        challenge: null,
      );
    } catch (error) {
      _errorMessage = "Failed to load home data";
    } finally {
      _isLoading = false;

      notifyListeners();
    }
  }

  // ================= UPDATE DATA =================

  void setHomeData(
    HomeModel homeData,
  ) {
    _homeData = homeData;
    _errorMessage = null;

    notifyListeners();
  }

  void updateFinancialScore(
    int score,
  ) {
    if (_homeData == null) {
      return;
    }

    _homeData = HomeModel(
      userName: _homeData!.userName,
      financialScore: score.clamp(0, 100),
      income: _homeData!.income,
      expenses: _homeData!.expenses,
      savings: _homeData!.savings,
      todayInsight: _homeData!.todayInsight,
      goal: _homeData!.goal,
      challenge: _homeData!.challenge,
    );

    notifyListeners();
  }

  void updateSummary({
    double? income,
    double? expenses,
    double? savings,
  }) {
    if (_homeData == null) {
      return;
    }

    _homeData = HomeModel(
      userName: _homeData!.userName,
      financialScore: _homeData!.financialScore,
      income: income ?? _homeData!.income,
      expenses: expenses ?? _homeData!.expenses,
      savings: savings ?? _homeData!.savings,
      todayInsight: _homeData!.todayInsight,
      goal: _homeData!.goal,
      challenge: _homeData!.challenge,
    );

    notifyListeners();
  }

  void updateInsight(
    String insight,
  ) {
    if (_homeData == null) {
      return;
    }

    _homeData = HomeModel(
      userName: _homeData!.userName,
      financialScore: _homeData!.financialScore,
      income: _homeData!.income,
      expenses: _homeData!.expenses,
      savings: _homeData!.savings,
      todayInsight: insight,
      goal: _homeData!.goal,
      challenge: _homeData!.challenge,
    );

    notifyListeners();
  }

  void updateGoal(
    HomeGoal? goal,
  ) {
    if (_homeData == null) {
      return;
    }

    _homeData = HomeModel(
      userName: _homeData!.userName,
      financialScore: _homeData!.financialScore,
      income: _homeData!.income,
      expenses: _homeData!.expenses,
      savings: _homeData!.savings,
      todayInsight: _homeData!.todayInsight,
      goal: goal,
      challenge: _homeData!.challenge,
    );

    notifyListeners();
  }

  void updateChallenge(
    HomeChallenge? challenge,
  ) {
    if (_homeData == null) {
      return;
    }

    _homeData = HomeModel(
      userName: _homeData!.userName,
      financialScore: _homeData!.financialScore,
      income: _homeData!.income,
      expenses: _homeData!.expenses,
      savings: _homeData!.savings,
      todayInsight: _homeData!.todayInsight,
      goal: _homeData!.goal,
      challenge: challenge,
    );

    notifyListeners();
  }

  // ================= ERROR =================

  void setError(
    String message,
  ) {
    _errorMessage = message;
    _isLoading = false;

    notifyListeners();
  }

  // ================= CLEAR =================

  void clear() {
    _homeData = null;
    _errorMessage = null;
    _isLoading = false;

    notifyListeners();
  }
}
