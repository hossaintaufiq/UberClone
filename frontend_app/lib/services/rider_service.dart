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

  static Future<Map<String, dynamic>> requestRide(Map<String, dynamic> body) async {
    return ApiClient.post("/api/rides", body, tokenPref: AuthPrefs.riderToken);
  }

  static Future<Map<String, dynamic>> driverChoices({double? pickupLat, double? pickupLng}) async {
    var path = "/api/riders/drivers/choices";
    if (pickupLat != null && pickupLng != null) {
      path += "?pickup_lat=$pickupLat&pickup_lng=$pickupLng";
    }
    final m = await ApiClient.get(path, tokenPref: AuthPrefs.riderToken);
    final d = m["data"];
    return d is Map ? Map<String, dynamic>.from(d) : <String, dynamic>{};
  }

  static Future<void> cancelRide(String id, {String reason = "Cancelled by rider"}) async {
    await ApiClient.patch("/api/rides/$id/cancel", {"reason": reason}, tokenPref: AuthPrefs.riderToken);
  }

  static Future<void> riderAcceptRide(String rideId) async {
    await ApiClient.patch("/api/rides/$rideId/rider-accept", {}, tokenPref: AuthPrefs.riderToken);
  }

  /// After trip completed: cash | bkash | nagad | card
  static Future<Map<String, dynamic>> payRide(String rideId, String method) async {
    return ApiClient.post("/api/rides/$rideId/pay", {"method": method}, tokenPref: AuthPrefs.riderToken);
  }

  /// Optional [comment] syncs written feedback (`riderFeedback` on the ride).
  static Future<void> rateDriver(String rideId, int rating, {String? comment}) async {
    final body = <String, dynamic>{"rating": rating};
    if (comment != null) body["comment"] = comment;
    await ApiClient.post("/api/rides/$rideId/rate-driver", body, tokenPref: AuthPrefs.riderToken);
  }

  /// Populated `driverId` etc. — same payload as rider web `/track`.
  static Future<Map<String, dynamic>> trackRide(String rideId) async =>
      ApiClient.get("/api/rides/$rideId/track", tokenPref: AuthPrefs.riderToken);
}
