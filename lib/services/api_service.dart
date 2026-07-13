import 'dart:convert';
import 'package:http/http.dart' as http;


class ApiService {


  static Future post({
    required String url,
    required Map<String,dynamic> body,
  }) async {


    final response = await http.post(
      Uri.parse(url),
      headers: {
        "Content-Type":"application/json",
      },
      body: jsonEncode(body),
    );


    return jsonDecode(response.body);

  }

}