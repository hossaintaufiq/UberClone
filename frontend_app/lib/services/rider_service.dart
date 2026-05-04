import "../core/auth_prefs.dart";
import "api_client.dart";

class RiderService {
  static Future<Map<String, dynamic>> profile() =>
      ApiClient.get("/api/riders/profile", tokenPref: AuthPrefs.riderToken);

  static Future<List<dynamic>> rides() async {
    final m = await ApiClient.get("/api/riders/rides", tokenPref: AuthPrefs.riderToken);
    final d = m["data"];
    return d is List ? d : [];
  }

  static Future<List<dynamic>> payments() async {
    final m = await ApiClient.get("/api/riders/payments", tokenPref: AuthPrefs.riderToken);
    final d = m["data"];
    return d is List ? d : [];
  }

  static Future<List<dynamic>> notifications() async {
    final m = await ApiClient.get("/api/riders/notifications", tokenPref: AuthPrefs.riderToken);
    final d = m["data"];
    return d is List ? d : [];
  }

  static Future<void> requestRide(Map<String, dynamic> body) async {
    await ApiClient.post("/api/rides", body, tokenPref: AuthPrefs.riderToken);
  }

  static Future<void> cancelRide(String id, {String reason = "Cancelled by rider"}) async {
    await ApiClient.patch("/api/rides/$id/cancel", {"reason": reason}, tokenPref: AuthPrefs.riderToken);
  }

  static Future<void> rateDriver(String rideId, int rating) async {
    await ApiClient.post("/api/rides/$rideId/rate-driver", {"rating": rating}, tokenPref: AuthPrefs.riderToken);
  }
}
