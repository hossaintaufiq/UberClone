import "dart:convert";

import "package:http/http.dart" as http;
import "package:shared_preferences/shared_preferences.dart";

import "../core/app_config.dart";
import "../core/auth_prefs.dart";

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
      body: jsonEncode({"identifier": identifier, "password": password}),
    );
    final token = _parseToken(response);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AuthPrefs.riderToken, token);
    return token;
  }

  static Future<String> driverLogin({
    required String identifier,
    required String password,
  }) async {
    final uri = Uri.parse("${AppConfig.baseUrl}/api/auth/driver/login");
    final response = await http.post(
      uri,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"identifier": identifier, "password": password}),
    );
    final token = _parseToken(response);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AuthPrefs.driverToken, token);
    return token;
  }

  static String _parseToken(http.Response response) {
    final data = jsonDecode(response.body);
    if (data is! Map) throw Exception("Unexpected server response");
    final map = Map<String, dynamic>.from(data);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final token = map["token"];
      if (token is String && token.isNotEmpty) return token;
      throw Exception("Token missing in response.");
    }
    throw Exception(map["message"]?.toString() ?? "Request failed.");
  }

  static void _assertSuccess(http.Response response) {
    final data = jsonDecode(response.body);
    if (data is! Map) throw Exception("Unexpected server response");
    final map = Map<String, dynamic>.from(data);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(map["message"]?.toString() ?? "Request failed.");
    }
  }
}
