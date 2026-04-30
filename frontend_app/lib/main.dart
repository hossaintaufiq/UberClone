import "package:flutter/material.dart";
import "package:shared_preferences/shared_preferences.dart";

import "services/auth_api.dart";

void main() {
  runApp(const TransitelyApp());
}

class TransitelyApp extends StatelessWidget {
  const TransitelyApp({super.key});

  @override
  Widget build(BuildContext context) {
    const seed = Color(0xFF007AFF);
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "Transitely Mobile",
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: seed),
        scaffoldBackgroundColor: const Color(0xFFEDF3F9),
        textTheme: Typography.blackMountainView.apply(fontFamily: "Inter"),
      ),
      home: const HomePortalScreen(),
    );
  }
}

class HomePortalScreen extends StatelessWidget {
  const HomePortalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 14, 18, 24),
          children: [
            _HeaderBar(
              title: "Transitely",
              action: FilledButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AdminDashboardScreen()),
                ),
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF007AFF),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text("Admin"),
              ),
            ),
            const SizedBox(height: 20),
            const _HeroSection(),
            const SizedBox(height: 16),
            _StatsRow(),
            const SizedBox(height: 18),
            _PortalTile(
              title: "Rider Portal",
              subtitle: "Book rides, track trips, and manage payments.",
              icon: Icons.person_rounded,
              primaryLabel: "Login",
              secondaryLabel: "Register",
              onPrimary: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const AuthScreen(
                    mode: AuthMode.riderLogin,
                  ),
                ),
              ),
              onSecondary: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const AuthScreen(
                    mode: AuthMode.riderRegister,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            _PortalTile(
              title: "Driver Portal",
              subtitle: "Go online, accept rides, and view earnings.",
              icon: Icons.directions_car_filled_rounded,
              primaryLabel: "Login",
              secondaryLabel: "Register",
              onPrimary: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const AuthScreen(
                    mode: AuthMode.driverLogin,
                  ),
                ),
              ),
              onSecondary: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const AuthScreen(
                    mode: AuthMode.driverRegister,
                  ),
                ),
              ),
            ),
          ],
        ),
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFD9E3EC)),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              gradient: const LinearGradient(colors: [Color(0xFF0062CC), Color(0xFF007AFF)]),
            ),
            alignment: Alignment.center,
            child: const Text("T", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
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
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFF007AFF), Color(0xFF0062CC)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Moving the Future",
            style: TextStyle(color: Colors.white, fontSize: 31, fontWeight: FontWeight.w900, height: 1.05),
          ),
          SizedBox(height: 8),
          Text(
            "One platform for riders, drivers, and admin operations.",
            style: TextStyle(color: Color(0xFFD8EAFF), fontSize: 14, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final items = const [
      ("84k+", "Trips"),
      ("12k+", "Drivers"),
      ("146", "Zones"),
    ];
    return Row(
      children: items
          .map(
            (it) => Expanded(
              child: Container(
                margin: EdgeInsets.only(right: it == items.last ? 0 : 10),
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFD9E3EC)),
                ),
                child: Column(
                  children: [
                    Text(it.$1, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 2),
                    Text(it.$2, style: const TextStyle(color: Color(0xFF8A9AAB), fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _PortalTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final String primaryLabel;
  final String secondaryLabel;
  final VoidCallback onPrimary;
  final VoidCallback onSecondary;

  const _PortalTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.primaryLabel,
    required this.secondaryLabel,
    required this.onPrimary,
    required this.onSecondary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFD9E3EC)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: const Color(0xFFE9F3FF),
                child: Icon(icon, color: const Color(0xFF007AFF)),
              ),
              const SizedBox(width: 10),
              Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 8),
          Text(subtitle, style: const TextStyle(color: Color(0xFF607282))),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: FilledButton(
                  onPressed: onPrimary,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF1C2731),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(primaryLabel),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: onSecondary,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFD0DCE7)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(secondaryLabel),
                ),
              ),
            ],
          ),
        ],
      ),
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
                border: Border.all(color: const Color(0xFFD9E3EC)),
              ),
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE9F3FF),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      _isRider ? "User Portal" : "Driver Portal",
                      style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF007AFF)),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(_title, style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 4),
                  Text(
                    _isLogin ? "Sign in to continue." : "Create your account with the same backend.",
                    style: const TextStyle(color: Color(0xFF607282)),
                  ),
                  const SizedBox(height: 16),
                  if (!_isLogin) ...[
                    _field(_name, "Full Name"),
                    const SizedBox(height: 10),
                    _field(_email, "Email"),
                    const SizedBox(height: 10),
                    _field(_phone, "Phone"),
                    const SizedBox(height: 10),
                  ] else ...[
                    _field(_identifier, "Email or Phone"),
                    const SizedBox(height: 10),
                  ],
                  _field(_password, "Password", obscure: true),
                  if (_message.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(_message, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w700)),
                  ],
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _busy ? null : _submit,
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF007AFF),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: Text(_busy ? "Please wait..." : (_isLogin ? "Sign In" : "Create Account")),
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

  Widget _field(TextEditingController c, String label, {bool obscure = false}) {
    return TextField(
      controller: c,
      obscureText: obscure,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFD9E3EC)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFD9E3EC)),
        ),
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
              title: "Admin Dashboard",
              action: TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("Home"),
              ),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF1C2731),
                borderRadius: BorderRadius.circular(26),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "System Control Center",
                    style: TextStyle(color: Colors.white, fontSize: 27, fontWeight: FontWeight.w900),
                  ),
                  SizedBox(height: 8),
                  Text(
                    "Monitor platform activity, payments, and operations.",
                    style: TextStyle(color: Color(0xFFA0B0C0)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            GridView.builder(
              itemCount: cards.length,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.1,
              ),
              itemBuilder: (_, i) {
                final c = cards[i];
                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFD9E3EC)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: c.$4.withOpacity(0.15),
                        child: Icon(c.$3, color: c.$4),
                      ),
                      Text(c.$2, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
                      Text(c.$1, style: const TextStyle(color: Color(0xFF607282), fontWeight: FontWeight.w700)),
                    ],
                  ),
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
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFD9E3EC)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check_circle_rounded, size: 56, color: Color(0xFF34C759)),
                  const SizedBox(height: 10),
                  Text(title, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  Text(subtitle, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF607282))),
                  const SizedBox(height: 18),
                  FilledButton(
                    onPressed: () => Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const HomePortalScreen()),
                      (_) => false,
                    ),
                    child: const Text("Back to Home"),
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
