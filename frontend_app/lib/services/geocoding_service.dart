import "dart:convert";

import "package:http/http.dart" as http;

class GeocodingService {
  static Future<String> reverse(double lat, double lng) async {
    final uri = Uri.parse("https://nominatim.openstreetmap.org/reverse").replace(
      queryParameters: {"lat": "$lat", "lon": "$lng", "format": "json"},
    );
    final res = await http.get(uri, headers: {"Accept": "application/json"});
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
}
