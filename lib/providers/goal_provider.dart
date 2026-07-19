import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/goal_model.dart';

class GoalProvider extends ChangeNotifier {
  GoalProvider() {
    Future.microtask(_initialize);
  }

  static const String _storageKey =
      'alpha_saved_goals';

  // ================= CONTROLLERS =================

  final TextEditingController customNameController =
      TextEditingController();

  final TextEditingController amountController =
      TextEditingController();

  final TextEditingController targetDateController =
      TextEditingController();

  // ================= CREATE GOAL DATA =================

  String? selectedCategory;
  DateTime? targetDate;

  int priority = 5;
  double emergencyPercentage = 10;

  // ================= STATE =================

  bool _isLoading = false;

  bool get isLoading => _isLoading;

  bool _isSaving = false;

  bool get isSaving => _isSaving;

  bool _isInitialized = false;

  bool get isInitialized => _isInitialized;

  String? _errorMessage;

  String? get errorMessage => _errorMessage;

  // ================= GOALS =================

  final List<Goal> _goals = [];

  List<Goal> get goals {
    final sortedGoals =
        List<Goal>.from(_goals);

    sortedGoals.sort(
      (a, b) {
        final aDate =
            a.targetDate ?? DateTime(9999);

        final bDate =
            b.targetDate ?? DateTime(9999);

        return aDate.compareTo(bDate);
      },
    );

    return List.unmodifiable(sortedGoals);
  }

  List<Goal> get activeGoals {
    return goals
        .where(
          (goal) =>
              goal.isActive &&
              !goal.isCompleted,
        )
        .toList();
  }

  List<Goal> get completedGoals {
    return goals
        .where(
          (goal) =>
              !goal.isActive ||
              goal.isCompleted,
        )
        .toList();
  }

  int get activeGoalsCount =>
      activeGoals.length;

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

  // ================= INITIALIZE =================

  Future<void> _initialize() async {
    _isLoading = true;
    _errorMessage = null;

    notifyListeners();

    try {
      await loadGoals();
      _isInitialized = true;
    } catch (error) {
      _errorMessage =
          _cleanError(error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ================= LOCAL STORAGE =================

  Future<void> loadGoals() async {
    final preferences =
        await SharedPreferences.getInstance();

    final storedValue =
        preferences.getString(_storageKey);

    if (storedValue == null ||
        storedValue.trim().isEmpty) {
      _goals.clear();
      return;
    }

    final decoded =
        jsonDecode(storedValue);

    if (decoded is! List) {
      throw const FormatException(
        'Invalid saved goals format',
      );
    }

    final loadedGoals =
        decoded
            .whereType<Map>()
            .map(
              (item) =>
                  Goal.fromJson(
                Map<String, dynamic>.from(
                  item,
                ),
              ),
            )
            .where(
              (goal) =>
                  goal.id != null &&
                  goal.id!.trim().isNotEmpty,
            )
            .toList();

    _goals
      ..clear()
      ..addAll(loadedGoals);
  }

  Future<bool> _saveGoals() async {
    _isSaving = true;
    _errorMessage = null;

    notifyListeners();

    try {
      final preferences =
          await SharedPreferences.getInstance();

      final encoded = jsonEncode(
        _goals
            .map(
              (goal) =>
                  goal.toJson(),
            )
            .toList(),
      );

      final saved =
          await preferences.setString(
        _storageKey,
        encoded,
      );

      if (!saved) {
        throw Exception(
          'Could not save goals locally',
        );
      }

      return true;
    } catch (error) {
      _errorMessage =
          _cleanError(error);

      return false;
    } finally {
      _isSaving = false;
      notifyListeners();
    }
  }

  // ================= VALUES =================

  double get monthlySaving {
    final value = amountController.text
        .trim()
        .replaceAll(",", "");

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

    _errorMessage = null;

    notifyListeners();
  }

  void setPriority(int value) {
    priority = value;
    _errorMessage = null;

    notifyListeners();
  }

  void setEmergencyPercentage(
    double value,
  ) {
    emergencyPercentage = value;
    _errorMessage = null;

    notifyListeners();
  }

  void setDate(DateTime date) {
    targetDate = DateTime(
      date.year,
      date.month,
      date.day,
    );

    targetDateController.text =
        "${date.day}/${date.month}/${date.year}";

    _errorMessage = null;

    notifyListeners();
  }

  void refresh() {
    _errorMessage = null;
    notifyListeners();
  }

  // ================= VALIDATION =================

  bool get isValid {
    final categoryValid =
        selectedCategory != null;

    final customNameValid =
        selectedCategory != "Other" ||
            customNameController.text
                .trim()
                .isNotEmpty;

    final amountValid =
        monthlySaving > 0;

    final targetDateValid =
        targetDate != null;

    return categoryValid &&
        customNameValid &&
        amountValid &&
        targetDateValid;
  }

  String? get validationMessage {
    if (selectedCategory == null) {
      return "Please select a goal category";
    }

    if (selectedCategory == "Other" &&
        customNameController.text
            .trim()
            .isEmpty) {
      return "Please enter the goal name";
    }

    if (monthlySaving <= 0) {
      return "Please enter a valid monthly saving amount";
    }

    if (targetDate == null) {
      return "Please select a target date";
    }

    return null;
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
            customNameController.text
                .trim()
                .isNotEmpty)) {
      completedSteps++;
    }

    if (monthlySaving > 0) {
      completedSteps++;
    }

    if (targetDate != null) {
      completedSteps++;
    }

    final value =
        (2 / 3) +
            ((completedSteps / totalSteps) *
                (1 / 3));

    return value.clamp(
      0.0,
      1.0,
    );
  }

  // ================= CREATE MODEL =================

  Goal get currentGoal {
    return Goal(
      id: DateTime.now()
          .microsecondsSinceEpoch
          .toString(),

      category:
          selectedCategory ?? "",

      customName:
          selectedCategory == "Other"
              ? customNameController.text
                  .trim()
              : null,

      monthlySaving:
          monthlySaving,

      priority:
          priority,

      targetDate:
          targetDate,

      savedAmount:
          null,

      targetAmount:
          null,

      recommendedMonthlySaving:
          null,

      isActive:
          true,
    );
  }

  Goal get goal => currentGoal;

  // ================= SAVE CURRENT GOAL =================

  Future<bool> saveCurrentGoal() async {
    if (!isValid) {
      _errorMessage =
          validationMessage;

      notifyListeners();

      return false;
    }

    final newGoal =
        currentGoal;

    _goals.add(newGoal);

    notifyListeners();

    final saved =
        await _saveGoals();

    if (!saved) {
      _goals.removeWhere(
        (goal) =>
            goal.id == newGoal.id,
      );

      notifyListeners();

      return false;
    }

    clearForm(
      notify: false,
    );

    notifyListeners();

    return true;
  }

  // ================= SET / ADD DATA =================

  Future<bool> setGoals(
    List<Goal> goals,
  ) async {
    final backup =
        List<Goal>.from(_goals);

    _goals
      ..clear()
      ..addAll(goals);

    notifyListeners();

    final saved =
        await _saveGoals();

    if (!saved) {
      _goals
        ..clear()
        ..addAll(backup);

      notifyListeners();

      return false;
    }

    return true;
  }

  Future<bool> addGoal(
    Goal goal,
  ) async {
    _goals.add(goal);

    notifyListeners();

    final saved =
        await _saveGoals();

    if (!saved) {
      _goals.removeWhere(
        (item) =>
            item.id == goal.id,
      );

      notifyListeners();

      return false;
    }

    return true;
  }

  Future<bool> addGoals(
    List<Goal> goals,
  ) async {
    final backup =
        List<Goal>.from(_goals);

    _goals.addAll(goals);

    notifyListeners();

    final saved =
        await _saveGoals();

    if (!saved) {
      _goals
        ..clear()
        ..addAll(backup);

      notifyListeners();

      return false;
    }

    return true;
  }

  // ================= UPDATE =================

  Future<bool> updateGoal(
    Goal updatedGoal,
  ) async {
    final index =
        _goals.indexWhere(
      (goal) =>
          goal.id == updatedGoal.id,
    );

    if (index == -1) {
      _errorMessage =
          "Goal not found";

      notifyListeners();

      return false;
    }

    final oldGoal =
        _goals[index];

    _goals[index] =
        updatedGoal;

    notifyListeners();

    final saved =
        await _saveGoals();

    if (!saved) {
      _goals[index] = oldGoal;
      notifyListeners();

      return false;
    }

    return true;
  }

  Future<bool> updateGoalProgress({
    required String goalId,
    required double savedAmount,
    required double targetAmount,
    double? recommendedMonthlySaving,
  }) async {
    final index =
        _goals.indexWhere(
      (goal) =>
          goal.id == goalId,
    );

    if (index == -1) {
      return false;
    }

    final oldGoal =
        _goals[index];

    _goals[index] =
        oldGoal.copyWith(
      savedAmount:
          savedAmount,
      targetAmount:
          targetAmount,
      recommendedMonthlySaving:
          recommendedMonthlySaving,
    );

    notifyListeners();

    final saved =
        await _saveGoals();

    if (!saved) {
      _goals[index] = oldGoal;
      notifyListeners();

      return false;
    }

    return true;
  }

  Future<bool> addSavingToGoal({
    required String goalId,
    required double amount,
  }) async {
    if (amount <= 0) {
      return false;
    }

    final index =
        _goals.indexWhere(
      (goal) =>
          goal.id == goalId,
    );

    if (index == -1) {
      return false;
    }

    final oldGoal =
        _goals[index];

    final currentSavedAmount =
        oldGoal.savedAmount ?? 0;

    _goals[index] =
        oldGoal.copyWith(
      savedAmount:
          currentSavedAmount + amount,
    );

    notifyListeners();

    final saved =
        await _saveGoals();

    if (!saved) {
      _goals[index] = oldGoal;
      notifyListeners();

      return false;
    }

    return true;
  }

  // ================= COMPLETE =================

  Future<bool> markGoalCompleted(
    String goalId,
  ) async {
    final index =
        _goals.indexWhere(
      (goal) =>
          goal.id == goalId,
    );

    if (index == -1) {
      return false;
    }

    final oldGoal =
        _goals[index];

    _goals[index] =
        oldGoal.copyWith(
      isActive: false,
    );

    notifyListeners();

    final saved =
        await _saveGoals();

    if (!saved) {
      _goals[index] = oldGoal;
      notifyListeners();

      return false;
    }

    return true;
  }

  // ================= DELETE =================

  Future<bool> removeGoal(
    String goalId,
  ) async {
    final index =
        _goals.indexWhere(
      (goal) =>
          goal.id == goalId,
    );

    if (index == -1) {
      return false;
    }

    final removedGoal =
        _goals.removeAt(index);

    notifyListeners();

    final saved =
        await _saveGoals();

    if (!saved) {
      _goals.insert(
        index,
        removedGoal,
      );

      notifyListeners();

      return false;
    }

    return true;
  }

  // ================= CLEAR ALL =================

  Future<bool> clearAllGoals() async {
    final backup =
        List<Goal>.from(_goals);

    _goals.clear();

    notifyListeners();

    final saved =
        await _saveGoals();

    if (!saved) {
      _goals.addAll(backup);
      notifyListeners();

      return false;
    }

    return true;
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
    _errorMessage = null;

    if (notify) {
      notifyListeners();
    }
  }

  // ================= API BODY =================

  Map<String, dynamic> get data {
    return currentGoal.toJson();
  }

  // ================= ERROR =================

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  String _cleanError(
    Object error,
  ) {
    return error
        .toString()
        .replaceFirst(
          'Exception: ',
          '',
        );
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