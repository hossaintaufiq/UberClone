import "dart:convert";

import "package:http/http.dart" as http;

import "../core/app_config.dart";

class PlaceSuggestion {
  final double lat;
  final double lng;
  final String label;

  const PlaceSuggestion({required this.lat, required this.lng, required this.label});

  factory PlaceSuggestion.fromJson(Map<String, dynamic> m) {
    final lat = (m["lat"] as num?)?.toDouble();
    final lng = (m["lng"] as num?)?.toDouble();
    final label = (m["label"] as String?)?.trim() ?? "";
    if (lat == null || lng == null || label.isEmpty) {
      throw const FormatException("invalid place");
    }
    return PlaceSuggestion(lat: lat, lng: lng, label: label);
  }
}

class GeocodingService {
  static Future<String> reverse(double lat, double lng) async {
    final uri = Uri.parse("https://nominatim.openstreetmap.org/reverse").replace(
      queryParameters: {"lat": "$lat", "lon": "$lng", "format": "json"},
    );
    final res = await http.get(
      uri,
      headers: {"Accept": "application/json", "User-Agent": "TransitelyRiderApp/1.0"},
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return "${lat.toStringAsFixed(5)}, ${lng.toStringAsFixed(5)}";
    }
    final map = jsonDecode(res.body);
    if (map is Map && map["display_name"] is String) {
      final name = (map["display_name"] as String).trim();
      if (name.isNotEmpty) return name;
    }
    return "${lat.toStringAsFixed(5)}, ${lng.toStringAsFixed(5)}";
  }

  /// Forward search via backend (Nominatim policy / consistent results).
  static Future<List<PlaceSuggestion>> searchPlaces(String query) async {
    final q = query.trim();
    if (q.length < 2) return [];
    final uri = Uri.parse("${AppConfig.baseUrl}/api/geocode/search").replace(queryParameters: {"q": q, "limit": "8"});
    final res = await http.get(uri, headers: {"Accept": "application/json"});
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return [];
    }
    final decoded = jsonDecode(res.body);
    if (decoded is! Map<String, dynamic>) return [];
    if (decoded["success"] == false) return [];
    final data = decoded["data"];
    if (data is! List) return [];
    final out = <PlaceSuggestion>[];
    for (final item in data) {
      if (item is! Map) continue;
      try {
        out.add(PlaceSuggestion.fromJson(Map<String, dynamic>.from(item)));
      } catch (_) {}
    }
    return out;
  }
}
