import 'package:flutter/material.dart';
import '../models/goal_model.dart';

class GoalProvider extends ChangeNotifier {
  // ================= CONTROLLERS =================

  final TextEditingController customNameController = TextEditingController();

  final TextEditingController amountController = TextEditingController();

  final TextEditingController targetDateController = TextEditingController();

  // ================= CREATE GOAL DATA =================

  String? selectedCategory;
  DateTime? targetDate;

  int priority = 5;
  double emergencyPercentage = 10;

  // ================= GOALS =================

  final List<Goal> _goals = [];

  List<Goal> get goals => List.unmodifiable(_goals);

  List<Goal> get activeGoals {
    return _goals.where((goal) => goal.isActive && !goal.isCompleted).toList();
  }

  List<Goal> get completedGoals {
    return _goals.where((goal) => !goal.isActive || goal.isCompleted).toList();
  }

  int get activeGoalsCount => activeGoals.length;

  // ================= CATEGORIES =================

  final List<String> goalCategories = [
    "Emergency Fund",
    "Laptop",
    "Travel",
    "Car",
    "Education",
    "House",
    "Business",
    "Furniture",
    "Other",
  ];

  // ================= VALUES =================

  double get monthlySaving {
    final value = amountController.text.trim().replaceAll(",", "");

    return double.tryParse(value) ?? 0;
  }

  String get goalName {
    if (selectedCategory == "Other") {
      return customNameController.text.trim();
    }

    return selectedCategory ?? "";
  }

  // ================= SETTERS =================

  void setCategory(String value) {
    selectedCategory = value;

    if (value != "Other") {
      customNameController.clear();
    }

    notifyListeners();
  }

  void setPriority(int value) {
    priority = value;
    notifyListeners();
  }

  void setEmergencyPercentage(double value) {
    emergencyPercentage = value;
    notifyListeners();
  }

  void setDate(DateTime date) {
    targetDate = date;

    targetDateController.text = "${date.day}/${date.month}/${date.year}";

    notifyListeners();
  }

  void refresh() {
    notifyListeners();
  }

  // ================= VALIDATION =================

  bool get isValid {
    final categoryValid = selectedCategory != null;

    final customNameValid = selectedCategory != "Other" ||
        customNameController.text.trim().isNotEmpty;

    final amountValid = monthlySaving > 0;

    final targetDateValid = targetDate != null;

    return categoryValid && customNameValid && amountValid && targetDateValid;
  }

  // ================= PAGE PROGRESS =================

  double get pageProgress {
    const int totalSteps = 4;
    int completedSteps = 0;

    if (selectedCategory != null) {
      completedSteps++;
    }

    if (selectedCategory != null &&
        (selectedCategory != "Other" ||
            customNameController.text.trim().isNotEmpty)) {
      completedSteps++;
    }

    if (monthlySaving > 0) {
      completedSteps++;
    }

    if (targetDate != null) {
      completedSteps++;
    }

    final value = (2 / 3) + ((completedSteps / totalSteps) * (1 / 3));

    return value.clamp(0.0, 1.0);
  }

  // ================= CREATE MODEL =================

  Goal get currentGoal {
    return Goal(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      category: selectedCategory ?? "",
      customName:
          selectedCategory == "Other" ? customNameController.text.trim() : null,
      monthlySaving: monthlySaving,
      priority: priority,
      targetDate: targetDate,

      /// ترجع لاحقًا من الباك إند.
      savedAmount: null,
      targetAmount: null,
      recommendedMonthlySaving: null,

      isActive: true,
    );
  }

  /// لدعم الكود القديم عندك.
  Goal get goal => currentGoal;

  // ================= SAVE =================

  bool saveCurrentGoal() {
    if (!isValid) {
      return false;
    }

    final newGoal = currentGoal;

    _goals.add(newGoal);

    clearForm(
      notify: false,
    );

    notifyListeners();

    return true;
  }

  // ================= BACKEND DATA =================

  void setGoals(List<Goal> goals) {
    _goals
      ..clear()
      ..addAll(goals);

    notifyListeners();
  }

  void addGoal(Goal goal) {
    _goals.add(goal);
    notifyListeners();
  }

  void addGoals(List<Goal> goals) {
    _goals.addAll(goals);
    notifyListeners();
  }

  // ================= UPDATE =================

  void updateGoal(Goal updatedGoal) {
    final index = _goals.indexWhere(
      (goal) => goal.id == updatedGoal.id,
    );

    if (index == -1) {
      return;
    }

    _goals[index] = updatedGoal;

    notifyListeners();
  }

  void updateGoalProgress({
    required String goalId,
    required double savedAmount,
    required double targetAmount,
    double? recommendedMonthlySaving,
  }) {
    final index = _goals.indexWhere(
      (goal) => goal.id == goalId,
    );

    if (index == -1) {
      return;
    }

    _goals[index] = _goals[index].copyWith(
      savedAmount: savedAmount,
      targetAmount: targetAmount,
      recommendedMonthlySaving: recommendedMonthlySaving,
    );

    notifyListeners();
  }

  void addSavingToGoal({
    required String goalId,
    required double amount,
  }) {
    if (amount <= 0) {
      return;
    }

    final index = _goals.indexWhere(
      (goal) => goal.id == goalId,
    );

    if (index == -1) {
      return;
    }

    final selectedGoal = _goals[index];
    final currentSavedAmount = selectedGoal.savedAmount ?? 0;

    _goals[index] = selectedGoal.copyWith(
      savedAmount: currentSavedAmount + amount,
    );

    notifyListeners();
  }

  // ================= COMPLETE =================

  void markGoalCompleted(String goalId) {
    final index = _goals.indexWhere(
      (goal) => goal.id == goalId,
    );

    if (index == -1) {
      return;
    }

    _goals[index] = _goals[index].copyWith(
      isActive: false,
    );

    notifyListeners();
  }

  // ================= DELETE =================

  void removeGoal(String goalId) {
    _goals.removeWhere(
      (goal) => goal.id == goalId,
    );

    notifyListeners();
  }

  // ================= CLEAR FORM =================

  void clearForm({
    bool notify = true,
  }) {
    customNameController.clear();
    amountController.clear();
    targetDateController.clear();

    selectedCategory = null;
    targetDate = null;
    priority = 5;
    emergencyPercentage = 10;

    if (notify) {
      notifyListeners();
    }
  }

  // ================= API BODY =================

  Map<String, dynamic> get data {
    return currentGoal.toJson();
  }

  // ================= DISPOSE =================

  @override
  void dispose() {
    customNameController.dispose();
    amountController.dispose();
    targetDateController.dispose();

    super.dispose();
  }
}
