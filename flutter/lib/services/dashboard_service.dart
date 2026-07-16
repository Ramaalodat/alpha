import 'package:alpha_app/services/api_service.dart';

class DashboardService {
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
}
