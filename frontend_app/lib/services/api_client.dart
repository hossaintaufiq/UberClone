import "dart:convert";

import "package:http/http.dart" as http;
import "package:shared_preferences/shared_preferences.dart";

import "../core/app_config.dart";

class ApiClient {
  static Future<String?> _tok(String prefKey) async {
    final p = await SharedPreferences.getInstance();
    return p.getString(prefKey);
  }

  static Map<String, dynamic> _parseBody(String body) {
    try {
      final d = jsonDecode(body);
      if (d is Map<String, dynamic>) return d;
      if (d is Map) return Map<String, dynamic>.from(d);
      return {};
    } catch (_) {
      return {};
    }
  }

  static void _ensureOk(http.Response res, Map<String, dynamic> map) {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception(map["message"]?.toString() ?? "HTTP ${res.statusCode}");
    }
    if (map.containsKey("success") && map["success"] == false) {
      throw Exception(map["message"]?.toString() ?? "Request failed");
    }
  }

  static Future<Map<String, dynamic>> get(String path, {required String tokenPref}) async {
    final t = await _tok(tokenPref);
    final uri = Uri.parse("${AppConfig.baseUrl}$path");
    final h = <String, String>{"Accept": "application/json"};
    if (t != null && t.isNotEmpty) h["Authorization"] = "Bearer $t";
    final res = await http.get(uri, headers: h);
    final map = _parseBody(res.body);
    _ensureOk(res, map);
    return map;
  }

  static Future<Map<String, dynamic>> post(
    String path,
    Map<String, dynamic> body, {
    required String tokenPref,
    bool optionalAuth = false,
  }) async {
    final t = await _tok(tokenPref);
    final uri = Uri.parse("${AppConfig.baseUrl}$path");
    final h = <String, String>{
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (!optionalAuth && t != null && t.isNotEmpty) h["Authorization"] = "Bearer $t";
    if (optionalAuth && t != null && t.isNotEmpty) h["Authorization"] = "Bearer $t";
    final res = await http.post(uri, headers: h, body: jsonEncode(body));
    final map = _parseBody(res.body);
    _ensureOk(res, map);
    return map;
  }

  static Future<Map<String, dynamic>> patch(String path, Map<String, dynamic> body, {required String tokenPref}) async {
    final t = await _tok(tokenPref);
    final uri = Uri.parse("${AppConfig.baseUrl}$path");
    final h = <String, String>{
      "Content-Type": "application/json",
      "Accept": "application/json",
      if (t != null && t.isNotEmpty) "Authorization": "Bearer $t",
    };
    final res = await http.patch(uri, headers: h, body: jsonEncode(body));
    final map = _parseBody(res.body);
    _ensureOk(res, map);
    return map;
  }
}
