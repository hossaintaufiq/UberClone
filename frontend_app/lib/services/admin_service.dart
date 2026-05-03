import "../core/auth_prefs.dart";
import "api_client.dart";

class AdminService {
  static Future<Map<String, dynamic>> dashboard() async {
    final m = await ApiClient.get("/api/admin/dashboard", tokenPref: AuthPrefs.adminToken);
    return (m["data"] as Map?)?.cast<String, dynamic>() ?? {};
  }

  static Future<Map<String, dynamic>> revenue() async {
    final m = await ApiClient.get("/api/admin/revenue", tokenPref: AuthPrefs.adminToken);
    return (m["data"] as Map?)?.cast<String, dynamic>() ?? {};
  }

  static Future<List<dynamic>> riders() async {
    final m = await ApiClient.get("/api/admin/riders", tokenPref: AuthPrefs.adminToken);
    final d = m["data"];
    return d is List ? d : [];
  }

  static Future<List<dynamic>> drivers() async {
    final m = await ApiClient.get("/api/admin/drivers", tokenPref: AuthPrefs.adminToken);
    final d = m["data"];
    return d is List ? d : [];
  }

  static Future<List<dynamic>> rides() async {
    final m = await ApiClient.get("/api/admin/rides", tokenPref: AuthPrefs.adminToken);
    final d = m["data"];
    return d is List ? d : [];
  }

  static Future<void> setRiderActive(String id, bool active) =>
      ApiClient.patch("/api/admin/riders/$id/status", {"is_active": active}, tokenPref: AuthPrefs.adminToken);

  static Future<void> setDriverActive(String id, bool active) =>
      ApiClient.patch("/api/admin/drivers/$id/status", {"is_active": active}, tokenPref: AuthPrefs.adminToken);
}

