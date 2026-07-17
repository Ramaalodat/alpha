import 'package:alpha_app/services/auth_service.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {

  final nameController = TextEditingController();
  final phoneController = TextEditingController();
  final passwordController = TextEditingController();
  final birthDateController = TextEditingController();

final emailController = TextEditingController();
  DateTime? birthDate;


  bool isLoading = false;
  bool rememberMe = false;


  void setBirthDate(DateTime date){

    birthDate = date;

    birthDateController.text =
"${date.year}-${date.month.toString().padLeft(2,'0')}-${date.day.toString().padLeft(2,'0')}";

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

Future<bool> login({
  required String phone,
  required String password,
}) async {


  try {

    isLoading = true;
    notifyListeners();


    final response = await AuthService.login(
      phone: phone,
      password: password,
    );


    if(response["success"] == true){


      final pref = await SharedPreferences.getInstance();


      
      await pref.setString(
        "token",
        response["data"]["access_token"],
      );


     
      await pref.setBool(
        "remember_me",
        rememberMe,
      );


      return true;


    }else{


      return false;


    }


  }catch(e){


    debugPrint(
      "Login Error: $e",
    );


    return false;


  }finally{


    isLoading = false;

    notifyListeners();


  }

}





Future<bool> register({

  required String name,
  required String phone,
  required String birthDate,
  required String password,
  required String email

}) async {


  try {

    isLoading = true;
    notifyListeners();



    final response = await AuthService.register(

      name: name,

      phone: phone,

      birthDate: birthDate,

      password: password,
      email : email

    );

  debugPrint("REGISTER RESPONSE:");
    debugPrint(response.toString());

    if(response["success"] == true){

      return true;

    }


    return false;



  } catch(e){


    debugPrint(
      "Register Error: $e"
    );


    return false;



  } finally {


    isLoading = false;

    notifyListeners();


  }


}

Future<bool> verifyOtp({

required String phone,
required String otp,

}) async {


try {


isLoading = true;

notifyListeners();



final response = await AuthService.verifyOtp(

phone: phone,

otp: otp,

);



if(response["success"] == true){



final pref =
await SharedPreferences.getInstance();



await pref.setString(
"access_token",
response["data"]["access_token"],
);



await pref.setString(
"refresh_token",
response["data"]["refresh_token"],
);



return true;


}



return false;



}catch(e){


debugPrint(
"OTP Error: $e"
);


return false;



}finally{


isLoading = false;

notifyListeners();


}


}
}