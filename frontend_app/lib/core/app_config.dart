import "package:flutter/foundation.dart" show TargetPlatform, defaultTargetPlatform, kIsWeb;

class AppConfig {
  /// Web / iOS simulator / desktop: localhost. Android emulator: 10.0.2.2.
  /// Physical Android device: use your PC's LAN IP via `--dart-define=API_BASE_URL=...`.
  static String get baseUrl {
    const fromEnv = String.fromEnvironment("API_BASE_URL");
    if (fromEnv.isNotEmpty) return fromEnv;
    if (kIsWeb) return "http://localhost:5000";
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return "http://10.0.2.2:5000";
      default:
        return "http://localhost:5000";
    }
  }
}
