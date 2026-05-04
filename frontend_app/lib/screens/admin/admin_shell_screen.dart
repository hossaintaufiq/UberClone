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
        (id: "4", label: "Finance"),
        (id: "5", label: "Promos"),
        (id: "6", label: "Analytics"),
      ],
      helpText:
          "**Overview** — counts & revenue.\n**Riders / Drivers** — toggle active status.\n**Rides** — recent trips.\n**Finance** — commission & config.\n**Promos** — create/toggle promo codes.\n**Analytics** — live business snapshot.\n\nTry **open finance**.",
      onJump: (id) {
        final i = int.tryParse(id);
        if (i != null && i >= 0 && i <= 6) setState(() => _ix = i);
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
      const _AdminFinance(),
      const _AdminPromos(),
      const _AdminAnalytics(),
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
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), selectedIcon: Icon(Icons.account_balance_wallet_rounded), label: "Finance"),
          NavigationDestination(icon: Icon(Icons.local_offer_outlined), selectedIcon: Icon(Icons.local_offer_rounded), label: "Promos"),
          NavigationDestination(icon: Icon(Icons.insights_outlined), selectedIcon: Icon(Icons.insights_rounded), label: "Analytics"),
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

class _AdminFinance extends StatefulWidget {
  const _AdminFinance();

  @override
  State<_AdminFinance> createState() => _AdminFinanceState();
}

class _AdminFinanceState extends State<_AdminFinance> {
  Map<String, dynamic> _rev = {};
  final TextEditingController _perKm = TextEditingController(text: "40");
  final TextEditingController _commission = TextEditingController(text: "5");
  bool _busy = false;
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
    _perKm.dispose();
    _commission.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final rev = await AdminService.revenue();
      final cfg = await AdminService.config();
      if (!mounted) return;
      setState(() {
        _rev = rev;
        _perKm.text = "${(cfg["perKmFare"] ?? 40)}";
        _commission.text = "${((num.tryParse("${cfg["commissionRate"] ?? 0.05}") ?? 0.05) * 100).toStringAsFixed(0)}";
      });
    } catch (_) {}
  }

  Future<void> _save() async {
    final perKm = num.tryParse(_perKm.text.trim());
    final c = num.tryParse(_commission.text.trim());
    if (perKm == null || c == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Enter valid config values.")));
      return;
    }
    try {
      setState(() => _busy = true);
      await AdminService.updateConfig(perKmFare: perKm, commissionRate: c / 100);
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Pricing config updated.")));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final gross = num.tryParse("${_rev["total_revenue"] ?? 0}") ?? 0;
    final payments = _rev["total_payments"] ?? 0;
    final cPct = num.tryParse(_commission.text) ?? 5;
    final commission = (gross * cPct / 100).round();
    final net = gross - commission;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          const Text("Financial Operations", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20)),
          const SizedBox(height: 12),
          _metricTile("Gross Revenue", "৳${gross.toStringAsFixed(0)}", Icons.payments_rounded, kPrimary),
          _metricTile("Commission", "৳$commission", Icons.account_balance_rounded, const Color(0xFF0EA5E9)),
          _metricTile("Driver Payouts", "৳${net.toStringAsFixed(0)}", Icons.wallet_rounded, kDriverGreen),
          const SizedBox(height: 8),
          Text("Processed payments: $payments", style: const TextStyle(color: kMuted, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Pricing Config", style: TextStyle(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _perKm,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: "Per KM Fare", border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _commission,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: "Commission %", border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _busy ? null : _save,
                      child: Text(_busy ? "Saving..." : "Save Configuration"),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _metricTile(String title, String value, IconData icon, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: color.withOpacity(0.12), child: Icon(icon, color: color)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text(value, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
      ),
    );
  }
}

class _AdminPromos extends StatefulWidget {
  const _AdminPromos();

  @override
  State<_AdminPromos> createState() => _AdminPromosState();
}

class _AdminPromosState extends State<_AdminPromos> {
  List<dynamic> _promos = [];
  final TextEditingController _code = TextEditingController();
  final TextEditingController _discount = TextEditingController();
  bool _busy = false;
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
    _code.dispose();
    _discount.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final cfg = await AdminService.config();
      if (!mounted) return;
      setState(() => _promos = (cfg["promoCodes"] is List) ? List<dynamic>.from(cfg["promoCodes"]) : []);
    } catch (_) {}
  }

  Future<void> _create() async {
    final code = _code.text.trim().toUpperCase();
    final discount = num.tryParse(_discount.text.trim());
    if (code.isEmpty || discount == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Enter code and discount.")));
      return;
    }
    try {
      setState(() => _busy = true);
      await AdminService.createPromoCode(code: code, discountPercent: discount);
      _code.clear();
      _discount.clear();
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Promo created.")));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _toggle(String code) async {
    try {
      await AdminService.togglePromoCode(code);
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
        padding: const EdgeInsets.all(16),
        children: [
          const Text("Promo Codes", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20)),
          const SizedBox(height: 10),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                children: [
                  TextField(controller: _code, decoration: const InputDecoration(labelText: "Promo code", border: OutlineInputBorder())),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _discount,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: "Discount %", border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(width: double.infinity, child: FilledButton(onPressed: _busy ? null : _create, child: Text(_busy ? "Creating..." : "Create Promo"))),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          ..._promos.map((p) {
            final code = "${p["code"] ?? ""}";
            final active = p["active"] == true;
            return Card(
              child: SwitchListTile(
                title: Text(code, style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text("${p["discountPercent"] ?? 0}% · ${active ? "active" : "inactive"}"),
                value: active,
                onChanged: (_) => _toggle(code),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _AdminAnalytics extends StatefulWidget {
  const _AdminAnalytics();

  @override
  State<_AdminAnalytics> createState() => _AdminAnalyticsState();
}

class _AdminAnalyticsState extends State<_AdminAnalytics> {
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
    final rides = num.tryParse("${_dash["rides"] ?? 0}") ?? 0;
    final complaints = num.tryParse("${_dash["complaints"] ?? 0}") ?? 0;
    final cancellationRate = rides <= 0 ? 0 : (complaints / rides) * 100;
    final avgDailyRevenue = (num.tryParse("${_rev["monthly"] ?? 0}") ?? 0) / 30;
    final avgDailyRides = rides / 30;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          const Text("Analytics", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20)),
          const SizedBox(height: 10),
          _kpi("Avg Daily Revenue", "৳${avgDailyRevenue.toStringAsFixed(0)}", Icons.trending_up_rounded, kPrimary),
          _kpi("Avg Daily Rides", avgDailyRides.toStringAsFixed(1), Icons.local_taxi_rounded, kDriverGreen),
          _kpi("Cancellation Rate", "${cancellationRate.toStringAsFixed(2)}%", Icons.warning_amber_rounded, const Color(0xFFF59E0B)),
          _kpi("Monthly Revenue", "৳${_rev["monthly"] ?? 0}", Icons.bar_chart_rounded, const Color(0xFF6366F1)),
        ],
      ),
    );
  }

  Widget _kpi(String label, String value, IconData icon, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: color.withOpacity(0.12), child: Icon(icon, color: color)),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text(value, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
      ),
    );
  }
}
