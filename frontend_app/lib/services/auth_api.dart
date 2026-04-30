import "dart:convert";

import "package:http/http.dart" as http;

import "../core/app_config.dart";

class AuthApi {
  static Future<void> riderRegister({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    final uri = Uri.parse("${AppConfig.baseUrl}/api/auth/rider/register");
    final response = await http.post(
      uri,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "full_name": name,
        "name": name,
        "email": email,
        "phone": phone,
        "password": password,
      }),
    );
    _assertSuccess(response);
  }

  static Future<void> driverRegister({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    final uri = Uri.parse("${AppConfig.baseUrl}/api/auth/driver/register");
    final response = await http.post(
      uri,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "name": name,
        "email": email,
        "phone": phone,
        "password": password,
      }),
    );
    _assertSuccess(response);
  }

  static Future<String> riderLogin({
    required String identifier,
    required String password,
  }) async {
    final uri = Uri.parse("${AppConfig.baseUrl}/api/auth/rider/login");
    final response = await http.post(
      uri,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "identifier": identifier,
        "password": password,
      }),
    );
    return _parseToken(response);
  }

  static Future<String> driverLogin({
    required String identifier,
    required String password,
  }) async {
    final uri = Uri.parse("${AppConfig.baseUrl}/api/auth/driver/login");
    final response = await http.post(
      uri,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "identifier": identifier,
        "password": password,
      }),
    );
    return _parseToken(response);
  }

  static String _parseToken(http.Response response) {
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final token = data["token"];
      if (token is String && token.isNotEmpty) return token;
      throw Exception("Token missing in response.");
    }
    throw Exception(data["message"]?.toString() ?? "Request failed.");
  }

  static void _assertSuccess(http.Response response) {
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(data["message"]?.toString() ?? "Request failed.");
    }
  }
}
