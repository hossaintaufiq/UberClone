import "package:flutter/material.dart";

import "../../core/app_theme.dart";
import "../../services/auth_api.dart";
import "admin_shell_screen.dart";

class AdminLoginScreen extends StatefulWidget {
  const AdminLoginScreen({super.key});

  @override
  State<AdminLoginScreen> createState() => _AdminLoginScreenState();
}

class _AdminLoginScreenState extends State<AdminLoginScreen> {
  final _phone = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  String _err = "";

  @override
  void dispose() {
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _go() async {
    setState(() {
      _busy = true;
      _err = "";
    });
    try {
      await AuthApi.adminLogin(phone: _phone.text.trim(), password: _password.text.trim());
      if (!mounted) return;
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const AdminShellScreen()));
    } catch (e) {
      setState(() => _err = "$e".replaceFirst("Exception: ", ""));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Admin sign in")),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text("Transitely Admin", style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900)),
            const SizedBox(height: 6),
            const Text("Use your admin phone & password from the backend.", style: TextStyle(color: kMuted)),
            const SizedBox(height: 22),
            TextField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: "Phone", border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _password,
              obscureText: true,
              decoration: const InputDecoration(labelText: "Password", border: OutlineInputBorder()),
            ),
            if (_err.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(_err, style: const TextStyle(color: kDanger, fontWeight: FontWeight.w600)),
            ],
            const SizedBox(height: 22),
            FilledButton(
              onPressed: _busy ? null : _go,
              style: FilledButton.styleFrom(backgroundColor: const Color(0xFF1C2731), minimumSize: const Size.fromHeight(50)),
              child: _busy ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text("Sign in"),
            ),
          ],
        ),
      ),
    );
  }
}
