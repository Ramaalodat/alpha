
import 'package:alpha_app/media/images.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/widgets/custom_textfield.dart';
import 'package:easy_localization/easy_localization.dart';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';


class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {

final _nameController = TextEditingController();
final _emailController = TextEditingController();
final  _passwordController = TextEditingController();
 bool issecure = true;
 bool _isremember = false ;
  bool _isloading = false;
  final _formkey = GlobalKey<FormState>();
  @override
  Widget build(BuildContext context) {
    final screenW = Device.width(context);
    final screenH = Device.height(context);
    final themeprovider = Provider.of<Themeprovider>(context);
    return Form( key: _formkey,
      child: SafeArea(
        child: Scaffold(    backgroundColor:  themeprovider.isDark ? AppColors.darkBackground : AppColors.lightBackground,
               
          body:  SingleChildScrollView(
            child: Padding(
           padding:  EdgeInsets.symmetric(horizontal: screenW* 0.05  ),
              child: Column(  
              
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              
               
                 SizedBox(height: screenH*0.03,),
                Center(child: Image.asset(ImagesAssets.logo , height: screenH*0.15, width: screenW*0.25,)),
         Center(
           child: Text(
              "Welcome back",
              style: GoogleFonts.ibmPlexSansArabic(
                fontSize: screenW*0.08,
                fontWeight: FontWeight.bold,
                color: themeprovider.isDark
                    ? AppColors.darkText
                    : AppColors.lightText,
              ),
            ),
         ),
        SizedBox(height: screenH*0.02,),
                 Center(
                   child: Text( 
                               "Log in to continue your financial journey",
                               style: GoogleFonts.ibmPlexSansArabic(
                                 fontSize: screenW*0.04,
                                fontWeight: FontWeight.w500,
                                 color: themeprovider.isDark
                    ? AppColors.darkSubText
                    : AppColors.lightSubText,
                               ),
                             ),
                 ),
                        SizedBox(height: screenH*0.03,),
                Padding(
                 padding: EdgeInsets.symmetric(horizontal: screenW*0.02),
                   child: Text("Phone number" , style: TextStyle(fontSize: screenW*0.04 ,  color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText , fontWeight: FontWeight.bold),),
                 ),
                 SizedBox(height: screenH*0.01,),
                 CustomTextfield( isPassword: false,
                  controller: _emailController, hint: "+962" , validator: (value) {
                    if (value == null || value.isEmpty) {
    return "Phone number is required";
  }

  if (value.length != 9) {
    return "Enter a valid phone number";
  }

  if (!value.startsWith("7")) {
    return "Invalid phone number";
  }

  return null;
                
                 },
                 icon: Icons.call,),
        
           SizedBox(height: screenH*0.02,),
          Padding(
                 padding: EdgeInsets.symmetric(horizontal: screenW*0.02),
                   child: Text("Password ", style: TextStyle(fontSize: screenW*0.04 , color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText,  fontWeight: FontWeight.bold),),
                 ),
                 SizedBox(height: screenH*0.01,),
        
                       CustomTextfield(
                controller: _passwordController,
                hint: "+6 letters",
                icon: Icons.lock_outline_rounded,
                isPassword: true,
                togglePassword: () {
                  setState(() {}); 
                },
                validator: (value) {
                  if (value == null || value.isEmpty) return "validation.password_required".tr();
                  if (value.length < 6) return "validation.password_short".tr();
                  return null;
                },
              ),
        
           SizedBox(height: screenH * 0.02),
                  Row( mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(onPressed: () async{
              
              
              
                        setState(() {
                          _isremember=!_isremember;
                        });
              
                   
                      }, icon: _isremember ? Icon( size: screenW * 0.06,
                        Icons.check_box , color: themeprovider.isDark ? AppColors.darkSecondary :AppColors.lightSecondary,) :Icon(Icons.square_outlined , color: themeprovider.isDark ? AppColors.darkSecondary :AppColors.lightSecondary,) 
                      ),
                      Text("remember_me".tr(),  style: TextStyle( fontSize: screenW * 0.04 , fontWeight: FontWeight.w600 , color: themeprovider.isDark ? AppColors.darkSecondary :AppColors.lightSecondary ),)
                    ],
                  ),
              SizedBox(height: screenH*0.05,),
        
        Center(
          child: _isloading ? CircularProgressIndicator(color: AppColors.darkError,) :
             ElevatedButton(
                     onPressed: () {
                     
                     },
                     style: ButtonStyle(
                       backgroundColor: WidgetStatePropertyAll(
             themeprovider.isDark
                 ? AppColors.darkPrimary
                 : AppColors.lightPrimary,
                       ),
                       fixedSize: WidgetStatePropertyAll(
             Size(screenW * 0.8, screenH * 0.065),
                       ),
                       shape: WidgetStatePropertyAll(
             RoundedRectangleBorder(
               borderRadius: BorderRadius.circular(10),
             ),
                       ),
                     ),
                     child: Text(
                       "Login",
                       style: TextStyle(
             fontSize: screenW * 0.055,
             color: AppColors.darkBorder,
             fontWeight: FontWeight.w600,
                       ),
                     ),
                   ),
        ),
        
          SizedBox(height: screenW*0.01,),
                          Center(
                            child: TextButton(onPressed: () {
                              
                            }, child: Text("forgot_password_title".tr(), style:  TextStyle(color: themeprovider.isDark ? AppColors.darkSecondary : AppColors.lightSecondary,  fontSize: screenW * 0.04 , fontWeight: FontWeight.w600),)),
                          ),
                             SizedBox(height: screenH * 0.06),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                    Text(
                     "no_account".tr(),
                      style: TextStyle(color: themeprovider.isDark
                    ? AppColors.darkSubText
                    : AppColors.lightSubText, fontSize: screenW * 0.04 , fontWeight: FontWeight.w500),
                    ),
                   SizedBox(width: screenW * 0.015),
                    InkWell(
                      onTap: () {
                      
              
              
                      },
                      child: Text(
            "sign_up".tr(),
              style:  TextStyle(
               color: themeprovider.isDark ? AppColors.darkSecondary :AppColors.lightSecondary ,
                fontSize: screenW*0.045,
                fontWeight: FontWeight.w600,
                
              ),
                      ),
                    ),
                      ],
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