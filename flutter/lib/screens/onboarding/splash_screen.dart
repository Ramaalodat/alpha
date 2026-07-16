
import 'package:alpha_app/media/images.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/onboarding/onboarding_screen.dart';
import 'package:alpha_app/services/auth_service.dart';

import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';


class SplashScreen extends StatefulWidget {

  
  const SplashScreen({super.key});


  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {


  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    _checkRememberMe();
   
    
  }
  @override
  Widget build(BuildContext context) {
   
    final double screenW = Device.width(context);
    final double screenH = Device.height(context);
    final themeprovider = Provider.of<Themeprovider>(context);
    return Scaffold( 
 backgroundColor:  themeprovider.isDark ? AppColors.darkBackground : AppColors.lightBackground,
  body: Stack(
  children: [
    Center(
      child: Column(
       
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            ImagesAssets.logo,
            width: screenW * 0.5,
            height: screenH * 0.18,
            fit: BoxFit.contain,
          ),

           SizedBox(height: screenH*0.03),

          Text(
            "Alpha",
            style: GoogleFonts.ibmPlexSansArabic(
              fontSize: screenW*0.1,
              fontWeight: FontWeight.bold,
              color: themeprovider.isDark
                  ? AppColors.darkText
                  : AppColors.lightText,
            ),
          ),
 SizedBox(height: screenH*0.02),
          Text(
            "SMART FINANCIAL ADVISOR",
            style: GoogleFonts.ibmPlexSansArabic(
              fontSize: screenW*0.042,
             
              color: themeprovider.isDark
                  ? AppColors.darkSubText
                  : AppColors.lightSubText,
            ),
          ),
        ],
      ),
    ),

    Padding(
      padding: EdgeInsets.only(bottom: screenH * 0.1),
      child: Align(
        alignment: Alignment.bottomCenter,
        child: CircularProgressIndicator(
          color: themeprovider.isDark
              ? AppColors.darkAccent
              : AppColors.darkAccent,
        ),
      ),
    ),
  ],
),


    );
  }

  void _checkRememberMe() async {
    final prefs = await SharedPreferences.getInstance();
    final accessToken = prefs.getString('access_token') ?? '';

    await Future.delayed(const Duration(seconds: 3));
    if (!mounted) return;

    // No token → go to onboarding intro (page view → login)
    if (accessToken.isEmpty) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const OnboardingScreen()),
      );
      return;
    }

    // Token exists → validate it
    try {
      final user = await AuthService.getCurrentUser();
      if (!mounted) return;

      final isOnboarded = user['isOnboarded'] == true;
      if (isOnboarded) {
        Navigator.pushReplacementNamed(context, '/dashboard');
      } else {
        // User has account but hasn't completed onboarding → demographics
        Navigator.pushReplacementNamed(context, '/onboarding/demographics');
      }
    } catch (_) {
      // Token invalid → try refresh
      try {
        await AuthService.refreshToken();
        if (!mounted) return;
        // Refresh succeeded → try getting user again
        final user = await AuthService.getCurrentUser();
        if (!mounted) return;
        final isOnboarded = user['isOnboarded'] == true;
        if (isOnboarded) {
          Navigator.pushReplacementNamed(context, '/dashboard');
        } else {
          Navigator.pushReplacementNamed(context, '/onboarding/demographics');
        }
      } catch (_) {
        // Refresh failed → clear tokens and go to login flow
        await prefs.remove('access_token');
        await prefs.remove('refresh_token');
        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const OnboardingScreen()),
        );
      }
    }
  }
}