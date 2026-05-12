import "dart:async";

import "package:flutter/material.dart";
import "package:flutter_map/flutter_map.dart";
import "package:latlong2/latlong.dart";

import "../../core/app_theme.dart";
import "../../services/geocoding_service.dart";
import "../../services/rider_service.dart";

class RiderBookTab extends StatefulWidget {
  const RiderBookTab({super.key});

  @override
  State<RiderBookTab> createState() => _RiderBookTabState();
}

class _RiderBookTabState extends State<RiderBookTab> {
  final _promo = TextEditingController();
  final _pickupCtrl = TextEditingController();
  final _dropoffCtrl = TextEditingController();
  final LayerLink _pickupLayerLink = LayerLink();
  final LayerLink _dropoffLayerLink = LayerLink();
  OverlayEntry? _pickupOverlayEntry;
  OverlayEntry? _dropoffOverlayEntry;
  double _pickupAnchorWidth = 0;
  double _dropoffAnchorWidth = 0;
  String _rideType = "single";
  /// Matches web: city · intercity_reserve · daytrip → API ride_type (see [_apiRideType]).
  String _tripCategory = "city";
  String _bookingMode = "full_car";
  int _capacity = 5;
  int _party = 1;
  LatLng? _pickup;
  LatLng? _dropoff;
  List<PlaceSuggestion> _pickupOptions = [];
  List<PlaceSuggestion> _dropoffOptions = [];
  Timer? _pickupDebounce;
  Timer? _dropoffDebounce;
  bool _pickupSearchBusy = false;
  bool _dropoffSearchBusy = false;
  bool _busy = false;
  List<dynamic> _activeDrivers = [];
  List<dynamic> _pastDrivers = [];
  bool _driversLoading = false;
  String _selectedDriverId = "";
  Timer? _driversPoll;

  @override
  void initState() {
    super.initState();
    _loadDriverChoices();
    _driversPoll = Timer.periodic(const Duration(seconds: 8), (_) => _loadDriverChoices());
  }

  @override
  void dispose() {
    _pickupDebounce?.cancel();
    _dropoffDebounce?.cancel();
    _driversPoll?.cancel();
    _removePickupOverlay();
    _removeDropoffOverlay();
    _promo.dispose();
    _pickupCtrl.dispose();
    _dropoffCtrl.dispose();
    super.dispose();
  }

  void _removePickupOverlay() {
    _pickupOverlayEntry?.remove();
    _pickupOverlayEntry = null;
  }

  void _removeDropoffOverlay() {
    _dropoffOverlayEntry?.remove();
    _dropoffOverlayEntry = null;
  }

  void _syncPickupOverlay() {
    _removePickupOverlay();
    if (!mounted || _pickupOptions.isEmpty) return;
    final overlay = Overlay.maybeOf(context);
    if (overlay == null) return;
    final w = _pickupAnchorWidth;
    if (w <= 0) return;

    _pickupOverlayEntry = OverlayEntry(
      builder: (ctx) => CompositedTransformFollower(
        link: _pickupLayerLink,
        targetAnchor: Alignment.bottomLeft,
        followerAnchor: Alignment.topLeft,
        offset: const Offset(0, 4),
        child: SizedBox(
          width: w,
          child: Material(
            elevation: 16,
            shadowColor: Colors.black54,
            borderRadius: BorderRadius.circular(12),
            clipBehavior: Clip.antiAlias,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 280),
              child: ListView.separated(
                padding: EdgeInsets.zero,
                shrinkWrap: true,
                itemCount: _pickupOptions.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (context, i) {
                  final p = _pickupOptions[i];
                  return ListTile(
                    dense: true,
                    title: Text(p.label, maxLines: 3, overflow: TextOverflow.ellipsis),
                    onTap: () => _applyPickup(p),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
    overlay.insert(_pickupOverlayEntry!);
  }

  void _syncDropoffOverlay() {
    _removeDropoffOverlay();
    if (!mounted || _dropoffOptions.isEmpty) return;
    final overlay = Overlay.maybeOf(context);
    if (overlay == null) return;
    final w = _dropoffAnchorWidth;
    if (w <= 0) return;

    _dropoffOverlayEntry = OverlayEntry(
      builder: (ctx) => CompositedTransformFollower(
        link: _dropoffLayerLink,
        targetAnchor: Alignment.bottomLeft,
        followerAnchor: Alignment.topLeft,
        offset: const Offset(0, 4),
        child: SizedBox(
          width: w,
          child: Material(
            elevation: 16,
            shadowColor: Colors.black54,
            borderRadius: BorderRadius.circular(12),
            clipBehavior: Clip.antiAlias,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 280),
              child: ListView.separated(
                padding: EdgeInsets.zero,
                shrinkWrap: true,
                itemCount: _dropoffOptions.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (context, i) {
                  final p = _dropoffOptions[i];
                  return ListTile(
                    dense: true,
                    title: Text(p.label, maxLines: 3, overflow: TextOverflow.ellipsis),
                    onTap: () => _applyDropoff(p),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
    overlay.insert(_dropoffOverlayEntry!);
  }

  void _scheduleOverlaySync() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _syncPickupOverlay();
      _syncDropoffOverlay();
    });
  }

  void _onPickupTyped(String _) {
    setState(() {
      _pickup = null;
      _pickupOptions = [];
    });
    _removePickupOverlay();
    _pickupDebounce?.cancel();
    _pickupDebounce = Timer(const Duration(milliseconds: 400), _searchPickup);
  }

  void _onDropoffTyped(String _) {
    setState(() {
      _dropoff = null;
      _dropoffOptions = [];
    });
    _removeDropoffOverlay();
    _dropoffDebounce?.cancel();
    _dropoffDebounce = Timer(const Duration(milliseconds: 400), _searchDropoff);
  }

  Future<void> _searchPickup() async {
    final q = _pickupCtrl.text.trim();
    if (q.length < 3) {
      if (mounted) {
        setState(() => _pickupOptions = []);
        _removePickupOverlay();
      }
      return;
    }
    setState(() => _pickupSearchBusy = true);
    try {
      final list = await GeocodingService.searchPlaces(q);
      if (!mounted) return;
      setState(() => _pickupOptions = list);
      _scheduleOverlaySync();
    } catch (_) {
      if (mounted) {
        setState(() => _pickupOptions = []);
        _removePickupOverlay();
      }
    } finally {
      if (mounted) setState(() => _pickupSearchBusy = false);
    }
  }

  Future<void> _searchDropoff() async {
    final q = _dropoffCtrl.text.trim();
    if (q.length < 3) {
      if (mounted) {
        setState(() => _dropoffOptions = []);
        _removeDropoffOverlay();
      }
      return;
    }
    setState(() => _dropoffSearchBusy = true);
    try {
      final list = await GeocodingService.searchPlaces(q);
      if (!mounted) return;
      setState(() => _dropoffOptions = list);
      _scheduleOverlaySync();
    } catch (_) {
      if (mounted) {
        setState(() => _dropoffOptions = []);
        _removeDropoffOverlay();
      }
    } finally {
      if (mounted) setState(() => _dropoffSearchBusy = false);
    }
  }

  void _applyPickup(PlaceSuggestion p) {
    _pickupDebounce?.cancel();
    setState(() {
      _pickup = LatLng(p.lat, p.lng);
      _pickupCtrl.text = p.label;
      _pickupOptions = [];
    });
    _removePickupOverlay();
    FocusScope.of(context).unfocus();
    _loadDriverChoices();
  }

  void _applyDropoff(PlaceSuggestion p) {
    _dropoffDebounce?.cancel();
    setState(() {
      _dropoff = LatLng(p.lat, p.lng);
      _dropoffCtrl.text = p.label;
      _dropoffOptions = [];
    });
    _removeDropoffOverlay();
    FocusScope.of(context).unfocus();
  }

  Future<void> _loadDriverChoices() async {
    if (!mounted) return;
    setState(() => _driversLoading = true);
    try {
      final data = await RiderService.driverChoices(
        pickupLat: _pickup?.latitude,
        pickupLng: _pickup?.longitude,
      );
      if (!mounted) return;
      setState(() {
        _activeDrivers = (data["activeDrivers"] as List?) ?? [];
        _pastDrivers = (data["pastDrivers"] as List?) ?? [];
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _activeDrivers = [];
        _pastDrivers = [];
      });
    } finally {
      if (mounted) setState(() => _driversLoading = false);
    }
  }

  /// Backend accepts one `ride_type`; intercity categories map to dedicated enum values.
  String _apiRideType() {
    switch (_tripCategory) {
      case "intercity_reserve":
        return "intercity-reserve";
      case "daytrip":
        return "intercity-day-trip";
      case "city":
      default:
        return _rideType;
    }
  }

  Future<void> _submit() async {
    if (_pickup == null || _dropoff == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Search and select pickup and dropoff from the list.")),
      );
      return;
    }
    setState(() => _busy = true);
    try {
      final pu = _pickupCtrl.text.trim();
      final dr = _dropoffCtrl.text.trim();
      final bookingRes = await RiderService.requestRide({
        "pickup_address": pu.isEmpty ? "${_pickup!.latitude.toStringAsFixed(5)}, ${_pickup!.longitude.toStringAsFixed(5)}" : pu,
        "dropoff_address": dr.isEmpty ? "${_dropoff!.latitude.toStringAsFixed(5)}, ${_dropoff!.longitude.toStringAsFixed(5)}" : dr,
        "pickup_lat": _pickup!.latitude,
        "pickup_lng": _pickup!.longitude,
        "dropoff_lat": _dropoff!.latitude,
        "dropoff_lng": _dropoff!.longitude,
        "ride_type": _apiRideType(),
        "booking_mode": _bookingMode,
        "vehicle_capacity": _capacity,
        "party_size": _bookingMode == "seat_share" ? _party : _capacity,
        "promo_code": _promo.text.trim(),
        if (_selectedDriverId.isNotEmpty) "selected_driver_id": _selectedDriverId,
      });
      if (!mounted) return;
      final m = bookingRes["matching"];
      final selectedId = "${m is Map ? (m["selectedDriverId"] ?? "") : ""}";
      final selectedApplied = m is Map && m["selectedDriverApplied"] == true;
      var extra = "";
      if (m is Map) {
        final n = m["eligibleDriversNearPickup"];
        final pre = m["preAssignedToNearestDriver"];
        if (n is num) {
          extra = " · $n driver${n == 1 ? "" : "s"} eligible near pickup";
          if (pre == true) extra += " (nearest notified)";
        }
      }
      final chosenMsg = selectedId.trim().isEmpty
          ? "Ride requested! Trip is live — finding a driver.$extra"
          : selectedApplied
              ? "Ride requested! Your selected driver was notified first.$extra"
              : "Ride requested! Selected driver unavailable now — nearest eligible driver was notified.$extra";
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(chosenMsg)));
      setState(() {
        _pickup = null;
        _dropoff = null;
        _pickupCtrl.clear();
        _dropoffCtrl.clear();
        _pickupOptions = [];
        _dropoffOptions = [];
        _promo.clear();
        _tripCategory = "city";
        _selectedDriverId = "";
      });
      _removePickupOverlay();
      _removeDropoffOverlay();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final markers = <Marker>[];
    if (_pickup != null) {
      markers.add(
        Marker(
          point: _pickup!,
          width: 36,
          height: 36,
          alignment: Alignment.center,
          child: const Icon(Icons.circle, color: Color(0xFF34C759), size: 22),
        ),
      );
    }
    if (_dropoff != null) {
      markers.add(
        Marker(
          point: _dropoff!,
          width: 36,
          height: 36,
          alignment: Alignment.center,
          child: const Icon(Icons.circle, color: kDanger, size: 22),
        ),
      );
    }

    final polylines = <Polyline>[];
    if (_pickup != null && _dropoff != null) {
      polylines.add(Polyline(points: [_pickup!, _dropoff!], color: kPrimary, strokeWidth: 4));
    }

    LatLng mapCenter = const LatLng(23.8103, 90.4125);
    if (_pickup != null && _dropoff != null) {
      mapCenter = LatLng(
        (_pickup!.latitude + _dropoff!.latitude) / 2,
        (_pickup!.longitude + _dropoff!.longitude) / 2,
      );
    } else if (_pickup != null) {
      mapCenter = _pickup!;
    } else if (_dropoff != null) {
      mapCenter = _dropoff!;
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 120),
      children: [
        const Text("Ride type", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          children: [
            _chip("single", "Single"),
            _chip("share", "Share"),
            _chip("family", "Family"),
          ],
        ),
        const SizedBox(height: 16),
        const Text("Trip category", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: _tripCatChip(key: "city", label: "Inside City", icon: Icons.apartment_rounded)),
            const SizedBox(width: 8),
            Expanded(child: _tripCatChip(key: "intercity_reserve", label: "Intercity", icon: Icons.alt_route_rounded)),
            const SizedBox(width: 8),
            Expanded(child: _tripCatChip(key: "daytrip", label: "Day trip", icon: Icons.wb_sunny_rounded)),
          ],
        ),
        const SizedBox(height: 16),
        const Text("Booking", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: ChoiceChip(
                avatar: Icon(Icons.directions_car_filled_rounded, size: 18, color: _bookingMode == "full_car" ? kPrimary : kMuted),
                label: const Text("Full car"),
                selected: _bookingMode == "full_car",
                onSelected: (_) => setState(() {
                  _bookingMode = "full_car";
                  _party = _capacity;
                }),
                selectedColor: kPrimary.withValues(alpha: 0.2),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ChoiceChip(
                avatar: Icon(Icons.people_rounded, size: 18, color: _bookingMode == "seat_share" ? kPrimary : kMuted),
                label: const Text("Share seats"),
                selected: _bookingMode == "seat_share",
                onSelected: (_) => setState(() => _bookingMode = "seat_share"),
                selectedColor: kPrimary.withValues(alpha: 0.2),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<int>(
                initialValue: _capacity,
                decoration: const InputDecoration(labelText: "Car seats", border: OutlineInputBorder()),
                items: [4, 5, 6, 7, 8].map((n) => DropdownMenuItem(value: n, child: Text("$n seats"))).toList(),
                onChanged: (v) => setState(() {
                  _capacity = v ?? 5;
                  _party = _party.clamp(1, _capacity);
                }),
              ),
            ),
            const SizedBox(width: 12),
            if (_bookingMode == "seat_share")
              Expanded(
                child: DropdownButtonFormField<int>(
                  initialValue: _party.clamp(1, _capacity),
                  decoration: const InputDecoration(labelText: "Your group", border: OutlineInputBorder()),
                  items: List.generate(_capacity, (i) => i + 1).map((n) => DropdownMenuItem(value: n, child: Text("$n seat${n == 1 ? "" : "s"}"))).toList(),
                  onChanged: (v) => setState(() => _party = v ?? 1),
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),
        const Text("Pickup", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
        const SizedBox(height: 6),
        LayoutBuilder(
          builder: (context, constraints) {
            _pickupAnchorWidth = constraints.maxWidth;
            return CompositedTransformTarget(
              link: _pickupLayerLink,
              child: TextField(
                controller: _pickupCtrl,
                onChanged: _onPickupTyped,
                decoration: const InputDecoration(
                  hintText: "Search address or place",
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.search_rounded),
                ),
              ),
            );
          },
        ),
        if (_pickupSearchBusy) const LinearProgressIndicator(minHeight: 2),
        const SizedBox(height: 14),
        const Text("Dropoff", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
        const SizedBox(height: 6),
        LayoutBuilder(
          builder: (context, constraints) {
            _dropoffAnchorWidth = constraints.maxWidth;
            return CompositedTransformTarget(
              link: _dropoffLayerLink,
              child: TextField(
                controller: _dropoffCtrl,
                onChanged: _onDropoffTyped,
                decoration: const InputDecoration(
                  hintText: "Search address or place",
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.search_rounded),
                ),
              ),
            );
          },
        ),
        if (_dropoffSearchBusy) const LinearProgressIndicator(minHeight: 2),
        const SizedBox(height: 12),
        Row(
          children: [
            const Expanded(
              child: Text("Choose driver (optional)", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
            ),
            if (_selectedDriverId.isNotEmpty)
              TextButton(
                onPressed: () => setState(() => _selectedDriverId = ""),
                child: const Text("Clear"),
              ),
            TextButton(onPressed: _driversLoading ? null : _loadDriverChoices, child: const Text("Refresh")),
          ],
        ),
        if (_selectedDriverId.isNotEmpty)
          const Padding(
            padding: EdgeInsets.only(bottom: 6),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text("Preferred driver selected.", style: TextStyle(fontSize: 12, color: kPrimary, fontWeight: FontWeight.w700)),
            ),
          ),
        if (_driversLoading)
          const LinearProgressIndicator(minHeight: 2)
        else ...[
          const SizedBox(height: 6),
          const Text("Active drivers nearby", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: kMuted)),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: _activeDrivers.take(8).map((d) {
              final id = "${d["_id"] ?? ""}";
              final label = "${d["name"] ?? "Driver"}${d["distanceKm"] != null ? " · ${d["distanceKm"]} km" : " · GPS updating"}";
              return ChoiceChip(
                label: Text(label),
                selected: _selectedDriverId == id,
                onSelected: (_) => setState(() => _selectedDriverId = id),
              );
            }).toList(),
          ),
          if (_activeDrivers.isEmpty) const Text("No active drivers listed.", style: TextStyle(fontSize: 12, color: kMuted)),
          const SizedBox(height: 8),
          const Text("Past drivers", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: kMuted)),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: _pastDrivers.take(8).map((d) {
              final id = "${d["_id"] ?? ""}";
              final label = "${d["name"] ?? "Driver"} · ${d["activeNow"] == true ? "online" : "offline"}";
              return ChoiceChip(
                label: Text(label),
                selected: _selectedDriverId == id,
                onSelected: (_) => setState(() => _selectedDriverId = id),
              );
            }).toList(),
          ),
          if (_pastDrivers.isEmpty) const Text("No past drivers yet.", style: TextStyle(fontSize: 12, color: kMuted)),
        ],
        const SizedBox(height: 12),
        const Text("Route preview (map is read-only)", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: kMuted)),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: SizedBox(
            height: 220,
            child: IgnorePointer(
              child: FlutterMap(
                key: ValueKey("${_pickup?.latitude}_${_pickup?.longitude}_${_dropoff?.latitude}_${_dropoff?.longitude}"),
                options: MapOptions(
                  initialCenter: mapCenter,
                  initialZoom: 12,
                ),
                children: [
                  TileLayer(
                    urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                    userAgentPackageName: "com.transitely.frontend_app",
                  ),
                  if (polylines.isNotEmpty) PolylineLayer(polylines: polylines),
                  MarkerLayer(markers: markers),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _promo,
          decoration: const InputDecoration(labelText: "Promo code (optional)", border: OutlineInputBorder()),
        ),
        const SizedBox(height: 8),
        const Text(
          "Fare is confirmed when you request; pay after the trip ends from Trip History with Cash, bKash, Nagad, or Card.",
          style: TextStyle(fontSize: 12, color: kMuted),
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: _busy ? null : _submit,
          icon: _busy ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.navigation_rounded),
          label: Text(_busy ? "Requesting…" : "Request ride"),
          style: FilledButton.styleFrom(backgroundColor: kPrimary, foregroundColor: Colors.white, minimumSize: const Size.fromHeight(52)),
        ),
      ],
    );
  }

  Widget _chip(String key, String label) {
    final sel = _rideType == key;
    return FilterChip(
      label: Text(label),
      selected: sel,
      onSelected: (_) => setState(() => _rideType = key),
      selectedColor: kPrimary.withValues(alpha: 0.2),
      checkmarkColor: kPrimary,
    );
  }

  Widget _tripCatChip({required String key, required String label, required IconData icon}) {
    final sel = _tripCategory == key;
    return Material(
      color: sel ? const Color(0xFF1C2731) : Colors.white,
      borderRadius: BorderRadius.circular(14),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => setState(() => _tripCategory = key),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: sel ? const Color(0xFF1C2731) : kCardBorder),
          ),
          child: Column(
            children: [
              Icon(icon, size: 22, color: sel ? const Color(0xFF7EC8FF) : kMuted),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  height: 1.15,
                  color: sel ? Colors.white : kText,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
