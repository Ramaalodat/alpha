import 'package:alpha_app/core/constants/api_constant.dart';

import 'api_service.dart';


class AuthService {


static Future login({
required String phone,
required String password,

}) async {


final response =
await ApiService.post(

url:"${ApiConstants.baseUrl}/auth/login",

body: {

"phone_number": phone,

"password": password,

},

);


return response;


}


static Future register({
  required String name,
  required String phone,
  required String birthDate,
  required String password,
  required String email
}) async {


  final response = await ApiService.post(

    url: "${ApiConstants.baseUrl}/auth/register",

      body: {


      "phone_number": phone,

      "full_name": name,

      "birth_date": birthDate,

      "password": password,
      "email" : email


    },

  );


  return response;

}

static Future verifyOtp({

  required String phone,
  required String otp,

}) async {


  final response = await ApiService.post(

    url: "${ApiConstants.baseUrl}/auth/verify-otp",

    body: {

      "phone_number": phone,

      "otp": otp,

    },

  );


  return response;

}
}