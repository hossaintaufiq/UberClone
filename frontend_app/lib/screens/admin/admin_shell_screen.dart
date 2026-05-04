import "dart:async";

import "package:flutter/material.dart";
import "package:shared_preferences/shared_preferences.dart";

import "../../core/app_theme.dart";
import "../../core/auth_prefs.dart";
import "../../services/admin_service.dart";
import "../../widgets/nav_assistant_sheet.dart";
import "../home_portal_screen.dart";

class AdminShellScreen extends StatefulWidget {
  const AdminShellScreen({super.key});

  @override
  State<AdminShellScreen> createState() => _AdminShellScreenState();
}

class _AdminShellScreenState extends State<AdminShellScreen> {
  int _ix = 0;

  Future<void> _backHome() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(AuthPrefs.adminToken);
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const HomePortalScreen()), (_) => false);
  }

  void _assistant() {
    NavAssistantSheet.show(
      context,
      title: "Admin Assistant",
      accentLabel: "Navigate",
      accent: const Color(0xFF1C2731),
      quickLinks: const [
        (id: "0", label: "Overview"),
        (id: "1", label: "Riders"),
        (id: "2", label: "Drivers"),
        (id: "3", label: "Rides"),
      ],
      helpText:
          "**Overview** — counts & revenue.\n**Riders / Drivers** — toggle active status.\n**Rides** — recent trips.\n\nTry **open riders**.",
      onJump: (id) {
        final i = int.tryParse(id);
        if (i != null && i >= 0 && i <= 3) setState(() => _ix = i);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      const _AdminOverview(),
      const _AdminRidersList(),
      const _AdminDriversList(),
      const _AdminRidesList(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text("Admin Portal"),
        actions: [
          IconButton(onPressed: _assistant, tooltip: "Assistant", icon: const Icon(Icons.auto_awesome_rounded)),
          IconButton(onPressed: _backHome, tooltip: "Back to home", icon: const Icon(Icons.home_outlined)),
        ],
      ),
      body: pages[_ix],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _ix,
        onDestinationSelected: (i) => setState(() => _ix = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard_rounded), label: "Overview"),
          NavigationDestination(icon: Icon(Icons.people_outline_rounded), selectedIcon: Icon(Icons.people_rounded), label: "Riders"),
          NavigationDestination(icon: Icon(Icons.local_taxi_outlined), selectedIcon: Icon(Icons.local_taxi_rounded), label: "Drivers"),
          NavigationDestination(icon: Icon(Icons.map_outlined), selectedIcon: Icon(Icons.map_rounded), label: "Rides"),
        ],
      ),
    );
  }
}

class _AdminOverview extends StatefulWidget {
  const _AdminOverview();

  @override
  State<_AdminOverview> createState() => _AdminOverviewState();
}

class _AdminOverviewState extends State<_AdminOverview> {
  Map<String, dynamic> _dash = {};
  Map<String, dynamic> _rev = {};
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
      final d = await AdminService.dashboard();
      final r = await AdminService.revenue();
      if (!mounted) return;
      setState(() {
        _dash = d;
        _rev = r;
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(22),
              gradient: const LinearGradient(colors: [Color(0xFF1C2731), Color(0xFF2C3E50)]),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Control center", style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                SizedBox(height: 6),
                Text("Live counts from your Transitely API.", style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _cnt("Riders", "${_dash["riders"] ?? "—"}", kPrimary),
              _cnt("Drivers", "${_dash["drivers"] ?? "—"}", kDriverGreen),
              _cnt("Rides", "${_dash["rides"] ?? "—"}", const Color(0xFFFF9500)),
              _cnt("Complaints", "${_dash["complaints"] ?? "—"}", kDanger),
            ],
          ),
          const SizedBox(height: 22),
          const Text("Revenue", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17)),
          const SizedBox(height: 10),
          _revRow("Total", "৳${_rev["total_revenue"] ?? 0}"),
          _revRow("Daily", "৳${_rev["daily"] ?? 0}"),
          _revRow("Weekly", "৳${_rev["weekly"] ?? 0}"),
          _revRow("Monthly", "৳${_rev["monthly"] ?? 0}"),
        ],
      ),
    );
  }

  Widget _cnt(String a, String b, Color c) {
    return Container(
      width: (MediaQuery.sizeOf(context).width - 42) / 2,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: kCardBorder)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.circle, color: c, size: 12),
          const SizedBox(height: 10),
          Text(b, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
          Text(a, style: const TextStyle(color: kMuted, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _revRow(String a, String b) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(a, style: const TextStyle(color: kMuted, fontWeight: FontWeight.w600)),
          Text(b, style: const TextStyle(fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

class _AdminRidersList extends StatefulWidget {
  const _AdminRidersList();

  @override
  State<_AdminRidersList> createState() => _AdminRidersListState();
}

class _AdminRidersListState extends State<_AdminRidersList> {
  List<dynamic> _list = [];
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
      final l = await AdminService.riders();
      if (!mounted) return;
      setState(() => _list = l);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        itemCount: _list.length,
        itemBuilder: (_, i) {
          final u = _list[i];
          final id = "${u["_id"]}";
          final active = u["isActive"] != false;
          return Card(
            child: SwitchListTile(
              title: Text("${u["name"]}", style: const TextStyle(fontWeight: FontWeight.w700)),
              subtitle: Text("${u["phone"] ?? ""} · ${u["email"] ?? ""}", style: const TextStyle(fontSize: 12)),
              value: active,
              onChanged: (v) async {
                try {
                  await AdminService.setRiderActive(id, v);
                  await _load();
                } catch (e) {
                  if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
                }
              },
            ),
          );
        },
      ),
    );
  }
}

class _AdminDriversList extends StatefulWidget {
  const _AdminDriversList();

  @override
  State<_AdminDriversList> createState() => _AdminDriversListState();
}

class _AdminDriversListState extends State<_AdminDriversList> {
  List<dynamic> _list = [];
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
      final l = await AdminService.drivers();
      if (!mounted) return;
      setState(() => _list = l);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        itemCount: _list.length,
        itemBuilder: (_, i) {
          final u = _list[i];
          final id = "${u["_id"]}";
          final active = u["isActive"] != false;
          return Card(
            child: SwitchListTile(
              title: Text("${u["name"]}", style: const TextStyle(fontWeight: FontWeight.w700)),
              subtitle: Text("Approved: ${u["approved"]} · ${u["phone"] ?? ""}", style: const TextStyle(fontSize: 12)),
              value: active,
              onChanged: (v) async {
                try {
                  await AdminService.setDriverActive(id, v);
                  await _load();
                } catch (e) {
                  if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
                }
              },
            ),
          );
        },
      ),
    );
  }
}

class _AdminRidesList extends StatefulWidget {
  const _AdminRidesList();

  @override
  State<_AdminRidesList> createState() => _AdminRidesListState();
}

class _AdminRidesListState extends State<_AdminRidesList> {
  List<dynamic> _list = [];
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
      final l = await AdminService.rides();
      if (!mounted) return;
      setState(() => _list = l.take(80).toList());
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        itemCount: _list.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final r = _list[i];
          return ListTile(
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            title: Text("${r["pickupAddress"] ?? ""} → ${r["dropoffAddress"] ?? ""}", style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
            subtitle: Text("${r["status"]} · ৳${r["fare"] ?? 0}"),
          );
        },
      ),
    );
  }
}
