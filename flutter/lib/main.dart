import 'package:alpha_app/providers/auth_provider.dart';
import 'package:alpha_app/providers/language_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/providers/financial_setup_provider.dart';
import 'package:alpha_app/providers/personal_provider.dart';
import 'package:alpha_app/providers/goal_provider.dart';
import 'package:alpha_app/providers/home_provider.dart';
import 'package:alpha_app/screens/auth/login.dart';
import 'package:alpha_app/screens/main/dashboard_screen.dart';
import 'package:alpha_app/screens/onboarding/personal_info_screen.dart';
import 'package:alpha_app/screens/onboarding/financial_setup_screen.dart';
import 'package:alpha_app/screens/goals/set_goal_screen.dart';
import 'package:alpha_app/screens/onboarding/splash_screen.dart';
import 'package:alpha_app/screens/main/main_screen.dart';
import 'package:alpha_app/screens/profile/profile_screen.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:alpha_app/providers/reward_provider.dart';
import 'package:alpha_app/providers/challenge_provider.dart';
import 'package:alpha_app/providers/leaderbord_provider.dart';
import 'package:alpha_app/providers/chatbot_provider.dart';
import 'package:alpha_app/providers/receipt_provider.dart';
import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();

  runApp(
    EasyLocalization(
        supportedLocales: const [Locale('en'), Locale('ar')],
        path: 'assets/translations',
        fallbackLocale: const Locale('en'),
        startLocale: const Locale('en'),
        child: MultiProvider(providers: [
          ChangeNotifierProvider(
            create: (context) => Themeprovider()..loadtheme(),
          ),
          ChangeNotifierProvider(
              create: (context) => LanguageProvider()..loadSavedLanguage()),
          ChangeNotifierProvider(create: (context) => AuthProvider()),
          ChangeNotifierProvider(create: (context) => FinancialProvider()),
          ChangeNotifierProvider(create: (context) => PersonalProvider()),
          ChangeNotifierProvider(create: (context) => GoalProvider()),
          ChangeNotifierProvider(create: (context) => HomeProvider()),
          ChangeNotifierProvider(create: (context) => RewardProvider()),
          ChangeNotifierProvider(
            create: (_) => ChallengeProvider(),
          ),
          ChangeNotifierProvider(
            create: (_) => ReceiptProvider(),
          ),
          ChangeNotifierProvider(
            create: (_) => LeaderboardProvider(),
          ),
          ChangeNotifierProvider(
            create: (_) => ChatbotProvider(),
          ),
        ], child: MyApp())),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    Future.microtask(() {
      String currentLang = context.locale.languageCode;
    });
  }

  @override
  Widget build(BuildContext context) {
    print(context.locale.languageCode);

    return Consumer<Themeprovider>(
      builder: (context, themeprovider, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData.light(),
          darkTheme: ThemeData.dark(),
          themeMode: themeprovider.thememode,
          localizationsDelegates: context.localizationDelegates,
          supportedLocales: context.supportedLocales,
          locale: context.locale,
          navigatorKey: navigatorKey,
          home: SplashScreen(),
          routes: {
            '/login': (context) => const Login(),
            '/dashboard': (context) => const DashboardScreen(),
            '/home': (context) => const MainScreen(),
            '/profile': (context) => const ProfileScreen(),
            '/onboarding/demographics': (context) => const PersonalInfoScreen(),
            '/onboarding/financial-info': (context) =>
                const FinancialSetupScreen(),
            '/onboarding/first-goal': (context) => const SetGoalScreen(),
          },
        );
      },
    );
  }
}
