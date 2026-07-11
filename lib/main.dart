import 'package:alpha_app/providers/language_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/onboarding/splash_screen.dart';
import 'package:easy_localization/easy_localization.dart';

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
      child: MultiProvider( providers: [
            
        ChangeNotifierProvider(create: (context) => Themeprovider()..loadtheme(),),
         ChangeNotifierProvider(create: (context) => LanguageProvider()..loadSavedLanguage()),
      

  
       
      ],
        child: MyApp())
    ),
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

     
       
        return Consumer<Themeprovider>(builder: (context, themeprovider, _) {
         return MaterialApp(
            debugShowCheckedModeBanner: false,
            theme: ThemeData.light(),
            darkTheme: ThemeData.dark(),
            themeMode: themeprovider.thememode,
               localizationsDelegates: context.localizationDelegates,
                supportedLocales: context.supportedLocales,
                locale: context.locale,
                  navigatorKey: navigatorKey,
            home: SplashScreen()
          );
        },
         
        );
      
    
  }
}