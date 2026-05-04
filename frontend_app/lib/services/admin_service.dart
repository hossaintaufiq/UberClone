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

  static Future<Map<String, dynamic>> config() async {
    final m = await ApiClient.get("/api/admin/config", tokenPref: AuthPrefs.adminToken);
    return (m["data"] as Map?)?.cast<String, dynamic>() ?? {};
  }

  static Future<void> updateConfig({required num perKmFare, required num commissionRate}) =>
      ApiClient.patch(
        "/api/admin/config",
        {"per_km_fare": perKmFare, "commission_rate": commissionRate},
        tokenPref: AuthPrefs.adminToken,
      );

  static Future<List<dynamic>> createPromoCode({
    required String code,
    required num discountPercent,
    String? expiresAtIso,
  }) async {
    final m = await ApiClient.post(
      "/api/admin/promo-codes",
      {
        "code": code,
        "discount_percent": discountPercent,
        if (expiresAtIso != null && expiresAtIso.isNotEmpty) "expires_at": expiresAtIso,
      },
      tokenPref: AuthPrefs.adminToken,
    );
    final d = m["data"];
    return d is List ? d : [];
  }

  static Future<void> togglePromoCode(String code) =>
      ApiClient.patch("/api/admin/promo-codes/$code/toggle", {}, tokenPref: AuthPrefs.adminToken);

  static Future<void> setRiderActive(String id, bool active) =>
      ApiClient.patch("/api/admin/riders/$id/status", {"is_active": active}, tokenPref: AuthPrefs.adminToken);

  static Future<void> setDriverActive(String id, bool active) =>
      ApiClient.patch("/api/admin/drivers/$id/status", {"is_active": active}, tokenPref: AuthPrefs.adminToken);
}

