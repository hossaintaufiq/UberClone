import "dart:math" as math;

import "package:flutter/material.dart";

import "../core/app_theme.dart";
import "auth_screen.dart";

class HomePortalScreen extends StatefulWidget {
  const HomePortalScreen({super.key});

  @override
  State<HomePortalScreen> createState() => _HomePortalScreenState();
}

class _HomePortalScreenState extends State<HomePortalScreen> with TickerProviderStateMixin {
  late AnimationController _road;
  late AnimationController _intro;

  @override
  void initState() {
    super.initState();
    _road = AnimationController(vsync: this, duration: const Duration(seconds: 8))..repeat();
    _intro = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..forward();
  }

  @override
  void dispose() {
    _road.dispose();
    _intro.dispose();
    super.dispose();
  }

  void _openAuth(AuthMode mode) {
    Navigator.push(context, MaterialPageRoute<void>(builder: (_) => AuthScreen(mode: mode)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      body: Stack(
        fit: StackFit.expand,
        children: [
          Positioned.fill(
            child: _FullBleedRoadScene(roadAnimation: _road),
          ),
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
              child: FadeTransition(
                opacity: CurvedAnimation(parent: _intro, curve: Curves.easeOut),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: Colors.white,
                      ),
                      alignment: Alignment.center,
                      child: const Text("T", style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 18)),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      "Transitely",
                      style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: -0.4),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            left: 20,
            right: 20,
            bottom: 112 + MediaQuery.paddingOf(context).bottom,
            child: FadeTransition(
              opacity: CurvedAnimation(parent: _intro, curve: const Interval(0.12, 1, curve: Curves.easeOut)),
              child: SlideTransition(
                position: Tween<Offset>(begin: const Offset(0, 0.06), end: Offset.zero).animate(
                  CurvedAnimation(parent: _intro, curve: const Interval(0.12, 1, curve: Curves.easeOutCubic)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      "Go anywhere.",
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.95),
                        fontSize: 34,
                        fontWeight: FontWeight.w800,
                        height: 1.05,
                        letterSpacing: -1.1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Same road, one direction — book a ride or drive when you are ready.",
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.58),
                        fontSize: 15,
                        height: 1.35,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _AccountBottomBar(
              onRiderLogin: () => _openAuth(AuthMode.riderLogin),
              onRiderRegister: () => _openAuth(AuthMode.riderRegister),
              onDriverLogin: () => _openAuth(AuthMode.driverLogin),
              onDriverRegister: () => _openAuth(AuthMode.driverRegister),
            ),
          ),
        ],
      ),
    );
  }
}

/// Rider / Driver access: log in and register open the existing [AuthScreen] flows.
class _AccountBottomBar extends StatelessWidget {
  final VoidCallback onRiderLogin;
  final VoidCallback onRiderRegister;
  final VoidCallback onDriverLogin;
  final VoidCallback onDriverRegister;

  const _AccountBottomBar({
    required this.onRiderLogin,
    required this.onRiderRegister,
    required this.onDriverLogin,
    required this.onDriverRegister,
  });

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.paddingOf(context).bottom;

    return ClipRect(
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.72),
          border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.12))),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.45), blurRadius: 24, offset: const Offset(0, -6))],
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: EdgeInsets.fromLTRB(12, 10, 12, 10 + bottom),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _RoleColumn(
                    label: "Rider",
                    accent: kPrimary,
                    onLogin: onRiderLogin,
                    onRegister: onRiderRegister,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: SizedBox(
                    height: 72,
                    child: VerticalDivider(width: 1, thickness: 1, color: Colors.white.withValues(alpha: 0.14)),
                  ),
                ),
                Expanded(
                  child: _RoleColumn(
                    label: "Driver",
                    accent: kDriverGreen,
                    onLogin: onDriverLogin,
                    onRegister: onDriverRegister,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RoleColumn extends StatelessWidget {
  final String label;
  final Color accent;
  final VoidCallback onLogin;
  final VoidCallback onRegister;

  const _RoleColumn({
    required this.label,
    required this.accent,
    required this.onLogin,
    required this.onRegister,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Icon(label == "Rider" ? Icons.person_rounded : Icons.directions_car_filled_rounded, color: accent, size: 20),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16, letterSpacing: -0.2),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: FilledButton(
                onPressed: onLogin,
                style: FilledButton.styleFrom(
                  backgroundColor: accent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  minimumSize: const Size(0, 40),
                ),
                child: const Text("Log in", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: OutlinedButton(
                onPressed: onRegister,
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: BorderSide(color: accent.withValues(alpha: 0.65)),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  minimumSize: const Size(0, 40),
                ),
                child: const Text("Register", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// Full-screen top-down road: lane dividers scroll with forward travel; cars move in-lane in the same direction.
class _FullBleedRoadScene extends StatelessWidget {
  final Animation<double> roadAnimation;

  const _FullBleedRoadScene({required this.roadAnimation});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final w = constraints.maxWidth;
        final h = constraints.maxHeight;
        return Stack(
          fit: StackFit.expand,
          children: [
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xFF121212), Color(0xFF030303)],
                ),
              ),
            ),
            Positioned.fill(
              child: AnimatedBuilder(
                animation: roadAnimation,
                builder: (context, _) {
                  return CustomPaint(
                    painter: _RoadSurfacePainter(progress: roadAnimation.value, width: w, height: h),
                  );
                },
              ),
            ),
            Positioned.fill(
              child: AnimatedBuilder(
                animation: roadAnimation,
                builder: (context, _) {
                  return _VerticalTrafficLayer(progress: roadAnimation.value, width: w, height: h);
                },
              ),
            ),
          ],
        );
      },
    );
  }
}

class _RoadSurfacePainter extends CustomPainter {
  final double progress;
  final double width;
  final double height;

  _RoadSurfacePainter({required this.progress, required this.width, required this.height});

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final asphalt = Paint()..color = const Color(0xFF1A1A1A);
    canvas.drawRect(rect, asphalt);

    final laneFrac = <double>[0.18, 0.39, 0.61, 0.82];
    final edge = Paint()
      ..color = const Color(0xFF2C2C2C)
      ..strokeWidth = 5
      ..style = PaintingStyle.stroke;
    for (final f in [laneFrac.first, laneFrac.last]) {
      final x = width * f;
      canvas.drawLine(Offset(x, 0), Offset(x, height), edge);
    }

    final dashPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.2)
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    const dashLen = 14.0;
    const gap = 18.0;
    const cycle = dashLen + gap;
    final scroll = (progress * cycle * 25) % cycle;

    for (var li = 1; li < laneFrac.length - 1; li++) {
      final x = width * laneFrac[li];
      for (double y = -scroll; y < height + cycle; y += cycle) {
        canvas.drawLine(Offset(x, y), Offset(x, y + dashLen), dashPaint);
      }
    }

    final vignette = Paint()
      ..shader = RadialGradient(
        colors: [Colors.transparent, Colors.black.withValues(alpha: 0.35)],
        stops: const [0.45, 1.0],
        center: Alignment.center,
        radius: 0.95,
      ).createShader(rect);
    canvas.drawRect(rect, vignette);
  }

  @override
  bool shouldRepaint(covariant _RoadSurfacePainter oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.width != width || oldDelegate.height != height;
}

class _VerticalTrafficLayer extends StatelessWidget {
  final double progress;
  final double width;
  final double height;

  const _VerticalTrafficLayer({required this.progress, required this.width, required this.height});

  /// Lane centers between painted dividers (matches [_RoadSurfacePainter] edges).
  static double _laneCenterX(int laneIndex, double w) {
    const dividers = [0.18, 0.39, 0.61, 0.82];
    final left = dividers[laneIndex];
    final right = dividers[laneIndex + 1];
    return w * (left + right) / 2;
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        _CarDownLane(
          progress: progress,
          height: height,
          laneX: _laneCenterX(0, width),
          speed: 0.95,
          phase: 0.0,
          scale: 1.0,
          color: Colors.white,
        ),
        _CarDownLane(
          progress: progress,
          height: height,
          laneX: _laneCenterX(1, width),
          speed: 1.12,
          phase: 0.37,
          scale: 0.95,
          color: kPrimary,
        ),
        _CarDownLane(
          progress: progress,
          height: height,
          laneX: _laneCenterX(2, width),
          speed: 0.82,
          phase: 0.71,
          scale: 0.88,
          color: const Color(0xFFFFD60A),
        ),
      ],
    );
  }
}

class _CarDownLane extends StatelessWidget {
  final double progress;
  final double height;
  final double laneX;
  final double speed;
  final double phase;
  final double scale;
  final Color color;

  const _CarDownLane({
    required this.progress,
    required this.height,
    required this.laneX,
    required this.speed,
    required this.phase,
    required this.scale,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final t = ((progress * speed + phase) % 1.0);
    final travel = height + 100;
    final top = -80 + travel * t;
    final sway = math.sin(t * math.pi * 2) * 1.2;

    return Positioned(
      left: laneX - 13 + sway,
      top: top,
      child: Transform.scale(
        scale: scale,
        child: Transform.rotate(
          angle: math.pi / 2,
          alignment: Alignment.center,
          child: CustomPaint(
            size: const Size(52, 26),
            painter: _CarSilhouettePainter(color: color),
          ),
        ),
      ),
    );
  }
}

class _CarSilhouettePainter extends CustomPainter {
  final Color color;

  _CarSilhouettePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final body = RRect.fromRectAndRadius(Rect.fromLTWH(4, 8, size.width - 8, 12), const Radius.circular(4));
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    canvas.drawRRect(body, paint);

    final cabin = RRect.fromRectAndRadius(Rect.fromLTWH(14, 4, size.width - 28, 12), const Radius.circular(3));
    canvas.drawRRect(cabin, paint..color = color.withValues(alpha: 0.92));

    final window = Paint()..color = const Color(0xFF1A3A5C).withValues(alpha: 0.85);
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(18, 6, size.width - 36, 7), const Radius.circular(2)),
      window,
    );

    final wheel = Paint()..color = const Color(0xFF111111);
    canvas.drawCircle(Offset(14, size.height - 2), 4.5, wheel);
    canvas.drawCircle(Offset(size.width - 14, size.height - 2), 4.5, wheel);

    final head = Paint()
      ..color = Colors.white.withValues(alpha: 0.35)
      ..strokeWidth = 1.2;
    canvas.drawLine(Offset(size.width - 2, size.height * 0.45), Offset(size.width + 5, size.height * 0.45), head);
  }

  @override
  bool shouldRepaint(covariant _CarSilhouettePainter oldDelegate) => oldDelegate.color != color;
}
