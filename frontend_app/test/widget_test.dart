// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:frontend_app/main.dart';

void main() {
  testWidgets('Home portal loads', (WidgetTester tester) async {
    await tester.pumpWidget(const TransitelyApp());
    await tester.pumpAndSettle();

    expect(find.textContaining('Transitely'), findsWidgets);
    expect(find.text('Rider Portal'), findsOneWidget);
    expect(find.text('Driver Portal'), findsOneWidget);
  });
}
