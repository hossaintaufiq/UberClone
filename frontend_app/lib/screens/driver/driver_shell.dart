import "package:flutter/material.dart";
import "package:shared_preferences/shared_preferences.dart";

import "../../core/app_theme.dart";
import "../../core/auth_prefs.dart";
import "../../services/driver_service.dart";
import "../../widgets/nav_assistant_sheet.dart";
import "../home_portal_screen.dart";

bool _tripLive(dynamic r) {
  final s = "${r["status"] ?? ""}".toLowerCase();
  return ["accepted", "arrived", "started", "ongoing"].contains(s);
}

class DriverShell extends StatefulWidget {
  const DriverShell({super.key});

  @override
  State<DriverShell> createState() => _DriverShellState();
}

class _DriverShellState extends State<DriverShell> {
  int _ix = 0;

  Future<void> _logout() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(AuthPrefs.driverToken);
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const HomePortalScreen()), (_) => false);
  }

  void _assistant() {
    NavAssistantSheet.show(
      context,
      title: "Driver Assistant",
      accentLabel: "Navigate · Tips",
      accent: kDriverGreen,
      quickLinks: const [
        (id: "0", label: "Dashboard"),
        (id: "1", label: "Incoming"),
        (id: "2", label: "Trip"),
        (id: "3", label: "History"),
        (id: "4", label: "More"),
      ],
      helpText:
          "**Screens**\n• Dashboard — go online / offline, earnings snapshot.\n• Incoming — open ride requests.\n• Current Trip — active job.\n• History — completed rides.\n• More — alerts, profile, sign out.\n\nSay **open incoming** or tap chips.",
      onJump: (id) {
        final i = int.tryParse(id);
        if (i != null && i >= 0 && i <= 4) setState(() => _ix = i);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final bodies = [
      _DriverDash(onGoTab: (i) => setState(() => _ix = i)),
      _DriverIncoming(onGoTab: (i) => setState(() => _ix = i)),
      _DriverTrip(onGoTab: (i) => setState(() => _ix = i)),
      const _DriverHistory(),
      _DriverMore(onLogout: _logout),
    ];

    return Scaffold(
      body: bodies[_ix],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _assistant,
        backgroundColor: kDriverGreen,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.auto_awesome_rounded),
        label: const Text("Assistant"),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _ix,
        onDestinationSelected: (i) => setState(() => _ix = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard_rounded), label: "Dash"),
          NavigationDestination(icon: Icon(Icons.inbox_outlined), selectedIcon: Icon(Icons.inbox_rounded), label: "Incoming"),
          NavigationDestination(icon: Icon(Icons.navigation_outlined), selectedIcon: Icon(Icons.navigation_rounded), label: "Trip"),
          NavigationDestination(icon: Icon(Icons.history_rounded), selectedIcon: Icon(Icons.history_rounded), label: "History"),
          NavigationDestination(icon: Icon(Icons.menu_rounded), selectedIcon: Icon(Icons.menu_open_rounded), label: "More"),
        ],
      ),
    );
  }
}

class _DriverDash extends StatefulWidget {
  final void Function(int tab) onGoTab;

  const _DriverDash({required this.onGoTab});

  @override
  State<_DriverDash> createState() => _DriverDashState();
}

class _DriverDashState extends State<_DriverDash> {
  Map<String, dynamic> _profile = {};
  Map<String, dynamic> _earn = {};
  bool _online = false;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final p = await DriverService.profile();
      final e = await DriverService.earnings();
      if (!mounted) return;
      final data = (p["data"] as Map?)?.cast<String, dynamic>() ?? {};
      setState(() {
        _profile = data;
        _earn = e;
        _online = data["isOnline"] == true;
      });
    } catch (_) {
      if (mounted) setState(() {});
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggle() async {
    try {
      final on = await DriverService.toggleOnline();
      if (!mounted) return;
      setState(() => _online = on);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
        children: [
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          Text("Hey, ${_profile["name"] ?? "Captain"}", style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: FilledButton(
                  onPressed: _toggle,
                  style: FilledButton.styleFrom(
                    backgroundColor: _online ? kDanger : kDriverGreen,
                    minimumSize: const Size.fromHeight(48),
                  ),
                  child: Text(_online ? "Go Offline" : "Go Online"),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(child: _miniStat("Completed", "${_earn["completed_rides"] ?? 0}", Icons.check_circle_outline_rounded)),
              const SizedBox(width: 10),
              Expanded(child: _miniStat("Total ৳", "${_earn["total_earnings"] ?? 0}", Icons.payments_outlined)),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _miniStat("Today ৳", "${_earn["daily_earnings"] ?? 0}", Icons.today_outlined)),
              const SizedBox(width: 10),
              Expanded(child: _miniStat("Week ৳", "${_earn["weekly_earnings"] ?? 0}", Icons.date_range_rounded)),
            ],
          ),
          const SizedBox(height: 22),
          ListTile(
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            leading: const Icon(Icons.inbox_rounded, color: kDriverGreen),
            title: const Text("Incoming requests", style: TextStyle(fontWeight: FontWeight.w800)),
            trailing: const Icon(Icons.chevron_right_rounded),
            onTap: () => widget.onGoTab(1),
          ),
        ],
      ),
    );
  }

  Widget _miniStat(String a, String b, IconData i) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: kCardBorder)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(i, color: kDriverGreen, size: 20),
          const SizedBox(height: 8),
          Text(b, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          Text(a, style: const TextStyle(color: kMuted, fontSize: 12)),
        ],
      ),
    );
  }
}

class _DriverIncoming extends StatefulWidget {
  final void Function(int tab) onGoTab;

  const _DriverIncoming({required this.onGoTab});

  @override
  State<_DriverIncoming> createState() => _DriverIncomingState();
}

class _DriverIncomingState extends State<_DriverIncoming> {
  List<dynamic> _req = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final list = await DriverService.rideRequests();
      if (!mounted) return;
      setState(() => _req = list);
    } catch (_) {}
  }

  Future<void> _accept(String id) async {
    try {
      await DriverService.acceptRide(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Ride accepted")));
      await _load();
      widget.onGoTab(2);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
    }
  }

  Future<void> _reject(String id) async {
    try {
      await DriverService.rejectRide(id);
      if (!mounted) return;
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
        children: [
          const Text("Nearby requests", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 12),
          if (_req.isEmpty)
            const Padding(padding: EdgeInsets.all(24), child: Center(child: Text("No open requests.", style: TextStyle(color: kMuted))))
          else
            ..._req.map((r) {
              final id = "${r["_id"] ?? r["id"]}";
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("${r["pickupAddress"] ?? ""} → ${r["dropoffAddress"] ?? ""}", style: const TextStyle(fontWeight: FontWeight.w700)),
                      Text("Fare ৳${r["fare"] ?? 0}", style: const TextStyle(color: kMuted)),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: FilledButton(onPressed: () => _accept(id), style: FilledButton.styleFrom(backgroundColor: kDriverGreen), child: const Text("Accept")),
                          ),
                          const SizedBox(width: 8),
                          Expanded(child: OutlinedButton(onPressed: () => _reject(id), child: const Text("Decline"))),
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

class _DriverTrip extends StatefulWidget {
  final void Function(int tab) onGoTab;

  const _DriverTrip({required this.onGoTab});

  @override
  State<_DriverTrip> createState() => _DriverTripState();
}

class _DriverTripState extends State<_DriverTrip> {
  List<dynamic> _rides = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final rides = await DriverService.rides();
      if (!mounted) return;
      setState(() => _rides = rides);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final live = _rides.where(_tripLive).toList();
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
        children: [
          const Text("Current trip", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 12),
          if (live.isEmpty)
            Column(
              children: [
                const Text("No active trip.", style: TextStyle(color: kMuted)),
                TextButton(onPressed: () => widget.onGoTab(1), child: const Text("Check incoming")),
              ],
            )
          else
            ...live.map((r) => Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("${r["status"]}".toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w800, color: kDriverGreen, fontSize: 11)),
                        const SizedBox(height: 8),
                        Text("${r["pickupAddress"] ?? ""} → ${r["dropoffAddress"] ?? ""}", style: const TextStyle(fontWeight: FontWeight.w700)),
                        Text("Fare ৳${r["fare"] ?? 0}", style: const TextStyle(color: kMuted)),
                      ],
                    ),
                  ),
                )),
        ],
      ),
    );
  }
}

class _DriverHistory extends StatefulWidget {
  const _DriverHistory();

  @override
  State<_DriverHistory> createState() => _DriverHistoryState();
}

class _DriverHistoryState extends State<_DriverHistory> {
  List<dynamic> _rides = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final rides = await DriverService.rides();
      if (!mounted) return;
      setState(() => _rides = rides.where((r) => "${r["status"]}".toLowerCase() == "completed").toList());
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
        itemCount: _rides.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final r = _rides[i];
          return ListTile(
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            title: Text("${r["pickupAddress"] ?? ""}", style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
            subtitle: Text("৳${r["fare"] ?? 0} · ${r["driverEarning"] ?? ""}"),
          );
        },
      ),
    );
  }
}

class _DriverMore extends StatefulWidget {
  final VoidCallback onLogout;

  const _DriverMore({required this.onLogout});

  @override
  State<_DriverMore> createState() => _DriverMoreState();
}

class _DriverMoreState extends State<_DriverMore> {
  Map<String, dynamic> _profile = {};
  List<dynamic> _notes = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final p = await DriverService.profile();
      final n = await DriverService.notifications();
      if (!mounted) return;
      setState(() {
        _profile = (p["data"] as Map?)?.cast<String, dynamic>() ?? {};
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
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
        children: [
          const Text("Profile", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_profile["name"]?.toString() ?? "—", style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
                  Text(_profile["phone"]?.toString() ?? "", style: const TextStyle(color: kMuted)),
                  Text("Approved: ${_profile["approved"]}", style: const TextStyle(color: kMuted, fontSize: 12)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),
          const Text("Alerts", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          if (_notes.isEmpty)
            const Text("No notifications", style: TextStyle(color: kMuted))
          else
            ..._notes.take(12).map((n) => ListTile(
                  leading: const Icon(Icons.notifications_none_rounded, color: kDriverGreen),
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
