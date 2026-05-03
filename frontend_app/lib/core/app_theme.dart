import "package:flutter/material.dart";

const kPrimary = Color(0xFF007AFF);
const kPrimaryDark = Color(0xFF0062CC);
const kSurface = Color(0xFFEDF3F9);
const kCardBorder = Color(0xFFD9E3EC);
const kText = Color(0xFF1C2731);
const kMuted = Color(0xFF607282);
const kDriverGreen = Color(0xFF34C759);
const kDanger = Color(0xFFFF3B30);

ThemeData buildTransitelyTheme() {
  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: kPrimary, surface: kSurface),
    scaffoldBackgroundColor: kSurface,
    fontFamily: "Inter",
    appBarTheme: const AppBarTheme(centerTitle: false, foregroundColor: kText, backgroundColor: Colors.white),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    ),
  );
}
