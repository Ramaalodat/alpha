import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/onboarding/PageView/boarding_one.dart';
import 'package:alpha_app/screens/onboarding/PageView/boarding_three.dart';
import 'package:alpha_app/screens/onboarding/PageView/boarding_two.dart';
import 'package:alpha_app/services/app_colors.dart';
import 'package:alpha_app/services/device.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}


class _OnboardingScreenState extends State<OnboardingScreen> {

  final PageController _controller = PageController();
  int currentPage = 0;

  @override
  Widget build(BuildContext context) {

    final double screenW = Device.width(context);
    final double screenH = Device.height(context);
    final themeprovider = Provider.of<Themeprovider>(context);
    return SafeArea(
      child: Scaffold(
          backgroundColor:  themeprovider.isDark ? AppColors.darkBackground : AppColors.lightBackground,
        body: Padding(
          padding:  EdgeInsets.symmetric(horizontal: screenW* 0.05  ),
          child: Column(
            children: [
                
              Expanded(
                child: PageView(
                  controller: _controller,
                  onPageChanged: (index){
                    setState(() {
                      currentPage = index;
                    });
                  },
                  children: [
                    BoardingOne(),
                    BoardingTwo() ,
                    BoardingThree()
                   
                  ],
                ),
              ),
                
                
           SmoothPageIndicator(
            controller: _controller,
            count: 3,
            effect: ExpandingDotsEffect(
              activeDotColor: themeprovider.isDark ? AppColors.darkAccent : AppColors.lightAccent, 
              dotColor: themeprovider.isDark ? AppColors.darkBorder : AppColors.lightBorder,     
              dotHeight: 8,
              dotWidth: 8,
              expansionFactor: 3,
              spacing: 6,
            ),
          ),
                SizedBox(height: screenH*0.05,),
                
              Row( crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
                 children: [
                  TextButton(onPressed: () {
                    
                  }, child: Text("Skip" , style: TextStyle( fontSize: screenW*0.04,
                    color: themeprovider.isDark
                      ? AppColors.darkSubText
                      : AppColors.lightSubText,
                      fontWeight: FontWeight.w500),
                      )),
             Expanded(
               child: ElevatedButton(
                            onPressed: (){
              _controller.nextPage(
                duration: Duration(milliseconds: 300),
                curve: Curves.ease,
              );
            },
                          style:  ButtonStyle( 
                            backgroundColor: themeprovider.isDark ? WidgetStatePropertyAll(
                             AppColors.darkSecondary
                            ) : 
                            WidgetStatePropertyAll(AppColors.lightSecondary) ,

                            fixedSize: WidgetStatePropertyAll(
                                Size(screenW * 0.8, screenH * 0.06),
                              ),
                          
                            shape: WidgetStatePropertyAll( RoundedRectangleBorder(borderRadius: BorderRadiusGeometry.circular(10)))
                            
                          ),
                          child: Text(
                           "Next",
                            style: TextStyle(fontSize: screenW * 0.055, color: AppColors.darkBorder ,fontWeight: FontWeight.w500),
                          ),
                  
                        ),
             ),
                 ],
              ),
                
                SizedBox(height: screenH*0.03,)
            ],
          ),
        ),
      ),
    );
  }
}