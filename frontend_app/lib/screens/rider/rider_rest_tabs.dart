import "dart:async";

import "package:flutter/material.dart";
import "package:latlong2/latlong.dart";
import "../../core/app_theme.dart";
import "../../services/rider_service.dart";
import "../../utils/ride_status.dart";

import "rider_trip_summary_sheet.dart";
import "../../widgets/live_trip_map_card.dart";

String _pu(dynamic r) => "${r["pickupAddress"] ?? r["pickup_address"] ?? ""}";
String _do(dynamic r) => "${r["dropoffAddress"] ?? r["dropoff_address"] ?? ""}";
String _st(dynamic r) => "${r["status"] ?? ""}".toLowerCase();

bool _active(dynamic r) {
  final s = _st(r);
  return ["requested", "accepted", "arrived", "started", "ongoing"].contains(s);
}

class RiderHomeTab extends StatefulWidget {
  final void Function(int tab) onGoTab;

  const RiderHomeTab({super.key, required this.onGoTab});

  @override
  State<RiderHomeTab> createState() => _RiderHomeTabState();
}

class _RiderHomeTabState extends State<RiderHomeTab> {
  Map<String, dynamic> _profile = {};
  List<dynamic> _rides = [];
  bool _loading = true;
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    _load();
    _poll = Timer.periodic(const Duration(seconds: 10), (_) => _load());
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final p = await RiderService.profile();
      final rides = await RiderService.rides();
      if (!mounted) return;
      setState(() {
        _profile = (p["data"] as Map?)?.cast<String, dynamic>() ?? {};
        _rides = rides;
      });
    } catch (_) {
      if (mounted) setState(() {});
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final active = _rides.cast<dynamic>().where(_active).firstOrNull;
    final name = "${_profile["name"] ?? "Rider"}".trim();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
        children: [
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(22),
              gradient: const LinearGradient(
                colors: [Color(0xFF111827), Color(0xFF1E3A8A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Hi, $name", style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                      const SizedBox(height: 4),
                      const Text("Ready for your next ride?", style: TextStyle(color: Color(0xFFC7D2FE), fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  alignment: Alignment.center,
                  child: const Icon(Icons.route_rounded, color: Colors.white),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(child: _quickAction("Book", Icons.local_taxi_rounded, () => widget.onGoTab(1))),
              const SizedBox(width: 10),
              Expanded(child: _quickAction("Track", Icons.navigation_rounded, () => widget.onGoTab(2))),
              const SizedBox(width: 10),
              Expanded(child: _quickAction("History", Icons.history_rounded, () => widget.onGoTab(3))),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _statCard("Trips", "${_rides.length}", Icons.directions_car_filled_rounded)),
              const SizedBox(width: 10),
              Expanded(child: _statCard("Active", active != null ? "Yes" : "No", Icons.navigation_rounded)),
            ],
          ),
          const SizedBox(height: 18),
          if (active != null)
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: kCardBorder)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(riderFacingRideUi("${active["status"]}").headline, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: kPrimary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        riderFacingRideUi("${active["status"]}").badge,
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: kPrimary, letterSpacing: 0.3),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text("${_pu(active)} → ${_do(active)}", style: const TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Text(riderFacingRideUi("${active["status"]}").subtitle, style: const TextStyle(color: kMuted, fontSize: 13, height: 1.35)),
                    if (_st(active) == "requested") ...[
                      const SizedBox(height: 10),
                      Text(kDriverMatchingExplainer, style: TextStyle(color: kMuted.withValues(alpha: 0.95), fontSize: 12, height: 1.35)),
                    ],
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        FilledButton(
                          onPressed: () => widget.onGoTab(2),
                          style: FilledButton.styleFrom(backgroundColor: kPrimary),
                          child: const Text("Track ride"),
                        ),
                        const SizedBox(width: 10),
                        OutlinedButton(onPressed: () => widget.onGoTab(1), child: const Text("Book another")),
                      ],
                    ),
                  ],
                ),
              ),
            )
          else
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: kCardBorder)),
              child: ListTile(
                contentPadding: const EdgeInsets.all(18),
                leading: CircleAvatar(backgroundColor: kPrimary.withOpacity(0.12), child: const Icon(Icons.add_road_rounded, color: kPrimary)),
                title: const Text("Book a ride", style: TextStyle(fontWeight: FontWeight.w800)),
                subtitle: const Text("Search pickup & dropoff, fare split options."),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => widget.onGoTab(1),
              ),
            ),
        ],
      ),
    );
  }

  Widget _statCard(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kCardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: kPrimary, size: 22),
          const SizedBox(height: 10),
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
          Text(label, style: const TextStyle(color: kMuted, fontWeight: FontWeight.w600, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _quickAction(String label, IconData icon, VoidCallback onTap) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: kCardBorder),
          ),
          child: Column(
            children: [
              Icon(icon, color: kPrimary),
              const SizedBox(height: 6),
              Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}

extension _FirstOrNull<E> on Iterable<E> {
  E? get firstOrNull {
    final i = iterator;
    return i.moveNext() ? i.current : null;
  }
}

class RiderActiveTab extends StatefulWidget {
  final void Function(int tab) onGoTab;

  const RiderActiveTab({super.key, required this.onGoTab});

  @override
  State<RiderActiveTab> createState() => _RiderActiveTabState();
}

class _RiderActiveTabState extends State<RiderActiveTab> {
  List<dynamic> _rides = [];
  bool _loading = true;
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    _load();
    _poll = Timer.periodic(const Duration(seconds: 10), (_) => _load());
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final rides = await RiderService.rides();
      if (!mounted) return;
      setState(() => _rides = rides);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _cancel(String id) async {
    try {
      await RiderService.cancelRide(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Ride cancelled.")));
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
    }
  }

  @override
  Widget build(BuildContext context) {
    final active = _rides.where(_active).toList();
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
        children: [
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          if (active.isEmpty)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Center(child: Text("No active rides.", style: TextStyle(color: kMuted, fontWeight: FontWeight.w600))),
            )
          else
            ...active.map((r) {
              final id = "${r["_id"] ?? r["id"]}";
              final ui = riderFacingRideUi("${r["status"]}");
              final pLat = num.tryParse("${r["pickupLat"] ?? ""}")?.toDouble();
              final pLng = num.tryParse("${r["pickupLng"] ?? ""}")?.toDouble();
              final dLat = num.tryParse("${r["dropoffLat"] ?? ""}")?.toDouble();
              final dLng = num.tryParse("${r["dropoffLng"] ?? ""}")?.toDouble();
              final pickup = (pLat != null && pLng != null) ? LatLng(pLat, pLng) : null;
              final dropoff = (dLat != null && dLng != null) ? LatLng(dLat, dLng) : null;
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      LiveTripMapCard(
                        pickup: pickup,
                        dropoff: dropoff,
                        current: null,
                        status: "${r["status"] ?? ""}",
                        destinationLabel: "${r["dropoffAddress"] ?? ""}",
                      ),
                      const SizedBox(height: 10),
                      Text(ui.headline, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: kText)),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: kPrimary.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
                        child: Text(ui.badge, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: kPrimary)),
                      ),
                      const SizedBox(height: 8),
                      Text(ui.subtitle, style: const TextStyle(color: kMuted, fontSize: 13, height: 1.35)),
                      const SizedBox(height: 10),
                      Text("${_pu(r)} → ${_do(r)}", style: const TextStyle(fontWeight: FontWeight.w700)),
                      Text("Fare ৳${r["fare"] ?? 0}", style: const TextStyle(color: kMuted)),
                      if (_st(r) == "requested") ...[
                        const SizedBox(height: 10),
                        Text(kDriverMatchingExplainer, style: TextStyle(color: kMuted.withValues(alpha: 0.95), fontSize: 12, height: 1.35)),
                      ],
                      const SizedBox(height: 10),
                      OutlinedButton(
                        onPressed: () => _cancel(id),
                        style: OutlinedButton.styleFrom(foregroundColor: kDanger),
                        child: const Text("Cancel ride"),
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}

class RiderIncomingTab extends StatefulWidget {
  final void Function(bool hasIncoming)? onIncomingChanged;
  final VoidCallback? onGoActive;

  const RiderIncomingTab({super.key, this.onIncomingChanged, this.onGoActive});

  @override
  State<RiderIncomingTab> createState() => _RiderIncomingTabState();
}

class _RiderIncomingTabState extends State<RiderIncomingTab> {
  List<dynamic> _rides = [];
  bool _loading = true;
  Timer? _poll;
  String _busyRideId = "";

  @override
  void initState() {
    super.initState();
    _load();
    _poll = Timer.periodic(const Duration(seconds: 8), (_) => _load());
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final rides = await RiderService.rides();
      if (!mounted) return;
      final incoming = rides.where((r) => _active(r)).toList();
      widget.onIncomingChanged?.call(incoming.isNotEmpty);
      setState(() => _rides = incoming);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _accept(String id) async {
    try {
      setState(() => _busyRideId = id);
      await RiderService.riderAcceptRide(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Ride accepted.")));
      widget.onGoActive?.call();
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
    } finally {
      if (mounted) setState(() => _busyRideId = "");
    }
  }

  Future<void> _reject(String id) async {
    try {
      setState(() => _busyRideId = id);
      await RiderService.cancelRide(id, reason: "Rejected by rider from incoming tab");
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Ride rejected.")));
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
    } finally {
      if (mounted) setState(() => _busyRideId = "");
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
        children: [
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          const Text("Incoming live rides", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: kText)),
          const SizedBox(height: 4),
          const Text("Accept or reject live ride requests in real time.", style: TextStyle(color: kMuted, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          if (_rides.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 32),
              child: Center(child: Text("No incoming live rides.", style: TextStyle(color: kMuted, fontWeight: FontWeight.w600))),
            )
          else
            ..._rides.map((r) {
              final id = "${r["_id"] ?? r["id"]}";
              final ui = riderFacingRideUi("${r["status"]}");
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: kCardBorder)),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(child: Text(ui.badge, style: const TextStyle(fontWeight: FontWeight.w800))),
                          Text("${r["createdAt"] ?? ""}".toString().split(".").first, style: const TextStyle(fontSize: 11, color: kMuted)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text("${_pu(r)} → ${_do(r)}", style: const TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 10),
                      if (r["riderAccepted"] == true)
                        const Text("Accepted by you", style: TextStyle(color: kPrimary, fontWeight: FontWeight.w700, fontSize: 12)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          if (r["riderAccepted"] != true)
                            Expanded(
                              child: FilledButton(
                                onPressed: _busyRideId == id ? null : () => _accept(id),
                                style: FilledButton.styleFrom(backgroundColor: kPrimary),
                                child: const Text("Accept"),
                              ),
                            ),
                          if (r["riderAccepted"] != true) const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: _busyRideId == id ? null : () => _reject(id),
                              style: OutlinedButton.styleFrom(foregroundColor: kDanger),
                              child: const Text("Reject"),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}

class RiderHistoryTab extends StatefulWidget {
  final VoidCallback? onGoBook;

  const RiderHistoryTab({super.key, this.onGoBook});

  @override
  State<RiderHistoryTab> createState() => _RiderHistoryTabState();
}

class _RiderHistoryTabState extends State<RiderHistoryTab> {
  List<dynamic> _rides = [];
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    _load();
    _poll = Timer.periodic(const Duration(seconds: 10), (_) => _load());
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final rides = await RiderService.rides();
      if (!mounted) return;
      setState(() => _rides = rides);
    } catch (_) {}
  }

  void _openTripSummary(dynamic r) {
    showRiderTripSummarySheet(
      context,
      rideFromList: Map<String, dynamic>.from(r as Map),
      reloadRides: _load,
      onGoBook: widget.onGoBook ?? () {},
    );
  }

  @override
  Widget build(BuildContext context) {
    final past = _rides.where((r) => !_active(r)).toList();
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
        children: [
          const Text("Trip history", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: kText)),
          const SizedBox(height: 4),
          const Text("Open a completed trip to pay or view summary.", style: TextStyle(color: kMuted, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          if (past.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 28),
              child: Center(child: Text("No completed or cancelled rides yet.", style: TextStyle(color: kMuted, fontWeight: FontWeight.w600))),
            )
          else
            ...past.map((r) {
              final completed = _st(r) == "completed";
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: kCardBorder),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: completed ? () => _openTripSummary(r) : null,
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text("${_pu(r)} → ${_do(r)}", style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                          ),
                          Text("${_st(r)}", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: kMuted.withOpacity(0.95))),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text("৳${r["fare"] ?? 0}", style: const TextStyle(color: kMuted, fontWeight: FontWeight.w700)),
                      if (completed) ...[
                        const SizedBox(height: 10),
                        if (rideNeedsPayment(r))
                          const Text(
                            "Payment due — open Trip summary to pay.",
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFFFF9500)),
                          )
                        else
                          Row(
                            children: [
                              const Icon(Icons.check_circle_rounded, size: 16, color: Color(0xFF34C759)),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  "Paid · ${formatPaymentMethod("${r["paymentMethod"] ?? "cash"}")}",
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF34C759)),
                                ),
                              ),
                            ],
                          ),
                        if (r["riderRating"] != null || (r["riderFeedback"] != null && "${r["riderFeedback"]}".trim().isNotEmpty)) ...[
                          const SizedBox(height: 8),
                          Text(
                            "${r["riderRating"] != null ? "${r["riderRating"]}/5 stars" : ""}${r["riderRating"] != null && "${r["riderFeedback"] ?? ""}".trim().isNotEmpty ? " · " : ""}${"${r["riderFeedback"] ?? ""}".trim().isNotEmpty ? "Comment saved" : ""}",
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: kMuted.withOpacity(0.95)),
                          ),
                        ],
                        const SizedBox(height: 10),
                        FilledButton.icon(
                          style: FilledButton.styleFrom(backgroundColor: _riderTripSummaryTeal, foregroundColor: Colors.white),
                          onPressed: () => _openTripSummary(r),
                          icon: const Icon(Icons.receipt_long_rounded, size: 18),
                          label: const Text("Trip summary"),
                        ),
                      ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }

}

/// Match web trip summary teal accent.
const Color _riderTripSummaryTeal = Color(0xFF0F766E);

class RiderMoreTab extends StatefulWidget {
  final VoidCallback onLogout;

  const RiderMoreTab({super.key, required this.onLogout});

  @override
  State<RiderMoreTab> createState() => _RiderMoreTabState();
}

class _RiderMoreTabState extends State<RiderMoreTab> {
  Map<String, dynamic> _profile = {};
  List<dynamic> _payments = [];
  List<dynamic> _notes = [];
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    _load();
    _poll = Timer.periodic(const Duration(seconds: 10), (_) => _load());
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final p = await RiderService.profile();
      final pay = await RiderService.payments();
      final n = await RiderService.notifications();
      if (!mounted) return;
      setState(() {
        _profile = (p["data"] as Map?)?.cast<String, dynamic>() ?? {};
        _payments = pay;
        _notes = n;
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
        children: [
          const Text("Profile", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          const SizedBox(height: 10),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: const BorderSide(color: kCardBorder)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_profile["name"]?.toString() ?? "—", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                  Text(_profile["email"]?.toString() ?? "", style: const TextStyle(color: kMuted)),
                  Text(_profile["phone"]?.toString() ?? "", style: const TextStyle(color: kMuted)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 22),
          const Text("Wallet / payments", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          const SizedBox(height: 8),
          if (_payments.isEmpty)
            const Text("No payments yet.", style: TextStyle(color: kMuted))
          else
            ..._payments.take(8).map((p) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    tileColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: const BorderSide(color: kCardBorder),
                    ),
                    leading: const Icon(Icons.account_balance_wallet_rounded, color: kPrimary),
                    title: Text("৳${p["amount"] ?? 0}", style: const TextStyle(fontWeight: FontWeight.w800)),
                    subtitle: Text("${formatPaymentMethod("${p["method"]}")} · ${p["status"] ?? ""}"),
                  ),
                )),
          const SizedBox(height: 22),
          const Text("Alerts", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          const SizedBox(height: 8),
          if (_notes.isEmpty)
            const Text("No notifications.", style: TextStyle(color: kMuted))
          else
            ..._notes.take(10).map((n) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    tileColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: const BorderSide(color: kCardBorder),
                    ),
                    leading: const Icon(Icons.notifications_active_outlined, color: kPrimary),
                    title: Text("${n["title"] ?? ""}", style: const TextStyle(fontWeight: FontWeight.w700)),
                    subtitle: Text("${n["message"] ?? ""}"),
                  ),
                )),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            onPressed: widget.onLogout,
            icon: const Icon(Icons.logout_rounded, color: kDanger),
            label: const Text("Sign out", style: TextStyle(color: kDanger, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

