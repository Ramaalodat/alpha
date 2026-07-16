import 'package:alpha_app/services/api_exception.dart';
import 'package:alpha_app/services/api_service.dart';

class OnboardingService {
  static Future<Map<String, dynamic>> getStatus() async {
    final response = await ApiService.get('/onboarding/status');
    final result = await ApiService.parseJson(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = result['data'];
      return data is Map
          ? Map<String, dynamic>.from(data)
          : <String, dynamic>{};
    }
    _throwApiException(result, 'Failed to load onboarding status');
  }

  static Future<Map<String, dynamic>> completeFinancialInfo({
    required double monthlyIncome,
    required double basicExpenses,
    required String financialGoal,
    required String primarySpendingCategory,
    String? relationshipWithMoney,
    double? monthlyExtraSavingsGoal,
    String? mainFinancialGoal12M,
    List<Map<String, dynamic>>? incomeSources,
    List<Map<String, dynamic>>? fixedExpenses,
    List<Map<String, dynamic>>? variableExpenses,
    int? pinnedMonths,
  }) async {
    final body = <String, dynamic>{
      'monthlyIncome': monthlyIncome,
      'basicExpenses': basicExpenses,
      'financialGoal': financialGoal,
      'primarySpendingCategory': primarySpendingCategory,
    };

    if (relationshipWithMoney != null) {
      body['relationshipWithMoney'] = relationshipWithMoney;
    }
    if (monthlyExtraSavingsGoal != null) {
      body['monthlyExtraSavingsGoal'] = monthlyExtraSavingsGoal;
    }
    if (mainFinancialGoal12M != null) {
      body['mainFinancialGoal12M'] = mainFinancialGoal12M;
    }
    if (incomeSources != null) body['incomeSources'] = incomeSources;
    if (fixedExpenses != null) body['fixedExpenses'] = fixedExpenses;
    if (variableExpenses != null) body['variableExpenses'] = variableExpenses;
    if (pinnedMonths != null) body['pinnedMonths'] = pinnedMonths;

    final response =
        await ApiService.post('/onboarding/financial-info', body: body);
    final result = await ApiService.parseJson(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return result;
    }
    _throwApiException(result, 'Failed to save financial info');
  }

  static Future<Map<String, dynamic>> createFirstGoal({
    required String icon,
    required String name,
    required double targetAmount,
    required String targetDate,
    String? flexibility,
  }) async {
    final body = <String, dynamic>{
      'icon': icon,
      'name': name,
      'targetAmount': targetAmount,
      'targetDate': targetDate,
    };
    if (flexibility != null) body['flexibility'] = flexibility;

    final response =
        await ApiService.post('/onboarding/first-goal', body: body);
    final result = await ApiService.parseJson(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return result;
    }
    _throwApiException(result, 'Failed to create goal');
  }

  static Future<Map<String, dynamic>> getRecommendedGoals() async {
    final response = await ApiService.get('/onboarding/recommended-goals');
    final result = await ApiService.parseJson(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = result['data'];
      return data is Map
          ? Map<String, dynamic>.from(data)
          : <String, dynamic>{};
    }
    _throwApiException(result, 'Failed to load recommendations');
  }

  static Future<Map<String, dynamic>> skipOnboarding() async {
    final response = await ApiService.post('/onboarding/skip');
    final result = await ApiService.parseJson(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return result;
    }
    _throwApiException(result, 'Failed to skip onboarding');
  }

  /// Parse backend error response and throw [ApiException].
  /// Never returns – always throws.
  static Never _throwApiException(Map<String, dynamic> body, String fallback) {
    final error = body['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ?? body['message'] ?? fallback,
      code: error?['code'] as String?,
      details: error?['details'] as Map<String, dynamic>?,
    );
  }
}
