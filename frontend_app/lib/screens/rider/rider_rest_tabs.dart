import "package:flutter/material.dart";
import "../../core/app_theme.dart";
import "../../services/rider_service.dart";

String _pu(dynamic r) => "${r["pickupAddress"] ?? r["pickup_address"] ?? ""}";
String _do(dynamic r) => "${r["dropoffAddress"] ?? r["dropoff_address"] ?? ""}";
String _st(dynamic r) => "${r["status"] ?? ""}".toLowerCase();

bool _active(dynamic r) {
  final s = _st(r);
  return ["requested", "accepted", "arrived", "started"].contains(s);
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

  @override
  void initState() {
    super.initState();
    _load();
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

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
        children: [
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          Text(
            "Hi, ${_profile["name"] ?? "Rider"}",
            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: kText),
          ),
          const SizedBox(height: 6),
          const Text("Overview & quick actions", style: TextStyle(color: kMuted, fontWeight: FontWeight.w600)),
          const SizedBox(height: 18),
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
                    const Text("Ride in progress", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                    const SizedBox(height: 8),
                    Text("${_pu(active)} → ${_do(active)}", style: const TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Text("Status: ${_st(active)}", style: const TextStyle(color: kMuted, fontSize: 13)),
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
                subtitle: const Text("OpenStreetMap pickup & dropoff, fare split options."),
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

  @override
  void initState() {
    super.initState();
    _load();
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
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_st(r).toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: kPrimary)),
                      const SizedBox(height: 8),
                      Text("${_pu(r)} → ${_do(r)}", style: const TextStyle(fontWeight: FontWeight.w700)),
                      Text("Fare ৳${r["fare"] ?? 0}", style: const TextStyle(color: kMuted)),
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

class RiderHistoryTab extends StatefulWidget {
  const RiderHistoryTab({super.key});

  @override
  State<RiderHistoryTab> createState() => _RiderHistoryTabState();
}

class _RiderHistoryTabState extends State<RiderHistoryTab> {
  List<dynamic> _rides = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final rides = await RiderService.rides();
      if (!mounted) return;
      setState(() => _rides = rides);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final past = _rides.where((r) => !_active(r)).toList();
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
        itemCount: past.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) {
          final r = past[i];
          return ListTile(
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: kCardBorder)),
            title: Text("${_pu(r)} → ${_do(r)}", style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
            subtitle: Text("${_st(r)} · ৳${r["fare"] ?? 0}"),
          );
        },
      ),
    );
  }
}

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

  @override
  void initState() {
    super.initState();
    _load();
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
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
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
            ..._payments.take(8).map((p) => ListTile(
                  tileColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  title: Text("৳${p["amount"] ?? 0}", style: const TextStyle(fontWeight: FontWeight.w800)),
                  subtitle: Text("${p["method"] ?? ""} · ${p["status"] ?? ""}"),
                )),
          const SizedBox(height: 22),
          const Text("Alerts", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          const SizedBox(height: 8),
          if (_notes.isEmpty)
            const Text("No notifications.", style: TextStyle(color: kMuted))
          else
            ..._notes.take(10).map((n) => ListTile(
                  leading: const Icon(Icons.notifications_active_outlined, color: kPrimary),
                  title: Text("${n["title"] ?? ""}", style: const TextStyle(fontWeight: FontWeight.w700)),
                  subtitle: Text("${n["message"] ?? ""}"),
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

