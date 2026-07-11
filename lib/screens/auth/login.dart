
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
                                
                                 color: themeprovider.isDark
                    ? AppColors.darkSubText
                    : AppColors.lightSubText,
                               ),
                             ),
                 ),
                        SizedBox(height: screenH*0.03,),
                Padding(
                 padding: EdgeInsets.symmetric(horizontal: screenW*0.02),
                   child: Text("Phone Number" , style: TextStyle(fontSize: screenW*0.04 , color: AppColors.darkError , fontWeight: FontWeight.bold),),
                 ),
                 SizedBox(height: screenH*0.01,),
                 CustomTextfield( isPassword: false,
                  controller: _emailController, hint: "You@example.com" , validator: (value) {
                    if (value == null || value.isEmpty) return "validation.email_required".tr() ;
                  if (!value.contains('@') || !value.contains('.')) return "validation.invalid_email".tr();
                  return null;
                
                 },
                 icon: Icons.email_outlined,),
        
           SizedBox(height: screenH*0.02,),
          Padding(
                 padding: EdgeInsets.symmetric(horizontal: screenW*0.02),
                   child: Text("Password ", style: TextStyle(fontSize: screenW*0.04 , color: AppColors.darkError ,  fontWeight: FontWeight.bold),),
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
                        Icons.check_box , color: AppColors.darkSubText,) :Icon(Icons.square_outlined , color: AppColors.darkBorder,) 
                      ),
                      Text("remember_me".tr(),  style: TextStyle( fontSize: screenW * 0.04 , fontWeight: FontWeight.w500 , color: AppColors.darkAccent),)
                    ],
                  ),
              SizedBox(height: screenH*0.05,),
        
        Center(
          child: _isloading ? CircularProgressIndicator(color: AppColors.darkError,) :
           ElevatedButton(onPressed: () async{
            
           
        
          },  style:  ButtonStyle(
                              backgroundColor: WidgetStatePropertyAll(
                               AppColors.darkError,
                              ),
                              fixedSize:  WidgetStatePropertyAll(
                              Size(screenW * 0.85, screenH * 0.065),
                              ),
                              shadowColor: WidgetStatePropertyAll(AppColors.darkPrimary),
                              elevation: const WidgetStatePropertyAll(5)
                              
                            ),
                            child: Text(
                              "sign_in".tr(),
                              style: TextStyle(fontSize: screenW * 0.055, color: Colors.white),
                            ),
                      ),
        ),
        
         SizedBox(height: screenW*0.01,),
                        Center(
                          child: TextButton(onPressed: () {
                          
                          }, child: Text("forgot_password_title".tr(), style:  TextStyle(color: AppColors.darkText,  fontSize: screenW * 0.04),)),
                        ),
                           SizedBox(height: screenH * 0.02),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                    Text(
                     "no_account".tr(),
                      style: TextStyle(color: Colors.grey, fontSize: screenW * 0.04),
                    ),
                   SizedBox(width: screenW * 0.015),
                    InkWell(
                      onTap: () {
                      
              
              
                      },
                      child: Text(
            "sign_up".tr(),
              style:  TextStyle(
                color: AppColors.darkBorder,
                fontSize: screenW*0.04,
                fontWeight: FontWeight.w500,
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