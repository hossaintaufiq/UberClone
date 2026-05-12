import "package:flutter/material.dart";
import "package:flutter_map/flutter_map.dart";
import "package:latlong2/latlong.dart";

import "../core/app_theme.dart";
import "../services/route_service.dart";

class LiveTripMapCard extends StatefulWidget {
  final LatLng? pickup;
  final LatLng? dropoff;
  final LatLng? current;
  final String status;
  final String destinationLabel;

  const LiveTripMapCard({
    super.key,
    required this.pickup,
    required this.dropoff,
    required this.current,
    required this.status,
    required this.destinationLabel,
  });

  @override
  State<LiveTripMapCard> createState() => _LiveTripMapCardState();
}

class _LiveTripMapCardState extends State<LiveTripMapCard> {
  List<LatLng> _route = [];
  List<LatLng> _remaining = [];

  @override
  void initState() {
    super.initState();
    _loadRoute();
    _loadRemaining();
  }

  @override
  void didUpdateWidget(covariant LiveTripMapCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.pickup != widget.pickup || oldWidget.dropoff != widget.dropoff) {
      _loadRoute();
    }
    if (oldWidget.current != widget.current || oldWidget.dropoff != widget.dropoff) {
      _loadRemaining();
    }
  }

  Future<void> _loadRoute() async {
    final p = widget.pickup;
    final d = widget.dropoff;
    if (p == null || d == null) {
      if (mounted) setState(() => _route = []);
      return;
    }
    final line = await RouteService.shortestPath(p, d);
    if (!mounted) return;
    setState(() => _route = line);
  }

  Future<void> _loadRemaining() async {
    final c = widget.current;
    final d = widget.dropoff;
    if (c == null || d == null) {
      if (mounted) setState(() => _remaining = []);
      return;
    }
    final line = await RouteService.shortestPath(c, d);
    if (!mounted) return;
    setState(() => _remaining = line);
  }

  int _statusProgress(String status) {
    switch (status.toLowerCase()) {
      case "requested":
        return 5;
      case "accepted":
        return 20;
      case "arrived":
        return 35;
      case "started":
      case "ongoing":
        return 60;
      case "completed":
        return 100;
      default:
        return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.pickup;
    final d = widget.dropoff;
    final c = widget.current;
    final center = c ?? p ?? d ?? const LatLng(23.8103, 90.4125);
    final totalKm = (p != null && d != null) ? haversineKm(p, d) : 0.0;
    final remKm = (c != null && d != null) ? haversineKm(c, d) : totalKm;
    final byDistance = totalKm > 0 ? ((totalKm - remKm) / totalKm * 100).clamp(0, 100).round() : _statusProgress(widget.status);
    final progress = widget.status.toLowerCase() == "completed" ? 100 : byDistance;

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: SizedBox(
        height: 210,
        child: Stack(
          children: [
            FlutterMap(
              options: MapOptions(initialCenter: center, initialZoom: 13),
              children: [
                TileLayer(
                  urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                  userAgentPackageName: "com.transitely.frontend_app",
                ),
                if (_route.isNotEmpty) PolylineLayer(polylines: [Polyline(points: _route, color: const Color(0xFF93C5FD), strokeWidth: 4)]),
                if (_remaining.isNotEmpty) PolylineLayer(polylines: [Polyline(points: _remaining, color: kPrimary, strokeWidth: 5)]),
                MarkerLayer(
                  markers: [
                    if (p != null)
                      Marker(point: p, width: 26, height: 26, child: const Icon(Icons.circle, color: Color(0xFF34C759), size: 18)),
                    if (d != null)
                      Marker(point: d, width: 26, height: 26, child: const Icon(Icons.place_rounded, color: kDanger, size: 20)),
                    if (c != null)
                      Marker(point: c, width: 26, height: 26, child: const Icon(Icons.navigation_rounded, color: kPrimary, size: 20)),
                  ],
                ),
              ],
            ),
            Positioned(
              top: 8,
              left: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.92), borderRadius: BorderRadius.circular(999), border: Border.all(color: kCardBorder)),
                child: Text(
                  "Going to: ${widget.destinationLabel.isEmpty ? "Destination" : widget.destinationLabel}",
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: kText),
                ),
              ),
            ),
            Positioned(
              bottom: 8,
              left: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.92), borderRadius: BorderRadius.circular(999), border: Border.all(color: kCardBorder)),
                child: Text(
                  "Progress $progress% · Remaining ${remKm.isFinite ? remKm.toStringAsFixed(1) : "0.0"} km",
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: kPrimary),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
