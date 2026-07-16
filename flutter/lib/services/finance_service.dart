import 'package:alpha_app/services/api_service.dart';

class FinanceService {
  static Future<List<dynamic>> loadExpenses() async {
    final response = await ApiService.get('/expenses');
    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return List<dynamic>.from(body['data'] ?? []);
    }
    throw Exception(body['message'] ?? 'Failed to load expenses');
  }

  static Future<Map<String, dynamic>> createExpense({
    required String categoryId,
    required double amount,
    String? description,
    String? expenseDate,
    String? paymentMethod,
  }) async {
    final body = <String, dynamic>{
      'categoryId': categoryId,
      'amount': amount,
    };
    if (description != null) body['description'] = description;
    if (expenseDate != null) body['expenseDate'] = expenseDate;
    if (paymentMethod != null) body['paymentMethod'] = paymentMethod;

    final response = await ApiService.post('/expenses', body: body);
    final result = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) return result;
    throw Exception(result['message'] ?? 'Failed to create expense');
  }

  static Future<List<dynamic>> loadIncomes() async {
    final response = await ApiService.get('/incomes');
    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return List<dynamic>.from(body['data'] ?? []);
    }
    throw Exception(body['message'] ?? 'Failed to load incomes');
  }

  static Future<Map<String, dynamic>> createIncome({
    required double amount,
    required String source,
    String? description,
    String? incomeDate,
    bool isRecurring = false,
    String? frequency,
  }) async {
    final body = <String, dynamic>{
      'amount': amount,
      'source': source,
      'isRecurring': isRecurring,
    };
    if (description != null) body['description'] = description;
    if (incomeDate != null) body['incomeDate'] = incomeDate;
    if (frequency != null) body['frequency'] = frequency;

    final response = await ApiService.post('/incomes', body: body);
    final result = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) return result;
    throw Exception(result['message'] ?? 'Failed to create income');
  }

  static Future<List<dynamic>> loadGoals() async {
    final response = await ApiService.get('/goals');
    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return List<dynamic>.from(body['data'] ?? []);
    }
    throw Exception(body['message'] ?? 'Failed to load goals');
  }

  static Future<Map<String, dynamic>> createGoal({
    required String icon,
    required String name,
    required double targetAmount,
    required String targetDate,
    String? flexibility,
    String? priority,
    String? description,
  }) async {
    final body = <String, dynamic>{
      'icon': icon,
      'name': name,
      'targetAmount': targetAmount,
      'targetDate': targetDate,
    };
    if (flexibility != null) body['flexibility'] = flexibility;
    if (priority != null) body['priority'] = priority;
    if (description != null) body['description'] = description;

    final response = await ApiService.post('/goals', body: body);
    final result = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) return result;
    throw Exception(result['message'] ?? 'Failed to create goal');
  }

  static Future<List<dynamic>> loadNotifications() async {
    final response = await ApiService.get('/notifications');
    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return List<dynamic>.from(body['data'] ?? []);
    }
    throw Exception(body['message'] ?? 'Failed to load notifications');
  }

  static Future<List<dynamic>> loadExpenseCategories() async {
    final response = await ApiService.get('/expenses/categories');
    final body = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return List<dynamic>.from(body['data'] ?? []);
    }
    throw Exception(body['message'] ?? 'Failed to load categories');
  }

  static Future<void> deleteExpense(String id) async {
    final response = await ApiService.delete('/expenses/$id');
    final result = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    throw Exception(result['message'] ?? 'Failed to delete expense');
  }

  static Future<void> deleteIncome(String id) async {
    final response = await ApiService.delete('/incomes/$id'); // Fixed endpoint
    final result = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    throw Exception(result['message'] ?? 'Failed to delete income');
  }

  static Future<void> deleteGoal(String id) async {
    final response = await ApiService.delete('/goals/$id');
    final result = await ApiService.parseJson(response);
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    throw Exception(result['message'] ?? 'Failed to delete goal');
  }
}
