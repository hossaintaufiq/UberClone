import "package:flutter/material.dart";
import "package:shared_preferences/shared_preferences.dart";

import "../../core/app_theme.dart";
import "../../core/auth_prefs.dart";
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
  int _ix = 0;

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
        (id: "2", label: "Active"),
        (id: "3", label: "History"),
        (id: "4", label: "More"),
      ],
      helpText:
          "**Tabs**\n• Home — stats & active ride card.\n• Book — map (OpenStreetMap), full car / seat share.\n• Active — cancel if needed.\n• History — completed trips.\n• More — profile, payments, alerts, logout.\n\nSay **open book** or tap chips.",
      onJump: (id) {
        final i = int.tryParse(id);
        if (i != null && i >= 0 && i <= 4) setState(() => _ix = i);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final bodies = [
      RiderHomeTab(onGoTab: (i) => setState(() => _ix = i)),
      const RiderBookTab(),
      RiderActiveTab(onGoTab: (i) => setState(() => _ix = i)),
      const RiderHistoryTab(),
      RiderMoreTab(onLogout: _logout),
    ];

    return Scaffold(
      body: bodies[_ix],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _assistant,
        backgroundColor: kPrimary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.auto_awesome_rounded),
        label: const Text("Assistant"),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _ix,
        onDestinationSelected: (i) => setState(() => _ix = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home_rounded), label: "Home"),
          NavigationDestination(icon: Icon(Icons.map_outlined), selectedIcon: Icon(Icons.map_rounded), label: "Book"),
          NavigationDestination(icon: Icon(Icons.navigation_outlined), selectedIcon: Icon(Icons.navigation_rounded), label: "Active"),
          NavigationDestination(icon: Icon(Icons.history_rounded), selectedIcon: Icon(Icons.history_rounded), label: "History"),
          NavigationDestination(icon: Icon(Icons.menu_rounded), selectedIcon: Icon(Icons.menu_open_rounded), label: "More"),
        ],
      ),
    );
  }
}
