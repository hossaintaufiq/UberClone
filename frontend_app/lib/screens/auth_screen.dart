import "package:flutter/material.dart";

import "../core/app_theme.dart";
import "../services/auth_api.dart";
import "driver/driver_shell.dart";
import "rider/rider_shell.dart";

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
        if (_isRider) {
          await AuthApi.riderLogin(identifier: id, password: pass);
          if (!mounted) return;
          Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const RiderShell()), (_) => false);
        } else {
          await AuthApi.driverLogin(identifier: id, password: pass);
          if (!mounted) return;
          Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const DriverShell()), (_) => false);
        }
      } else {
        final n = _name.text.trim();
        final e = _email.text.trim();
        final p = _phone.text.trim();
        final pass = _password.text.trim();
        if (n.isEmpty || e.isEmpty || p.isEmpty || pass.isEmpty) throw Exception("Complete all required fields.");
        if (_isRider) {
          await AuthApi.riderRegister(name: n, email: e, phone: p, password: pass);
        } else {
          await AuthApi.driverRegister(name: n, email: e, phone: p, password: pass);
        }
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Account created — please sign in.")));
        Navigator.pop(context);
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
            _MiniHeader(
              onBack: () => Navigator.pop(context),
            ),
            const SizedBox(height: 16),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(26),
                border: Border.all(color: kCardBorder),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: _isRider ? [kPrimary, kPrimaryDark] : [kDriverGreen, const Color(0xFF2AA84B)],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
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
                  Text(_isLogin ? "Sign in to continue." : "Create your account.", style: const TextStyle(color: kMuted)),
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
                      decoration: BoxDecoration(color: const Color(0xFFFFF5F5), borderRadius: BorderRadius.circular(10)),
                      child: Row(children: [
                        const Icon(Icons.error_outline, color: kDanger, size: 18),
                        const SizedBox(width: 8),
                        Expanded(child: Text(_message, style: const TextStyle(color: kDanger, fontWeight: FontWeight.w600, fontSize: 13))),
                      ]),
                    ),
                  ],
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _busy ? null : _submit,
                      style: FilledButton.styleFrom(
                        backgroundColor: _isRider ? kPrimary : kDriverGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: _busy
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text(_isLogin ? "Sign In" : "Create Account", style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
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
      style: const TextStyle(color: kText),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: kMuted),
        prefixIcon: Icon(icon, color: kMuted, size: 20),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kCardBorder)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kCardBorder)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kPrimary, width: 1.5)),
      ),
    );
  }
}

class _MiniHeader extends StatelessWidget {
  final VoidCallback onBack;

  const _MiniHeader({required this.onBack});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: const LinearGradient(colors: [kPrimaryDark, kPrimary]),
          ),
          alignment: Alignment.center,
          child: const Text("T", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
        ),
        const SizedBox(width: 10),
        const Text("Transitely", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
        const Spacer(),
        TextButton.icon(onPressed: onBack, icon: const Icon(Icons.arrow_back_rounded), label: const Text("Home")),
      ],
    );
  }
}
