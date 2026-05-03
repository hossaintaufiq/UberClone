import "package:flutter/material.dart";
import "package:flutter/services.dart";

import "core/app_theme.dart";
import "screens/home_portal_screen.dart";

void main() {
  WidgetsFlutterBinding.ensureInitialized();
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
      title: "Transitely",
      theme: buildTransitelyTheme(),
      home: const HomePortalScreen(),
    );
  }
}
