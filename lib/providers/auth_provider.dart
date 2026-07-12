import 'package:flutter/material.dart';

class AuthProvider extends ChangeNotifier {

  final nameController = TextEditingController();
  final phoneController = TextEditingController();
  final passwordController = TextEditingController();
  final birthDateController = TextEditingController();


  DateTime? birthDate;


  bool isLoading = false;
  bool rememberMe = false;


  void setBirthDate(DateTime date){

    birthDate = date;

    birthDateController.text =
        "${date.day}/${date.month}/${date.year}";

    notifyListeners();
  }


  void toggleRemember(){

    rememberMe = !rememberMe;

    notifyListeners();
  }


  void setLoading(bool value){

    isLoading = value;

    notifyListeners();
  }


  void clear(){

    nameController.clear();
    phoneController.clear();
    passwordController.clear();
    birthDateController.clear();

    birthDate = null;
    rememberMe = false;
  }


  @override
  void dispose(){

    nameController.dispose();
    phoneController.dispose();
    passwordController.dispose();
    birthDateController.dispose();

    super.dispose();
  }

}