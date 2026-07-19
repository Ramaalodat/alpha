import 'package:alpha_app/services/api_service.dart';

class DashboardService {
  static Future<Map<String, dynamic>> loadCurrentCycle() async {
    try {
      final response = await ApiService.get('/cycles/current');
      final body = await ApiService.parseJson(response);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return body['data'] ?? {};
      }
      return {};
    } catch (_) {
      return {};
    }
  }

  static Future<List<dynamic>> loadBucketBalances() async {
    try {
      final response = await ApiService.get('/cycles/current/buckets');
      final body = await ApiService.parseJson(response);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = body['data'];
        return data is List ? data : [];
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  static Future<Map<String, dynamic>> loadDashboard() async {
    try {
      final response = await ApiService.get('/dashboard');
      final body = await ApiService.parseJson(response);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = body['data'];
        return data is Map
            ? Map<String, dynamic>.from(data)
            : <String, dynamic>{};
      }
      // API error – return empty data so UI still renders
      return {};
    } catch (_) {
      // Network or timeout – return empty data so UI still renders
      return {};
    }
  }

  static Future<Map<String, dynamic>> loadHealthScore() async {
    try {
      final response = await ApiService.get('/dashboard/health-score');
      final body = await ApiService.parseJson(response);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = body['data'];
        return data is Map
            ? Map<String, dynamic>.from(data)
            : <String, dynamic>{};
      }
      return {};
    } catch (_) {
      return {};
    }
  }

  static Future<List<dynamic>> loadInsights() async {
    try {
      final response = await ApiService.get('/insights?limit=1');
      final body = await ApiService.parseJson(response);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = body['data']['data'] ?? body['data'] ?? []; // In case of pagination wrapper
        return data is List
            ? List<dynamic>.from(data)
            : <dynamic>[];
      }
      return [];
    } catch (_) {
      return [];
    }
  }
}
