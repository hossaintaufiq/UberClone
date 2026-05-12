import "api_client.dart";

/// REST API for ride-scoped chat (same routes as web app).
class RideChatService {
  static Future<List<Map<String, dynamic>>> fetchMessages(String rideId, {required String tokenPref}) async {
    final m = await ApiClient.get("/api/rides/$rideId/chat", tokenPref: tokenPref);
    final d = m["data"];
    if (d is List) {
      return d.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
    return [];
  }

  static Future<List<Map<String, dynamic>>> sendMessage(
    String rideId,
    String message, {
    required String tokenPref,
  }) async {
    final m = await ApiClient.post("/api/rides/$rideId/chat", {"message": message}, tokenPref: tokenPref);
    final d = m["data"];
    if (d is List) {
      return d.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
    return [];
  }
}
