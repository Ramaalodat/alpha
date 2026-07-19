import 'dart:convert';

import 'package:alpha_app/models/profile_model.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileProvider extends ChangeNotifier {
  ProfileProvider() {
    Future.microtask(_initialize);
  }

  static const String _storageKey =
      'alpha_saved_profile';

  ProfileModel? _profile;

  ProfileModel? get profile => _profile;

  bool _isLoading = false;

  bool get isLoading => _isLoading;

  bool _isSaving = false;

  bool get isSaving => _isSaving;

  String? _errorMessage;

  String? get errorMessage => _errorMessage;

  bool get hasProfile => _profile != null;

  String get displayName {
    final value = _profile?.name.trim() ?? '';

    return value.isEmpty ? 'User' : value;
  }

  String get email {
    return _profile?.email ?? '';
  }

  String? get photoUrl {
    return _profile?.photoUrl;
  }

  Future<void> _initialize() async {
    _isLoading = true;
    _errorMessage = null;

    notifyListeners();

    try {
      await loadProfile();

      _profile ??= ProfileModel(
        id: 'local_user',
        name: 'Mariam',
        email: 'mariam@example.com',
        joinedAt: DateTime.now(),
      );
    } catch (error) {
      _errorMessage = _cleanError(error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadProfile() async {
    final preferences =
        await SharedPreferences.getInstance();

    final storedValue =
        preferences.getString(_storageKey);

    if (storedValue == null ||
        storedValue.trim().isEmpty) {
      return;
    }

    final decoded = jsonDecode(storedValue);

    if (decoded is! Map) {
      throw const FormatException(
        'Invalid profile data',
      );
    }

    _profile = ProfileModel.fromJson(
      Map<String, dynamic>.from(decoded),
    );
  }

  Future<bool> setProfile(
    ProfileModel profile,
  ) async {
    final oldProfile = _profile;

    _profile = profile;
    _errorMessage = null;

    notifyListeners();

    final saved = await _saveProfile();

    if (!saved) {
      _profile = oldProfile;
      notifyListeners();

      return false;
    }

    return true;
  }

  Future<bool> updateProfile({
    String? name,
    String? email,
    String? phone,
    String? photoUrl,
    String? gender,
    DateTime? birthDate,
  }) async {
    if (_profile == null) {
      _errorMessage = 'Profile is unavailable';
      notifyListeners();

      return false;
    }

    final oldProfile = _profile!;

    final updatedProfile = oldProfile.copyWith(
      name: name,
      email: email,
      phone: phone,
      photoUrl: photoUrl,
      gender: gender,
      birthDate: birthDate,
    );

    _profile = updatedProfile;
    _errorMessage = null;

    notifyListeners();

    final saved = await _saveProfile();

    if (!saved) {
      _profile = oldProfile;
      notifyListeners();

      return false;
    }

    return true;
  }

  Future<bool> updateName(
    String name,
  ) async {
    final cleanName = name.trim();

    if (cleanName.isEmpty) {
      _errorMessage = 'Please enter your name';
      notifyListeners();

      return false;
    }

    return updateProfile(
      name: cleanName,
    );
  }

  Future<bool> updatePhoto(
    String? photoUrl,
  ) async {
    return updateProfile(
      photoUrl: photoUrl,
    );
  }

  Future<bool> _saveProfile() async {
    if (_profile == null) {
      return false;
    }

    _isSaving = true;
    _errorMessage = null;

    notifyListeners();

    try {
      final preferences =
          await SharedPreferences.getInstance();

      final saved =
          await preferences.setString(
        _storageKey,
        jsonEncode(
          _profile!.toJson(),
        ),
      );

      if (!saved) {
        throw Exception(
          'Could not save profile locally',
        );
      }

      return true;
    } catch (error) {
      _errorMessage = _cleanError(error);

      return false;
    } finally {
      _isSaving = false;
      notifyListeners();
    }
  }

  Future<void> clearProfile() async {
    _profile = null;
    _errorMessage = null;

    final preferences =
        await SharedPreferences.getInstance();

    await preferences.remove(
      _storageKey,
    );

    notifyListeners();
  }

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
}