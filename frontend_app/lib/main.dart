import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:shared_preferences/shared_preferences.dart";

import "services/auth_api.dart";

const _kPrimary = Color(0xFF007AFF);
const _kAccent = Color(0xFF0062CC);
const _kSurface = Color(0xFFEDF3F9);
const _kCard = Colors.white;
const _kCardBorder = Color(0xFFD9E3EC);
const _kSubtext = Color(0xFF607282);

void main() {
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(statusBarColor: Colors.transparent, statusBarIconBrightness: Brightness.dark),
  );
  runApp(const TransitelyApp());
}

class TransitelyApp extends StatelessWidget {
  const TransitelyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "Transitely Mobile",
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: _kPrimary),
        scaffoldBackgroundColor: _kSurface,
        fontFamily: "Inter",
      ),
      home: const HomePortalScreen(),
    );
  }
}

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
  void dispose() { _anim.dispose(); super.dispose(); }

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
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminDashboardScreen())),
              ),
            ),
            const SizedBox(height: 20),
            FadeTransition(opacity: CurvedAnimation(parent: _anim, curve: Curves.easeOut), child: const _HeroSection()),
            const SizedBox(height: 16),
            SlideTransition(
              position: Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(CurvedAnimation(parent: _anim, curve: const Interval(0.2, 1, curve: Curves.easeOut))),
              child: FadeTransition(opacity: CurvedAnimation(parent: _anim, curve: const Interval(0.2, 1)), child: _StatsRow()),
            ),
            const SizedBox(height: 18),
            SlideTransition(
              position: Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(CurvedAnimation(parent: _anim, curve: const Interval(0.35, 1, curve: Curves.easeOut))),
              child: FadeTransition(
                opacity: CurvedAnimation(parent: _anim, curve: const Interval(0.35, 1)),
                child: _PortalTile(
                  title: "Rider Portal", subtitle: "Book rides, track trips, and manage payments.",
                  icon: Icons.person_rounded, gradient: const [Color(0xFF007AFF), Color(0xFF0062CC)],
                  primaryLabel: "Login", secondaryLabel: "Register",
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
                  title: "Driver Portal", subtitle: "Go online, accept rides, and view earnings.",
                  icon: Icons.directions_car_filled_rounded, gradient: const [Color(0xFF34C759), Color(0xFF2AA84B)],
                  primaryLabel: "Login", secondaryLabel: "Register",
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
        boxShadow: [BoxShadow(color: _kPrimary.withOpacity(0.35), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: FilledButton(
        onPressed: onTap,
        style: FilledButton.styleFrom(
          backgroundColor: _kPrimary, foregroundColor: Colors.white,
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
        border: Border.all(color: _kCardBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              gradient: const LinearGradient(colors: [_kAccent, _kPrimary]),
              boxShadow: [BoxShadow(color: _kPrimary.withOpacity(0.25), blurRadius: 8)],
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
        gradient: const LinearGradient(colors: [_kPrimary, _kAccent], begin: Alignment.topLeft, end: Alignment.bottomRight),
        boxShadow: [BoxShadow(color: _kPrimary.withOpacity(0.25), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Moving the\nFuture", style: TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900, height: 1.05, letterSpacing: -0.5)),
          const SizedBox(height: 10),
          const Text("One platform for riders, drivers, and admin operations.", style: TextStyle(color: Color(0xFFD8EAFF), fontSize: 14, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const items = [("84k+", "Trips", Icons.route_rounded), ("12k+", "Drivers", Icons.people_alt_rounded), ("146", "Zones", Icons.location_on_rounded)];
    return Row(
      children: items.map((it) => Expanded(
        child: Container(
          margin: EdgeInsets.only(right: it == items.last ? 0 : 10),
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(18),
            border: Border.all(color: _kCardBorder),
          ),
          child: Column(children: [
            Icon(it.$3, color: _kPrimary, size: 20),
            const SizedBox(height: 6),
            Text(it.$1, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
            const SizedBox(height: 2),
            Text(it.$2, style: const TextStyle(color: _kSubtext, fontWeight: FontWeight.w600, fontSize: 12)),
          ]),
        ),
      )).toList(),
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
    required this.title, required this.subtitle, required this.icon, required this.gradient,
    required this.primaryLabel, required this.secondaryLabel, required this.onPrimary, required this.onSecondary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _kCardBorder),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: 42, height: 42,
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), gradient: LinearGradient(colors: gradient),
              boxShadow: [BoxShadow(color: gradient.first.withOpacity(0.35), blurRadius: 10)]),
            alignment: Alignment.center,
            child: Icon(icon, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
        ]),
        const SizedBox(height: 10),
        Text(subtitle, style: const TextStyle(color: _kSubtext, fontSize: 13)),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: Container(
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), gradient: LinearGradient(colors: gradient),
              boxShadow: [BoxShadow(color: gradient.first.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))]),
            child: FilledButton(onPressed: onPrimary, style: FilledButton.styleFrom(
              backgroundColor: Colors.transparent, shadowColor: Colors.transparent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ), child: Text(primaryLabel, style: const TextStyle(fontWeight: FontWeight.w700))),
          )),
          const SizedBox(width: 10),
          Expanded(child: OutlinedButton(onPressed: onSecondary, style: OutlinedButton.styleFrom(
            side: BorderSide(color: gradient.first.withOpacity(0.4)),
            foregroundColor: gradient.first,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            padding: const EdgeInsets.symmetric(vertical: 12),
          ), child: Text(secondaryLabel, style: const TextStyle(fontWeight: FontWeight.w700)))),
        ]),
      ]),
    );
  }
}

enum AuthMode { riderLogin, riderRegister, driverLogin, driverRegister }

class AuthScreen extends StatefulWidget {
  final AuthMode mode;

  const AuthScreen({super.key, required this.mode});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _identifier = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  String _message = "";

  bool get _isLogin => widget.mode == AuthMode.riderLogin || widget.mode == AuthMode.driverLogin;
  bool get _isRider => widget.mode == AuthMode.riderLogin || widget.mode == AuthMode.riderRegister;

  String get _title {
    switch (widget.mode) {
      case AuthMode.riderLogin:
        return "Rider Login";
      case AuthMode.riderRegister:
        return "Rider Register";
      case AuthMode.driverLogin:
        return "Driver Login";
      case AuthMode.driverRegister:
        return "Driver Register";
    }
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    _identifier.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _busy = true;
      _message = "";
    });
    try {
      if (_isLogin) {
        final id = _identifier.text.trim();
        final pass = _password.text.trim();
        if (id.isEmpty || pass.isEmpty) throw Exception("Enter identifier and password.");
        final token = _isRider
            ? await AuthApi.riderLogin(identifier: id, password: pass)
            : await AuthApi.driverLogin(identifier: id, password: pass);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_isRider ? "rider_token" : "driver_token", token);
        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => SessionScreen(
              title: _title,
              subtitle: "Login successful. Token stored locally.",
            ),
          ),
        );
      } else {
        final n = _name.text.trim();
        final e = _email.text.trim();
        final p = _phone.text.trim();
        final pass = _password.text.trim();
        if (n.isEmpty || e.isEmpty || p.isEmpty || pass.isEmpty) {
          throw Exception("Complete all required fields.");
        }
        if (_isRider) {
          await AuthApi.riderRegister(name: n, email: e, phone: p, password: pass);
        } else {
          await AuthApi.driverRegister(name: n, email: e, phone: p, password: pass);
        }
        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => SessionScreen(
              title: _title,
              subtitle: "Registration complete with backend API.",
            ),
          ),
        );
      }
    } catch (e) {
      setState(() => _message = e.toString().replaceFirst("Exception: ", ""));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
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
              action: TextButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back_rounded),
                label: const Text("Home"),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(26),
                border: Border.all(color: _kCardBorder),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: _isRider ? [const Color(0xFF007AFF), const Color(0xFF0062CC)] : [const Color(0xFF34C759), const Color(0xFF2AA84B)]),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      _isRider ? "Rider Portal" : "Driver Portal",
                      style: const TextStyle(fontWeight: FontWeight.w700, color: Colors.white, fontSize: 12),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(_title, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 4),
                  Text(
                    _isLogin ? "Sign in to continue." : "Create your account.",
                    style: const TextStyle(color: _kSubtext),
                  ),
                  const SizedBox(height: 18),
                  if (!_isLogin) ...[
                    _field(_name, "Full Name", Icons.person_outline_rounded),
                    const SizedBox(height: 12),
                    _field(_email, "Email", Icons.email_outlined),
                    const SizedBox(height: 12),
                    _field(_phone, "Phone", Icons.phone_outlined),
                    const SizedBox(height: 12),
                  ] else ...[
                    _field(_identifier, "Email or Phone", Icons.alternate_email_rounded),
                    const SizedBox(height: 12),
                  ],
                  _field(_password, "Password", Icons.lock_outline_rounded, obscure: true),
                  if (_message.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: const Color(0xFF3D1515), borderRadius: BorderRadius.circular(10)),
                      child: Row(children: [
                        const Icon(Icons.error_outline, color: Color(0xFFFF6B6B), size: 18),
                        const SizedBox(width: 8),
                        Expanded(child: Text(_message, style: const TextStyle(color: Color(0xFFFF6B6B), fontWeight: FontWeight.w600, fontSize: 13))),
                      ]),
                    ),
                  ],
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        gradient: LinearGradient(colors: _isRider ? [const Color(0xFF007AFF), const Color(0xFF0062CC)] : [const Color(0xFF34C759), const Color(0xFF2AA84B)]),
                        boxShadow: [BoxShadow(color: (_isRider ? const Color(0xFF007AFF) : const Color(0xFF34C759)).withOpacity(0.3), blurRadius: 14, offset: const Offset(0, 5))],
                      ),
                      child: FilledButton(
                        onPressed: _busy ? null : _submit,
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.transparent, shadowColor: Colors.transparent,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: _busy
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text(_isLogin ? "Sign In" : "Create Account", style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(TextEditingController c, String label, IconData icon, {bool obscure = false}) {
    return TextField(
      controller: c,
      obscureText: obscure,
      style: const TextStyle(color: Color(0xFF1C2731)),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: _kSubtext),
        prefixIcon: Icon(icon, color: _kSubtext, size: 20),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: _kCardBorder)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: _kCardBorder)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: _kPrimary, width: 1.5)),
      ),
    );
  }
}

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cards = const [
      ("Users", "14,280", Icons.people_alt_rounded, Color(0xFF007AFF)),
      ("Drivers", "3,920", Icons.directions_car_filled_rounded, Color(0xFF34C759)),
      ("Rides", "89,103", Icons.map_rounded, Color(0xFFFF9500)),
      ("Complaints", "142", Icons.report_gmailerrorred_rounded, Color(0xFFFF3B30)),
    ];

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 14, 18, 24),
          children: [
            _HeaderBar(
              title: "Admin",
              action: TextButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back_rounded),
                label: const Text("Home"),
              ),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(26),
                gradient: const LinearGradient(colors: [Color(0xFF1C2731), Color(0xFF2C3E50)]),
                border: Border.all(color: _kCardBorder),
              ),
              child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text("System Control Center", style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900, height: 1.1)),
                const SizedBox(height: 8),
                const Text("Monitor platform activity, payments, and operations.", style: TextStyle(color: _kSubtext, fontSize: 13)),
              ]),
            ),
            const SizedBox(height: 14),
            GridView.builder(
              itemCount: cards.length, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 1.05),
              itemBuilder: (_, i) {
                final c = cards[i];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white, borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _kCardBorder),
                  ),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: c.$4.withOpacity(0.12)),
                      alignment: Alignment.center,
                      child: Icon(c.$3, color: c.$4, size: 22),
                    ),
                    Text(c.$2, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
                    Text(c.$1, style: const TextStyle(color: _kSubtext, fontWeight: FontWeight.w600, fontSize: 13)),
                  ]),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class SessionScreen extends StatelessWidget {
  final String title;
  final String subtitle;

  const SessionScreen({super.key, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Container(
              width: 480,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: _kCardBorder),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 64, height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(colors: [Color(0xFF34C759), Color(0xFF2AA84B)]),
                      boxShadow: [BoxShadow(color: const Color(0xFF34C759).withOpacity(0.3), blurRadius: 16)],
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.check_rounded, size: 36, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  Text(subtitle, textAlign: TextAlign.center, style: const TextStyle(color: _kSubtext, fontSize: 14)),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        gradient: const LinearGradient(colors: [_kPrimary, _kAccent]),
                        boxShadow: [BoxShadow(color: _kPrimary.withOpacity(0.25), blurRadius: 12, offset: const Offset(0, 4))],
                      ),
                      child: FilledButton(
                        onPressed: () => Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const HomePortalScreen()), (_) => false),
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.transparent, shadowColor: Colors.transparent,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: const Text("Back to Home", style: TextStyle(fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
