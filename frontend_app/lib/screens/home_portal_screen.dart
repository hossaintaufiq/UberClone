import "package:flutter/material.dart";

import "../core/app_theme.dart";
import "auth_screen.dart";

/// Onboarding-only accents (aligned with light blue theme).
const _onboardHeroTop = Color(0xFF0EA5E9);
const _onboardHeroBottom = Color(0xFF0284C7);
const _onboardPageBg = Color(0xFFE0F2FE);

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
      title: "Transitely",
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
      title: "Fast response",
      subtitle: "Lightning speed responses to your requests.",
      cta: "Next",
    ),
    _OnboardSlide(
      title: "Quick arrival",
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
    _page.nextPage(duration: const Duration(milliseconds: 280), curve: Curves.easeOutCubic);
  }

  void _skip() {
    _page.animateToPage(_slides.length - 1, duration: const Duration(milliseconds: 300), curve: Curves.easeOutCubic);
  }

  void _openAuth(AuthMode mode) {
    Navigator.push(context, MaterialPageRoute<void>(builder: (_) => AuthScreen(mode: mode)));
  }

  void _openRolePicker() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withValues(alpha: 0.45),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.52,
        minChildSize: 0.42,
        maxChildSize: 0.85,
        expand: false,
        builder: (context, scrollController) {
          final bottom = MediaQuery.paddingOf(context).bottom;
          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              boxShadow: [BoxShadow(color: Color(0x26028ABF), blurRadius: 24, offset: Offset(0, -4))],
            ),
            child: Column(
              children: [
                const SizedBox(height: 10),
                Container(
                  width: 40,
                  height: 5,
                  decoration: BoxDecoration(
                    color: const Color(0xFFBAE6FD),
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 18),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: LinearGradient(
                      colors: [kPrimary.withValues(alpha: 0.22), kSurface],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    border: Border.all(color: kCardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: const [BoxShadow(color: Color(0x14028ABF), blurRadius: 8)],
                            ),
                            child: Icon(Icons.directions_car_filled_rounded, color: kPrimaryDark, size: 26),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Welcome to Transitely",
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: kText, letterSpacing: -0.3),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  "Pick how you want to continue — your login stays the same.",
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: kMuted, height: 1.3),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView(
                    controller: scrollController,
                    padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + bottom),
                    children: [
                      Text(
                        "Continue as",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: kMuted, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 12),
                      _RolePickerCard(
                        icon: Icons.person_rounded,
                        title: "Rider",
                        subtitle: "Book rides, track trips, pay & rate.",
                        accent: kPrimaryDark,
                        onLogin: () {
                          Navigator.pop(ctx);
                          _openAuth(AuthMode.riderLogin);
                        },
                        onRegister: () {
                          Navigator.pop(ctx);
                          _openAuth(AuthMode.riderRegister);
                        },
                      ),
                      const SizedBox(height: 12),
                      _RolePickerCard(
                        icon: Icons.directions_car_filled_rounded,
                        title: "Driver",
                        subtitle: "Accept trips, navigate & earn.",
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
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _onboardPageBg,
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

class _RolePickerCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color accent;
  final VoidCallback onLogin;
  final VoidCallback onRegister;

  const _RolePickerCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.accent,
    required this.onLogin,
    required this.onRegister,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: kCardBorder.withValues(alpha: 0.9)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: accent.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  alignment: Alignment.center,
                  child: Icon(icon, color: accent, size: 26),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: kText)),
                      const SizedBox(height: 4),
                      Text(subtitle, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: kMuted, height: 1.25)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: FilledButton(
                    onPressed: onLogin,
                    style: FilledButton.styleFrom(
                      backgroundColor: accent,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text("Log in", style: TextStyle(fontWeight: FontWeight.w800)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: onRegister,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: accent,
                      side: BorderSide(color: accent.withValues(alpha: 0.55)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text("Sign up", style: TextStyle(fontWeight: FontWeight.w800)),
                  ),
                ),
              ],
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
          gradient: isHero
              ? const LinearGradient(
                  colors: [_onboardHeroTop, _onboardHeroBottom],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isHero ? null : Colors.white,
          borderRadius: BorderRadius.circular(26),
          boxShadow: const [BoxShadow(color: Color(0x14028ABF), blurRadius: 20, offset: Offset(0, 8))],
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
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      color: isHero ? Colors.white.withValues(alpha: 0.92) : kPrimaryDark,
                    ),
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
                        color: isHero ? Colors.white.withValues(alpha: 0.9) : kMuted,
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
                            color: active
                                ? (isHero ? Colors.white : kPrimary)
                                : (isHero ? Colors.white.withValues(alpha: 0.35) : const Color(0xFFBAE6FD)),
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
                      backgroundColor: isHero ? Colors.white : kPrimary,
                      foregroundColor: isHero ? kPrimaryDark : Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: isHero ? 2 : 0,
                      shadowColor: const Color(0x33028ABF),
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

  Widget _illustration(bool hero, int slideIndex) {
    if (hero) {
      return Container(
        height: 160,
        width: 260,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.18),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
        ),
        alignment: Alignment.center,
        child: const Icon(Icons.directions_car_filled_rounded, size: 92, color: Colors.white),
      );
    }
    final icons = [
      Icons.phone_android_rounded,
      Icons.pin_drop_rounded,
      Icons.schedule_rounded,
    ];
    return Container(
      height: 170,
      width: 220,
      decoration: BoxDecoration(
        color: const Color(0xFFF0F9FF),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: kCardBorder),
      ),
      alignment: Alignment.center,
      child: Icon(icons[(slideIndex - 1).clamp(0, 2)], size: 84, color: kPrimaryDark),
    );
  }
}
