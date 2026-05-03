import "package:flutter/material.dart";
import "package:flutter_map/flutter_map.dart";
import "package:latlong2/latlong.dart";

import "../../core/app_theme.dart";
import "../../services/geocoding_service.dart";
import "../../services/rider_service.dart";

enum _TapTarget { pickup, dropoff }

class RiderBookTab extends StatefulWidget {
  const RiderBookTab({super.key});

  @override
  State<RiderBookTab> createState() => _RiderBookTabState();
}

class _RiderBookTabState extends State<RiderBookTab> {
  final _promo = TextEditingController();
  final _pickupCtrl = TextEditingController();
  final _dropoffCtrl = TextEditingController();
  String _rideType = "single";
  String _bookingMode = "full_car";
  int _capacity = 5;
  int _party = 1;
  _TapTarget _tap = _TapTarget.pickup;
  LatLng? _pickup;
  LatLng? _dropoff;
  String _pickupAddr = "";
  String _dropoffAddr = "";
  bool _busy = false;
  bool _geoBusy = false;

  @override
  void dispose() {
    _promo.dispose();
    _pickupCtrl.dispose();
    _dropoffCtrl.dispose();
    super.dispose();
  }

  Future<void> _onMapTap(TapPosition _, LatLng p) async {
    setState(() {
      if (_tap == _TapTarget.pickup) {
        _pickup = p;
      } else {
        _dropoff = p;
      }
      _geoBusy = true;
    });
    try {
      final addr = await GeocodingService.reverse(p.latitude, p.longitude);
      if (!mounted) return;
      setState(() {
        if (_tap == _TapTarget.pickup) {
          _pickupAddr = addr;
          _pickupCtrl.text = addr;
        } else {
          _dropoffAddr = addr;
          _dropoffCtrl.text = addr;
        }
      });
    } finally {
      if (mounted) setState(() => _geoBusy = false);
    }
  }

  Future<void> _submit() async {
    if (_pickup == null || _dropoff == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Set pickup and dropoff on the map.")));
      return;
    }
    setState(() => _busy = true);
    try {
      final pu = _pickupCtrl.text.trim();
      final dr = _dropoffCtrl.text.trim();
      await RiderService.requestRide({
        "pickup_address": pu.isEmpty ? "${_pickup!.latitude.toStringAsFixed(5)}, ${_pickup!.longitude.toStringAsFixed(5)}" : pu,
        "dropoff_address": dr.isEmpty ? "${_dropoff!.latitude.toStringAsFixed(5)}, ${_dropoff!.longitude.toStringAsFixed(5)}" : dr,
        "pickup_lat": _pickup!.latitude,
        "pickup_lng": _pickup!.longitude,
        "dropoff_lat": _dropoff!.latitude,
        "dropoff_lng": _dropoff!.longitude,
        "ride_type": _rideType,
        "booking_mode": _bookingMode,
        "vehicle_capacity": _capacity,
        "party_size": _bookingMode == "seat_share" ? _party : _capacity,
        "promo_code": _promo.text.trim(),
        "fare": 0,
        "payment_method": "cash",
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Ride requested!")));
      setState(() {
        _pickup = null;
        _dropoff = null;
        _pickupAddr = "";
        _dropoffAddr = "";
        _pickupCtrl.clear();
        _dropoffCtrl.clear();
        _promo.clear();
      });
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
                selectedColor: kPrimary.withOpacity(0.2),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ChoiceChip(
                avatar: Icon(Icons.people_rounded, size: 18, color: _bookingMode == "seat_share" ? kPrimary : kMuted),
                label: const Text("Share seats"),
                selected: _bookingMode == "seat_share",
                onSelected: (_) => setState(() => _bookingMode = "seat_share"),
                selectedColor: kPrimary.withOpacity(0.2),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<int>(
                value: _capacity,
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
                  value: _party.clamp(1, _capacity),
                  decoration: const InputDecoration(labelText: "Your group", border: OutlineInputBorder()),
                  items: List.generate(_capacity, (i) => i + 1).map((n) => DropdownMenuItem(value: n, child: Text("$n seat${n == 1 ? "" : "s"}"))).toList(),
                  onChanged: (v) => setState(() => _party = v ?? 1),
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: ChoiceChip(
                label: const Text("Pickup pin"),
                selected: _tap == _TapTarget.pickup,
                onSelected: (_) => setState(() => _tap = _TapTarget.pickup),
                selectedColor: const Color(0xFF34C759).withOpacity(0.25),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ChoiceChip(
                label: const Text("Dropoff pin"),
                selected: _tap == _TapTarget.dropoff,
                onSelected: (_) => setState(() => _tap = _TapTarget.dropoff),
                selectedColor: const Color(0xFFFF3B30).withOpacity(0.25),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: SizedBox(
            height: 240,
            child: FlutterMap(
              options: MapOptions(
                initialCenter: const LatLng(23.8103, 90.4125),
                initialZoom: 12,
                onTap: _onMapTap,
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
        if (_geoBusy) const LinearProgressIndicator(minHeight: 2),
        const SizedBox(height: 12),
        TextField(
          controller: _pickupCtrl,
          onChanged: (v) => _pickupAddr = v,
          decoration: const InputDecoration(labelText: "Pickup address", border: OutlineInputBorder()),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: _dropoffCtrl,
          onChanged: (v) => _dropoffAddr = v,
          decoration: const InputDecoration(labelText: "Dropoff address", border: OutlineInputBorder()),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: _promo,
          decoration: const InputDecoration(labelText: "Promo code (optional)", border: OutlineInputBorder()),
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
      selectedColor: kPrimary.withOpacity(0.2),
      checkmarkColor: kPrimary,
    );
  }
}
