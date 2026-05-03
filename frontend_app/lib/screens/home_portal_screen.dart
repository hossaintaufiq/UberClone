import "package:flutter/material.dart";

import "../core/app_theme.dart";
import "admin/admin_login_screen.dart";
import "auth_screen.dart";

class HomePortalScreen extends StatefulWidget {
  const HomePortalScreen({super.key});

  @override
  State<HomePortalScreen> createState() => _HomePortalScreenState();
}

class _HomePortalScreenState extends State<HomePortalScreen> with SingleTickerProviderStateMixin {
  late AnimationController _anim;

  @override
  void initState() {
    super.initState();
    _anim = AnimationController(vsync: this, duration: const Duration(milliseconds: 800))..forward();
  }

  @override
  void dispose() {
    _anim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 14, 18, 24),
          children: [
            _HeaderBar(
              title: "Transitely",
              action: _GlowButton(
                label: "Admin",
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminLoginScreen())),
              ),
            ),
            const SizedBox(height: 20),
            FadeTransition(opacity: CurvedAnimation(parent: _anim, curve: Curves.easeOut), child: const _HeroSection()),
            const SizedBox(height: 16),
            SlideTransition(
              position: Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(CurvedAnimation(parent: _anim, curve: const Interval(0.2, 1, curve: Curves.easeOut))),
              child: FadeTransition(opacity: CurvedAnimation(parent: _anim, curve: const Interval(0.2, 1)), child: const _StatsRow()),
            ),
            const SizedBox(height: 18),
            SlideTransition(
              position: Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(CurvedAnimation(parent: _anim, curve: const Interval(0.35, 1, curve: Curves.easeOut))),
              child: FadeTransition(
                opacity: CurvedAnimation(parent: _anim, curve: const Interval(0.35, 1)),
                child: _PortalTile(
                  title: "Rider Portal",
                  subtitle: "Book rides with maps, seat-share fares, trip tracking & wallet.",
                  icon: Icons.person_rounded,
                  gradient: const [kPrimary, kPrimaryDark],
                  primaryLabel: "Login",
                  secondaryLabel: "Register",
                  onPrimary: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AuthScreen(mode: AuthMode.riderLogin))),
                  onSecondary: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AuthScreen(mode: AuthMode.riderRegister))),
                ),
              ),
            ),
            const SizedBox(height: 12),
            SlideTransition(
              position: Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(CurvedAnimation(parent: _anim, curve: const Interval(0.5, 1, curve: Curves.easeOut))),
              child: FadeTransition(
                opacity: CurvedAnimation(parent: _anim, curve: const Interval(0.5, 1)),
                child: _PortalTile(
                  title: "Driver Portal",
                  subtitle: "Go online, accept requests, trips, earnings & alerts.",
                  icon: Icons.directions_car_filled_rounded,
                  gradient: const [kDriverGreen, Color(0xFF2AA84B)],
                  primaryLabel: "Login",
                  secondaryLabel: "Register",
                  onPrimary: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AuthScreen(mode: AuthMode.driverLogin))),
                  onSecondary: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AuthScreen(mode: AuthMode.driverRegister))),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GlowButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _GlowButton({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: kPrimary.withOpacity(0.35), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: FilledButton(
        onPressed: onTap,
        style: FilledButton.styleFrom(
          backgroundColor: kPrimary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        ),
        child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}

class _HeaderBar extends StatelessWidget {
  final String title;
  final Widget action;

  const _HeaderBar({required this.title, required this.action});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: kCardBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              gradient: const LinearGradient(colors: [kPrimaryDark, kPrimary]),
              boxShadow: [BoxShadow(color: kPrimary.withOpacity(0.25), blurRadius: 8)],
            ),
            alignment: Alignment.center,
            child: const Text("T", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
          ),
          const SizedBox(width: 10),
          Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          const Spacer(),
          action,
        ],
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(colors: [kPrimary, kPrimaryDark], begin: Alignment.topLeft, end: Alignment.bottomRight),
        boxShadow: [BoxShadow(color: kPrimary.withOpacity(0.25), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Moving the\nFuture", style: TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900, height: 1.05, letterSpacing: -0.5)),
          SizedBox(height: 10),
          Text("Riders, drivers & admins — same Transitely design language on mobile.", style: TextStyle(color: Color(0xFFD8EAFF), fontSize: 14, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow();

  @override
  Widget build(BuildContext context) {
    const items = [("Live", "Trips", Icons.route_rounded), ("Fleet", "Drivers", Icons.people_alt_rounded), ("Zones", "Map", Icons.location_on_rounded)];
    return Row(
      children: items
          .map((it) => Expanded(
                child: Container(
                  margin: EdgeInsets.only(right: it == items.last ? 0 : 10),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: kCardBorder),
                  ),
                  child: Column(children: [
                    Icon(it.$3, color: kPrimary, size: 20),
                    const SizedBox(height: 6),
                    Text(it.$1, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 2),
                    Text(it.$2, style: const TextStyle(color: kMuted, fontWeight: FontWeight.w600, fontSize: 12)),
                  ]),
                ),
              ))
          .toList(),
    );
  }
}

class _PortalTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final List<Color> gradient;
  final String primaryLabel;
  final String secondaryLabel;
  final VoidCallback onPrimary;
  final VoidCallback onSecondary;

  const _PortalTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.gradient,
    required this.primaryLabel,
    required this.secondaryLabel,
    required this.onPrimary,
    required this.onSecondary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: kCardBorder)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              gradient: LinearGradient(colors: gradient),
              boxShadow: [BoxShadow(color: gradient.first.withOpacity(0.35), blurRadius: 10)],
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
        ]),
        const SizedBox(height: 10),
        Text(subtitle, style: const TextStyle(color: kMuted, fontSize: 13)),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                gradient: LinearGradient(colors: gradient),
                boxShadow: [BoxShadow(color: gradient.first.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))],
              ),
              child: FilledButton(
                onPressed: onPrimary,
                style: FilledButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: Text(primaryLabel, style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: OutlinedButton(
              onPressed: onSecondary,
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: gradient.first.withOpacity(0.4)),
                foregroundColor: gradient.first,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: Text(secondaryLabel, style: const TextStyle(fontWeight: FontWeight.w700)),
            ),
          ),
        ]),
      ]),
    );
  }
}
