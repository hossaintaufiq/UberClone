import "../core/auth_prefs.dart";
import "api_client.dart";

class DriverService {
  static Future<Map<String, dynamic>> profile() =>
      ApiClient.get("/api/drivers/profile", tokenPref: AuthPrefs.driverToken);

  static Future<Map<String, dynamic>> earnings() async {
    final m = await ApiClient.get("/api/drivers/earnings", tokenPref: AuthPrefs.driverToken);
    return (m["data"] as Map?)?.cast<String, dynamic>() ?? {};
  }

  static Future<bool> toggleOnline() async {
    final m = await ApiClient.patch("/api/drivers/go-online", {}, tokenPref: AuthPrefs.driverToken);
    if (m["is_online"] is bool) return m["is_online"] as bool;
    if (m["data"] is Map && (m["data"] as Map)["isOnline"] is bool) {
      return (m["data"] as Map)["isOnline"] as bool;
    }
    return false;
  }

  static Future<List<dynamic>> rides() async {
    final m = await ApiClient.get("/api/drivers/rides", tokenPref: AuthPrefs.driverToken);
    final d = m["data"];
    return d is List ? d : [];
  }

  static Future<List<dynamic>> rideRequests() async {
    final m = await ApiClient.get("/api/drivers/ride-requests", tokenPref: AuthPrefs.driverToken);
    final d = m["data"];
    return d is List ? d : [];
  }

  static Future<List<dynamic>> notifications() async {
    final m = await ApiClient.get("/api/drivers/notifications", tokenPref: AuthPrefs.driverToken);
    final d = m["data"];
    return d is List ? d : [];
  }

  static Future<void> acceptRide(String id) =>
      ApiClient.patch("/api/rides/$id/accept", {}, tokenPref: AuthPrefs.driverToken);

  static Future<void> rejectRide(String id) =>
      ApiClient.patch("/api/rides/$id/reject", {}, tokenPref: AuthPrefs.driverToken);

  static Future<void> markArrived(String id) =>
      ApiClient.patch("/api/rides/$id/arrived", {}, tokenPref: AuthPrefs.driverToken);

  static Future<void> startRide(String id) =>
      ApiClient.patch("/api/rides/$id/start", {}, tokenPref: AuthPrefs.driverToken);

  static Future<void> completeRide(String id) =>
      ApiClient.patch("/api/rides/$id/complete", {}, tokenPref: AuthPrefs.driverToken);
}
