import 'package:alpha_app/models/home_model.dart';
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
    return _errorMessage != null &&
        _errorMessage!.isNotEmpty;
  }

  // ================= TEMPORARY DATA =================

  Future<void> loadHomeData() async {
    if (_isLoading) {
      return;
    }

    _isLoading = true;
    _errorMessage = null;

    notifyListeners();

    try {
      await Future.delayed(
        const Duration(milliseconds: 500),
      );

      _homeData = const HomeModel(
        userName: "Mariam",
        financialScore: 85,
        income: 950,
        expenses: 286,
        savings: 664,
        todayInsight:
            "Your spending increased this week. Try to reduce unnecessary purchases.",

        goal: HomeGoal(
          id: "1",
          name: "Laptop",
          progress: 0.70,
        ),

        challenge: HomeChallenge(
          id: "1",
          name: "Reduce expenses",
          progress: 0.80,
        ),
      );
    } catch (error) {
      _errorMessage =
          "Failed to load home data";
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
      financialScore:
          _homeData!.financialScore,
      income: income ?? _homeData!.income,
      expenses:
          expenses ?? _homeData!.expenses,
      savings:
          savings ?? _homeData!.savings,
      todayInsight:
          _homeData!.todayInsight,
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
      financialScore:
          _homeData!.financialScore,
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
      financialScore:
          _homeData!.financialScore,
      income: _homeData!.income,
      expenses: _homeData!.expenses,
      savings: _homeData!.savings,
      todayInsight:
          _homeData!.todayInsight,
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
      financialScore:
          _homeData!.financialScore,
      income: _homeData!.income,
      expenses: _homeData!.expenses,
      savings: _homeData!.savings,
      todayInsight:
          _homeData!.todayInsight,
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