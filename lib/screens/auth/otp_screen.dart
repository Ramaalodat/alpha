import 'dart:async';

import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/providers/auth_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/auth/terms_screen.dart';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pinput/pinput.dart';
import 'package:provider/provider.dart';


class OtpScreen extends StatefulWidget {

  final String phoneNumber;

  const OtpScreen({
    super.key,
    required this.phoneNumber,
  });


  @override
  State<OtpScreen> createState() => _OtpScreenState();

}



class _OtpScreenState extends State<OtpScreen> {


  final TextEditingController _pinController =
  TextEditingController();


  Timer? _timer;


  int _secondsRemaining = 300;



  @override
  void initState() {

    super.initState();

    _startTimer();

  }



  void _startTimer(){

    setState(() {

      _secondsRemaining = 10;

    });


    _timer?.cancel();


    _timer = Timer.periodic(
        const Duration(seconds: 1),
            (timer){


          if(!mounted) return;


          if(_secondsRemaining > 0){

            setState(() {

              _secondsRemaining--;

            });


          }else{

            timer.cancel();

          }


        }
    );

  }



  String maskPhoneNumber(String phone){

    if(phone.length <= 6){

      return phone;

    }


    return "0${phone.substring(0,2)}•••••${phone.substring(phone.length-2)}";

  }



  @override
  void dispose(){

    _timer?.cancel();

    _pinController.dispose();

    super.dispose();

  }





  @override
  Widget build(BuildContext context) {
final screenW = Device.width(context);
    final screenH = Device.height(context);
    final themeprovider = Provider.of<Themeprovider>(context);

    final authProvider =
    Provider.of<AuthProvider>(context);



    final defaultPinTheme = PinTheme(

      width: screenW*0.4,

      height: screenH*0.095,


      textStyle:  TextStyle(

        fontSize: screenW*0.07,

        fontWeight: FontWeight.bold,

        color: themeprovider.isDark ? AppColors.darkPrimary : AppColors.lightPrimary,

      ),


      decoration: BoxDecoration(

        color: themeprovider.isDark ? AppColors.darkBorder : AppColors.lightBorder, 

        borderRadius:
        BorderRadius.circular(12),


        border: Border.all(
          color: themeprovider.isDark ? AppColors.darkBorder : AppColors.lightBorder,
        ),

      ),

    );




    return SafeArea(
      child: Scaffold(
      
      
       
      backgroundColor:  themeprovider.isDark ? AppColors.darkBackground : AppColors.lightBackground,
      
      
      
        body: SafeArea(
      
      
          child: SingleChildScrollView(
            child: Padding(
                  
              
              padding:  EdgeInsets.symmetric(horizontal: screenW* 0.05  ),
                  
                  
              child: Column(
                  
                children: [
                  
                  
                  
                   SizedBox(height: screenH*0.09),
                  
                  
                  
                  
                  Container(
                  
                    padding:
                   EdgeInsets.all(screenW*0.055),
                  
                  
                    decoration:
                    BoxDecoration(
                  
                    color: themeprovider.isDark ? AppColors.darkBorder : AppColors.lightBorder, 
                  
                      borderRadius:
                      BorderRadius.circular(20),
                  
                    ),
                  
                  
                    child:
                     Icon(
                  
                      Icons.sms_outlined,
                  
                      size: screenW*0.15,
                  
                    ),
                  
                  ),
                  
                  
                  
                  
                  
                   SizedBox(height: screenH*0.045),
                  
                  
                  
                  
                   Text(
                "Verify your number",
                style: GoogleFonts.ibmPlexSansArabic(
                  fontSize: screenW*0.08,
                  fontWeight: FontWeight.bold,
                  color: themeprovider.isDark
                      ? AppColors.darkText
                      : AppColors.lightText,
                ),
              ),
                  
                  
                  
                  
                  
               SizedBox(height: screenH*0.01),
                  
                  
                  
                  
                  
                  Text( textAlign: TextAlign.center,
                                 "We sent a 6-digit code to ${maskPhoneNumber(widget.phoneNumber)}",
                                 style: GoogleFonts.ibmPlexSansArabic(
                                   fontSize: screenW*0.04,
                                  fontWeight: FontWeight.w500,
                                   color: themeprovider.isDark
                      ? AppColors.darkSubText
                      : AppColors.lightSubText,
                                 ),
                               ),
                  
                  
                  
                  
                   SizedBox(height: screenH*0.06),
                  
                  
                  
                  
                  
                  Pinput(
                  
                    controller: _pinController,
                  
                  
                    length: 6,
                  
                  submittedPinTheme: defaultPinTheme.copyWith(
    decoration: defaultPinTheme.decoration!.copyWith(
      border: Border.all(
        width: 1.5,
        color: themeprovider.isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
      ),
      color: (themeprovider.isDark ? AppColors.darkSecondary : AppColors.lightSecondary).withOpacity(0.4),
    ),
  ),
                    defaultPinTheme:
                    defaultPinTheme,
                  
                  
                    focusedPinTheme:
                    defaultPinTheme.copyWith(
                  
                  
                      decoration:
                      defaultPinTheme.decoration!.copyWith(
                  
                        border: Border.all( width: 1.5,
                          color: themeprovider.isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                        ),
                color: (themeprovider.isDark ? AppColors.darkSecondary : AppColors.lightSecondary).withOpacity(0.4),
                      ),
                  
                    ),
                  
                  ),
                  
                  
                  
                  
                   SizedBox(height: screenH*0.03),
                  
                  
                  
                  
                  Row(
                  
                    mainAxisAlignment:
                    MainAxisAlignment.center,
                  
                  
                    children: [
                  
                  Text(
                        "Didn't get the code? ",
                          style: TextStyle( color: (themeprovider.isDark ? AppColors.darkSubText : AppColors.lightSubText).withOpacity(0.5), fontSize: screenW * 0.04 , fontWeight: FontWeight.w500),
                        ),
                  
                      
                  
                      
                  
                
                  
                      GestureDetector(
                  
                        onTap:
                        _secondsRemaining == 0
                            ? _startTimer
                            : null,
                  
                  
                        child: Text(
                  
                  
                          _secondsRemaining > 0
                  
                              ? "Resend ${(_secondsRemaining ~/ 60)}:${(_secondsRemaining % 60).toString().padLeft(2,'0')}"
                  
                              : "Resend",
                  
                  
                  
                          style: 
                                                  TextStyle(
                                                     color: _secondsRemaining == 0 ?    themeprovider.isDark ? AppColors.darkPrimary : AppColors.lightPrimary :(themeprovider.isDark ? AppColors.darkSubText : AppColors.lightSubText).withOpacity(0.5), fontSize: screenW * 0.04 , fontWeight: FontWeight.bold),
            
                        
                  
                        ),
                  
                      ),
                  
                  
                    ],
                  
                  ),
                  
                  
                  
                  
                  
                  
                  SizedBox(height:screenH*0.3,),
              
                  
                Padding(
            
                    padding: EdgeInsets.only(
                      bottom: screenH * 0.02,
                    ),
            
            
                    child: ElevatedButton(
            
                      onPressed: () {
            
            
                      },
            
            
                      style: ButtonStyle(
            
                        backgroundColor: WidgetStatePropertyAll(
            
                          themeprovider.isDark
                              ? AppColors.darkPrimary
                              : AppColors.lightPrimary,
            
                        ),
            
            
                        fixedSize: WidgetStatePropertyAll(
            
                          Size(
                            screenW,
                            screenH * 0.065,
                          ),
            
                        ),
            
            
                        shape: WidgetStatePropertyAll(
            
                          RoundedRectangleBorder(
            
                            borderRadius:
                                BorderRadius.circular(10),
            
                          ),
            
                        ),
            
                      ),
            
            
                      child: Text(
            
                        "Verify",
            
                        style: TextStyle(
            
                          fontSize: screenW * 0.055,
            
                          color: AppColors.darkBorder,
            
                          fontWeight: FontWeight.w600,
            
                        ),
            
                      ),
            
                    ),
            
                  ),
                  
                  
                ],
                  
              ),
                  
            ),
          ),
      
        ),
      
      
      ),
    );

  }

}