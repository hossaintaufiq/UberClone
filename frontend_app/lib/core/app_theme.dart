import "package:flutter/material.dart";

/// Light blue brand palette (Transitely rider app).
const kPrimary = Color(0xFF38BDF8);
const kPrimaryDark = Color(0xFF0284C7);
const kSurface = Color(0xFFF0F9FF);
const kCardBorder = Color(0xFFC7E8F5);
const kText = Color(0xFF1C2731);
const kMuted = Color(0xFF607282);
const kDriverGreen = Color(0xFF34C759);
const kDanger = Color(0xFFFF3B30);

ThemeData buildTransitelyTheme() {
  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: kPrimary,
      brightness: Brightness.light,
      surface: kSurface,
      primary: kPrimary,
      onPrimary: Colors.white,
      secondary: const Color(0xFF34C759),
    ),
    scaffoldBackgroundColor: kSurface,
    fontFamily: "Inter",
    appBarTheme: const AppBarTheme(
      centerTitle: false,
      foregroundColor: kText,
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: kCardBorder),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: kCardBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: kCardBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: kPrimary, width: 1.5),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: Colors.white,
      indicatorColor: kPrimary.withOpacity(0.14),
      iconTheme: WidgetStateProperty.resolveWith(
        (states) => IconThemeData(color: states.contains(WidgetState.selected) ? kPrimary : kMuted),
      ),
      labelTextStyle: WidgetStateProperty.resolveWith(
        (states) => TextStyle(
          fontWeight: FontWeight.w700,
          fontSize: 12,
          color: states.contains(WidgetState.selected) ? kPrimary : kMuted,
        ),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: const Color(0xFF111827),
      contentTextStyle: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        side: const BorderSide(color: kCardBorder),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        foregroundColor: kText,
      ),
    ),
    chipTheme: ChipThemeData(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      side: const BorderSide(color: kCardBorder),
      selectedColor: kPrimary.withOpacity(0.14),
      backgroundColor: Colors.white,
      labelStyle: const TextStyle(fontWeight: FontWeight.w700),
      secondaryLabelStyle: const TextStyle(fontWeight: FontWeight.w700),
    ),
  );
}
