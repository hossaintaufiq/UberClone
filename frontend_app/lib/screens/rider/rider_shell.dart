import "dart:async";

import "package:flutter/material.dart";
import "package:shared_preferences/shared_preferences.dart";

import "../../core/app_theme.dart";
import "../../core/auth_prefs.dart";
import "../../services/rider_service.dart";
import "../../widgets/nav_assistant_sheet.dart";
import "../home_portal_screen.dart";
import "rider_book_tab.dart";
import "rider_rest_tabs.dart";

class RiderShell extends StatefulWidget {
  const RiderShell({super.key});

  @override
  State<RiderShell> createState() => _RiderShellState();
}

class _RiderShellState extends State<RiderShell> {
  String _selected = "home";
  bool _hasIncoming = false;
  Timer? _incomingPoll;

  @override
  void initState() {
    super.initState();
    _syncIncoming();
    _incomingPoll = Timer.periodic(const Duration(seconds: 8), (_) => _syncIncoming());
  }

  @override
  void dispose() {
    _incomingPoll?.cancel();
    super.dispose();
  }

  Future<void> _syncIncoming() async {
    try {
      final rides = await RiderService.rides();
      if (!mounted) return;
      final has = rides.any((r) {
        final s = "${r["status"] ?? ""}".toLowerCase();
        return ["requested", "accepted", "arrived", "started", "ongoing"].contains(s);
      });
      setState(() {
        _hasIncoming = has;
        if (!_hasIncoming && _selected == "incoming") {
          _selected = "active";
        }
      });
    } catch (_) {}
  }

  Future<void> _logout() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(AuthPrefs.riderToken);
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const HomePortalScreen()), (_) => false);
  }

  void _assistant() {
    NavAssistantSheet.show(
      context,
      title: "Rider Assistant",
      accentLabel: "Navigate · Help",
      accent: kPrimary,
      quickLinks: const [
        (id: "0", label: "Home"),
        (id: "1", label: "Book Ride"),
        (id: "2", label: "Incoming / Active"),
        (id: "3", label: "History"),
        (id: "4", label: "More"),
      ],
      helpText:
          "**Tabs**\n• Home — stats & active ride card.\n• Book — trip category, search pickup/dropoff, full car / seat share.\n• Active — cancel if needed.\n• History — completed trips.\n• More — profile, payments, alerts, logout.\n\nSay **open book** or tap chips.",
      onJump: (id) {
        final i = int.tryParse(id);
        if (i == null) return;
        setState(() {
          if (i == 0) _selected = "home";
          if (i == 1) _selected = "book";
          if (i == 2) _selected = _hasIncoming ? "incoming" : "active";
          if (i == 3) _selected = "history";
          if (i == 4) _selected = "more";
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final tabs = <({String key, Widget body, NavigationDestination nav})>[
      (
        key: "home",
        body: RiderHomeTab(onGoTab: (i) {
          setState(() {
            if (i == 1) _selected = "book";
            if (i == 2) _selected = _hasIncoming ? "incoming" : "active";
            if (i == 3) _selected = "history";
            if (i == 4) _selected = "more";
          });
        }),
        nav: const NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home_rounded), label: "Home"),
      ),
      (
        key: "book",
        body: const RiderBookTab(),
        nav: const NavigationDestination(icon: Icon(Icons.map_outlined), selectedIcon: Icon(Icons.map_rounded), label: "Book"),
      ),
      if (_hasIncoming)
        (
          key: "incoming",
          body: RiderIncomingTab(
            onIncomingChanged: (has) {
              if (!mounted) return;
              setState(() {
                _hasIncoming = has;
                if (!has && _selected == "incoming") _selected = "active";
              });
            },
            onGoActive: () => setState(() => _selected = "active"),
          ),
          nav: const NavigationDestination(icon: Icon(Icons.inbox_outlined), selectedIcon: Icon(Icons.inbox_rounded), label: "Incoming"),
        ),
      (
        key: "active",
        body: RiderActiveTab(onGoTab: (i) {
          setState(() {
            if (i == 1) _selected = "book";
            if (i == 3) _selected = "history";
            if (i == 4) _selected = "more";
          });
        }),
        nav: const NavigationDestination(icon: Icon(Icons.navigation_outlined), selectedIcon: Icon(Icons.navigation_rounded), label: "Active"),
      ),
      (
        key: "history",
        body: RiderHistoryTab(onGoBook: () => setState(() => _selected = "book")),
        nav: const NavigationDestination(icon: Icon(Icons.history_rounded), selectedIcon: Icon(Icons.history_rounded), label: "History"),
      ),
      (
        key: "more",
        body: RiderMoreTab(onLogout: _logout),
        nav: const NavigationDestination(icon: Icon(Icons.menu_rounded), selectedIcon: Icon(Icons.menu_open_rounded), label: "More"),
      ),
    ];
    final selectedIndex = tabs.indexWhere((t) => t.key == _selected);
    final safeIndex = selectedIndex < 0 ? 0 : selectedIndex;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.fromLTRB(12, 10, 12, 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(22),
                gradient: const LinearGradient(
                  colors: [kPrimary, kPrimaryDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: const [BoxShadow(color: Color(0x220062CC), blurRadius: 14, offset: Offset(0, 6))],
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: Colors.white.withValues(alpha: 0.18),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.two_wheeler_rounded, color: Colors.white),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Transitely Rider",
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white),
                        ),
                        Text(
                          "Book • Track • Pay",
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontSize: 11, color: Color(0xFFDCEBFF), fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                  Flexible(
                    child: Align(
                      alignment: Alignment.centerRight,
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: (_hasIncoming ? const Color(0xFFFFF7ED) : Colors.white.withValues(alpha: 0.2)),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            _hasIncoming ? "Incoming live" : "No incoming",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: _hasIncoming ? const Color(0xFFD97706) : Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 220),
                child: KeyedSubtree(key: ValueKey(tabs[safeIndex].key), child: tabs[safeIndex].body),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _assistant,
        backgroundColor: kPrimary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.auto_awesome_rounded),
        label: const Text("Assistant"),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      bottomNavigationBar: NavigationBar(
        selectedIndex: safeIndex,
        onDestinationSelected: (i) => setState(() => _selected = tabs[i].key),
        destinations: tabs.map((t) => t.nav).toList(),
      ),
    );
  }
}
