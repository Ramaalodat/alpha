import 'package:alpha_app/services/api_exception.dart';
import 'package:alpha_app/services/api_service.dart';

class UserService {
  static Future<Map<String, dynamic>> updateDemographics({
    required String gender,
    String? maritalStatus,
    bool? isHeadOfHousehold,
    bool? isStudent,
  }) async {
    final body = <String, dynamic>{
      'gender': gender,
    };
    if (maritalStatus != null) body['maritalStatus'] = maritalStatus;
    if (isHeadOfHousehold != null) {
      body['isHeadOfHousehold'] = isHeadOfHousehold;
    }
    if (isStudent != null) body['isStudent'] = isStudent;

    final response = await ApiService.patch('/users/demographics', body: body);
    final result = await ApiService.parseJson(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return result;
    }
    final error = result['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ??
          result['message'] ??
          'Failed to update demographics',
      code: error?['code'] as String?,
    );
  }

  static Future<Map<String, dynamic>> updateBasicInfo({
    required String fullName,
    required String birthDate,
  }) async {
    final body = <String, dynamic>{
      'fullName': fullName,
      'birthDate': birthDate,
    };

    final response = await ApiService.patch('/users/profile', body: body);
    final result = await ApiService.parseJson(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return result;
    }
    final error = result['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ?? result['message'] ?? 'Failed to update personal info',
      code: error?['code'] as String?,
    );
  }

  static Future<Map<String, dynamic>> getProfile() async {
    final response = await ApiService.get('/users/profile');
    final result = await ApiService.parseJson(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = result['data'];
      return data is Map
          ? Map<String, dynamic>.from(data)
          : <String, dynamic>{};
    }
    final error = result['error'] as Map<String, dynamic>?;
    throw ApiException(
      message:
          error?['message'] ?? result['message'] ?? 'Failed to load profile',
      code: error?['code'] as String?,
    );
  }

  /// Update the user's monthly income. The old value is preserved in a
  /// previous profile version; the new value becomes the active one.
  static Future<Map<String, dynamic>> updateMonthlyIncome({
    required double monthlyIncome,
  }) async {
    final response = await ApiService.put('/users/profile/update', body: {
      'monthlyIncome': monthlyIncome,
      'changeReason': 'SALARY_UPDATE',
    });
    final result = await ApiService.parseJson(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = result['data'];
      return data is Map
          ? Map<String, dynamic>.from(data)
          : <String, dynamic>{};
    }
    final error = result['error'] as Map<String, dynamic>?;
    throw ApiException(
      message:
          error?['message'] ?? result['message'] ?? 'Failed to update salary',
      code: error?['code'] as String?,
    );
  }

  static Future<Map<String, dynamic>> updateFamilySize({
    required int familySize,
  }) async {
    final response = await ApiService.put('/users/profile/update', body: {
      'familySize': familySize,
      'changeReason': 'FAMILY_SIZE_UPDATE',
    });
    final result = await ApiService.parseJson(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = result['data'];
      return data is Map
          ? Map<String, dynamic>.from(data)
          : <String, dynamic>{};
    }
    final error = result['error'] as Map<String, dynamic>?;
    throw ApiException(
      message: error?['message'] ??
          result['message'] ??
          'Failed to update family size',
      code: error?['code'] as String?,
    );
  }
}
