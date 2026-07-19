import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiService {
  static Future<Map<String, dynamic>> post({
    required String url,
    required Map<String, dynamic> body,
  }) async {
    try {
      debugPrint('POST URL: $url');
      debugPrint('POST BODY: ${jsonEncode(body)}');

      final response = await http
          .post(
            Uri.parse(url),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: jsonEncode(body),
          )
          .timeout(
            const Duration(seconds: 90),
          );

      debugPrint(
        'STATUS CODE: ${response.statusCode}',
      );

      debugPrint(
        'RESPONSE BODY: ${response.body}',
      );

      Map<String, dynamic> decodedBody = {};

      if (response.body.trim().isNotEmpty) {
        final decoded = jsonDecode(
          response.body,
        );

        if (decoded is Map) {
          decodedBody =
              Map<String, dynamic>.from(
            decoded,
          );
        }
      }

      if (response.statusCode >= 200 &&
          response.statusCode < 300) {
        return decodedBody;
      }

      final dynamic error =
          decodedBody['error'];

      String message =
          decodedBody['message']
                  ?.toString() ??
              'Request failed with status ${response.statusCode}';

      if (error is Map &&
          error['message'] != null) {
        message =
            error['message'].toString();
      }

      throw Exception(message);
    } on TimeoutException {
      throw Exception(
        'The server took too long to respond. Please try again.',
      );
    } on FormatException {
      throw Exception(
        'The server returned an invalid response.',
      );
    } on http.ClientException catch (error) {
      throw Exception(
        'Could not connect to the server: ${error.message}',
      );
    } catch (error) {
      final message = error
          .toString()
          .replaceFirst(
            'Exception: ',
            '',
          );

      throw Exception(message);
    }
  }
}