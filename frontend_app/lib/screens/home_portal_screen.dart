import "package:flutter/material.dart";

import "../core/app_theme.dart";
import "auth_screen.dart";

class HomePortalScreen extends StatefulWidget {
  const HomePortalScreen({super.key});

  @override
  State<HomePortalScreen> createState() => _HomePortalScreenState();
}

class _HomePortalScreenState extends State<HomePortalScreen> {
  final PageController _page = PageController();
  int _index = 0;

  static const _slides = <_OnboardSlide>[
    _OnboardSlide(
      title: "Transit",
      subtitle: "Reliable rides, any time you need.",
      cta: "Next",
      isHero: true,
    ),
    _OnboardSlide(
      title: "Easy Booking",
      subtitle: "Streamlined booking for a hassle-free experience.",
      cta: "Next",
    ),
    _OnboardSlide(
      title: "Fast Responds",
      subtitle: "Lightning speed responses to your requests.",
      cta: "Next",
    ),
    _OnboardSlide(
      title: "Quick Arrival",
      subtitle: "Enjoy speedy arrivals that save your time.",
      cta: "Get started",
    ),
  ];

  @override
  void dispose() {
    _page.dispose();
    super.dispose();
  }

  void _next() {
    if (_index >= _slides.length - 1) {
      _openRolePicker();
      return;
    }
    _page.nextPage(duration: const Duration(milliseconds: 260), curve: Curves.easeOutCubic);
  }

  void _skip() {
    _page.animateToPage(_slides.length - 1, duration: const Duration(milliseconds: 280), curve: Curves.easeOutCubic);
  }

  void _openAuth(AuthMode mode) {
    Navigator.push(context, MaterialPageRoute<void>(builder: (_) => AuthScreen(mode: mode)));
  }

  void _openRolePicker() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: EdgeInsets.fromLTRB(16, 16, 16, 14 + MediaQuery.paddingOf(ctx).bottom),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 42, height: 4, decoration: BoxDecoration(color: const Color(0xFFD9E3EC), borderRadius: BorderRadius.circular(99))),
            const SizedBox(height: 14),
            const Text("Continue as", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: kText)),
            const SizedBox(height: 6),
            const Text("Choose rider or driver portal", style: TextStyle(color: kMuted, fontWeight: FontWeight.w600)),
            const SizedBox(height: 14),
            _roleCard(
              icon: Icons.person_rounded,
              title: "Rider",
              accent: kPrimary,
              onLogin: () {
                Navigator.pop(ctx);
                _openAuth(AuthMode.riderLogin);
              },
              onRegister: () {
                Navigator.pop(ctx);
                _openAuth(AuthMode.riderRegister);
              },
            ),
            const SizedBox(height: 10),
            _roleCard(
              icon: Icons.directions_car_filled_rounded,
              title: "Driver",
              accent: kDriverGreen,
              onLogin: () {
                Navigator.pop(ctx);
                _openAuth(AuthMode.driverLogin);
              },
              onRegister: () {
                Navigator.pop(ctx);
                _openAuth(AuthMode.driverRegister);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _roleCard({
    required IconData icon,
    required String title,
    required Color accent,
    required VoidCallback onLogin,
    required VoidCallback onRegister,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kCardBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(color: accent.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
            alignment: Alignment.center,
            child: Icon(icon, color: accent),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900))),
          FilledButton(
            onPressed: onLogin,
            style: FilledButton.styleFrom(backgroundColor: accent, foregroundColor: Colors.white, minimumSize: const Size(64, 38)),
            child: const Text("Login"),
          ),
          const SizedBox(width: 8),
          OutlinedButton(
            onPressed: onRegister,
            style: OutlinedButton.styleFrom(minimumSize: const Size(74, 38), foregroundColor: accent),
            child: const Text("Sign up"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE9F6EC),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _page,
                itemCount: _slides.length,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (_, i) => _OnboardView(
                  slide: _slides[i],
                  isLast: i == _slides.length - 1,
                  onSkip: _skip,
                  onNext: _next,
                  index: i,
                  total: _slides.length,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardSlide {
  final String title;
  final String subtitle;
  final String cta;
  final bool isHero;

  const _OnboardSlide({
    required this.title,
    required this.subtitle,
    required this.cta,
    this.isHero = false,
  });
}

class _OnboardView extends StatelessWidget {
  final _OnboardSlide slide;
  final bool isLast;
  final VoidCallback onSkip;
  final VoidCallback onNext;
  final int index;
  final int total;

  const _OnboardView({
    required this.slide,
    required this.isLast,
    required this.onSkip,
    required this.onNext,
    required this.index,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    final isHero = slide.isHero;
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Container(
        decoration: BoxDecoration(
          color: isHero ? const Color(0xFF0D6B31) : Colors.white,
          borderRadius: BorderRadius.circular(26),
          boxShadow: const [BoxShadow(color: Color(0x14000000), blurRadius: 16, offset: Offset(0, 8))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
              child: Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: isLast ? null : onSkip,
                  child: Text(
                    isLast ? "" : "Skip",
                    style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF166534)),
                  ),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _illustration(isHero, index),
                    const SizedBox(height: 28),
                    Text(
                      slide.title,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: isHero ? 38 : 34,
                        fontWeight: FontWeight.w900,
                        color: isHero ? Colors.white : kText,
                        letterSpacing: -0.8,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      slide.subtitle,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isHero ? Colors.white.withValues(alpha: 0.88) : kMuted,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 22),
              child: Row(
                children: [
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(total, (i) {
                        final active = i == index;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          width: active ? 18 : 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: active ? const Color(0xFF166534) : const Color(0xFFD5E3D8),
                            borderRadius: BorderRadius.circular(99),
                          ),
                        );
                      }),
                    ),
                  ),
                  FilledButton.icon(
                    onPressed: onNext,
                    icon: Icon(isLast ? Icons.arrow_forward_rounded : Icons.arrow_forward_ios_rounded, size: 16),
                    label: Text(slide.cta),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF0D6B31),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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

  Widget _illustration(bool hero, int index) {
    if (hero) {
      return Container(
        height: 160,
        width: 260,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(24),
        ),
        alignment: Alignment.center,
        child: const Icon(Icons.directions_car_filled_rounded, size: 92, color: Colors.white),
      );
    }
    final icons = [
      Icons.phone_android_rounded,
      Icons.pin_drop_rounded,
      Icons.access_time_filled_rounded,
    ];
    return Container(
      height: 170,
      width: 220,
      decoration: BoxDecoration(
        color: const Color(0xFFF3F7F4),
        borderRadius: BorderRadius.circular(22),
      ),
      alignment: Alignment.center,
      child: Icon(icons[(index - 1).clamp(0, 2)], size: 84, color: const Color(0xFF0D6B31)),
    );
  }
}
