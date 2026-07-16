import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000/api';

  // ── Token refresh state ──────────────────────────────────
  static bool _isRefreshing = false;
  static Completer<bool>? _refreshCompleter;

  /// Execute an HTTP request with automatic token refresh on 401.
  ///
  /// If the response is 401 (or body contains TOKEN_EXPIRED), the
  /// interceptor will attempt to refresh the access token once and
  /// then retry the original request with the new token.
  /// Concurrent requests during a refresh are queued and retried
  /// after the refresh completes.
  static Future<http.Response> _requestWithRetry(
    Future<http.Response> Function(String token) requestFn, {
    bool skipRetry = false,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token') ?? '';
    final response = await requestFn(token);

    // If not 401 / not expired → return immediately
    if (!_isTokenExpired(response) || skipRetry) return response;

    // ── Attempt token refresh ──────────────────────────────
    if (_isRefreshing) {
      // Another request is already refreshing – wait for it
      await _refreshCompleter!.future;
    } else {
      _isRefreshing = true;
      _refreshCompleter = Completer<bool>();

      try {
        final success = await _doRefreshToken();
        _refreshCompleter!.complete(success);
      } catch (_) {
        _refreshCompleter!.completeError('Refresh failed');
      } finally {
        _isRefreshing = false;
        _refreshCompleter = null;
      }
    }

    // ── Retry original request with new token ──────────────
    final newPrefs = await SharedPreferences.getInstance();
    final newToken = newPrefs.getString('access_token') ?? '';
    return requestFn(newToken);
  }

  /// Check whether a response indicates an expired token.
  static bool _isTokenExpired(http.Response response) {
    if (response.statusCode != 401) return false;
    try {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final error = body['error'] as Map<String, dynamic>?;
      final code = error?['code'] ?? body['code'];
      return code == 'TOKEN_EXPIRED' || code == 'UNAUTHORIZED';
    } catch (_) {
      // If we can't parse the body, treat any 401 as expired
      return true;
    }
  }

  /// Call the refresh-token endpoint directly (bypasses the interceptor).
  static Future<bool> _doRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshTok = prefs.getString('refresh_token');
    if (refreshTok == null || refreshTok.isEmpty) return false;

    final uri = Uri.parse('$baseUrl/auth/refresh-token');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refreshToken': refreshTok}),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>?;
      final tokens = data?['tokens'] as Map<String, dynamic>?;
      if (tokens != null) {
        await prefs.setString('access_token', tokens['accessToken'] ?? '');
        await prefs.setString('refresh_token', tokens['refreshToken'] ?? '');
      }
      return true;
    }
    return false;
  }

  // ── Public HTTP methods ──────────────────────────────────

  static Future<http.Response> get(String path,
      {Map<String, String>? queryParams}) async {
    return _requestWithRetry((token) {
      final uri =
          Uri.parse('$baseUrl$path').replace(queryParameters: queryParams);
      return http.get(uri, headers: _headers(token));
    });
  }

  static Future<http.Response> post(
    String path, {
    Map<String, dynamic>? body,
    bool skipRetry = false,
  }) async {
    return _requestWithRetry(
      (token) {
        final uri = Uri.parse('$baseUrl$path');
        return http.post(uri,
            headers: _headers(token), body: jsonEncode(body ?? {}));
      },
      skipRetry: skipRetry,
    );
  }

  static Future<http.Response> patch(String path,
      {Map<String, dynamic>? body}) async {
    return _requestWithRetry((token) async {
      final uri = Uri.parse('$baseUrl$path');
      final request = http.Request('PATCH', uri);
      request.headers.addAll(_headers(token));
      request.body = jsonEncode(body ?? {});
      final streamed = await request.send();
      return http.Response.fromStream(streamed);
    });
  }

  static Future<http.Response> put(String path,
      {Map<String, dynamic>? body}) async {
    return _requestWithRetry((token) {
      final uri = Uri.parse('$baseUrl$path');
      return http.put(uri,
          headers: _headers(token), body: jsonEncode(body ?? {}));
    });
  }

  static Future<http.Response> delete(String path) async {
    return _requestWithRetry((token) {
      final uri = Uri.parse('$baseUrl$path');
      return http.delete(uri, headers: _headers(token));
    });
  }

  static Future<Map<String, dynamic>> parseJson(http.Response response) async {
    final decoded = jsonDecode(response.body);
    if (decoded is Map<String, dynamic>) {
      return decoded;
    }
    return {'data': decoded};
  }

  // ── Helpers ──────────────────────────────────────────────

  static Map<String, String> _headers(String token) => {
        'Content-Type': 'application/json',
        if (token.isNotEmpty) 'Authorization': 'Bearer $token',
      };
}
