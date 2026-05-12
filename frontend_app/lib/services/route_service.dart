import "dart:convert";
import "dart:math" as math;

import "package:http/http.dart" as http;
import "package:latlong2/latlong.dart";

class RouteService {
  static Future<List<LatLng>> shortestPath(LatLng start, LatLng end) async {
    final url =
        "https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson";
    final res = await http.get(Uri.parse(url), headers: {"Accept": "application/json"});
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return [start, end];
    }
    final decoded = jsonDecode(res.body);
    final routes = (decoded is Map) ? decoded["routes"] : null;
    if (routes is! List || routes.isEmpty) return [start, end];
    final geometry = routes.first is Map ? routes.first["geometry"] : null;
    final coords = geometry is Map ? geometry["coordinates"] : null;
    if (coords is! List || coords.length < 2) return [start, end];
    final out = <LatLng>[];
    for (final c in coords) {
      if (c is List && c.length >= 2) {
        final lng = (c[0] as num?)?.toDouble();
        final lat = (c[1] as num?)?.toDouble();
        if (lat != null && lng != null) out.add(LatLng(lat, lng));
      }
    }
    return out.length >= 2 ? out : [start, end];
  }
}

double haversineKm(LatLng a, LatLng b) {
  const d2r = 0.017453292519943295;
  const r = 6371.0;
  final dLat = (b.latitude - a.latitude) * d2r;
  final dLng = (b.longitude - a.longitude) * d2r;
  final x = math.sin(dLat / 2) * math.sin(dLat / 2) +
      math.cos(a.latitude * d2r) * math.cos(b.latitude * d2r) * math.sin(dLng / 2) * math.sin(dLng / 2);
  final c = 2 * math.atan2(math.sqrt(x), math.sqrt(1 - x));
  return r * c;
}
