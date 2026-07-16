import 'package:alpha_app/main.dart';
import 'package:alpha_app/providers/auth_provider.dart';
import 'package:alpha_app/providers/language_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('app launches and shows the splash screen', (WidgetTester tester) async {
    await EasyLocalization.ensureInitialized();

    await tester.pumpWidget(
      EasyLocalization(
        supportedLocales: const [Locale('en'), Locale('ar')],
        path: 'assets/translations',
        fallbackLocale: const Locale('en'),
        startLocale: const Locale('en'),
        child: MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => Themeprovider()),
            ChangeNotifierProvider(create: (_) => LanguageProvider()),
            ChangeNotifierProvider(create: (_) => AuthProvider()),
          ],
          child: const MyApp(),
        ),
      ),
    );

    await tester.pump();

    expect(find.text('Alpha'), findsOneWidget);
    expect(find.text('SMART FINANCIAL ADVISOR'), findsOneWidget);
  });
}
