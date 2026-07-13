
import 'package:alpha_app/media/images.dart';
import 'package:alpha_app/providers/auth_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/screens/auth/otp_screen.dart';
import 'package:alpha_app/screens/profile/birth_date_screen.dart';
import 'package:alpha_app/widgets/custom_phonefield.dart';
import 'package:alpha_app/widgets/custom_textfield.dart';
import 'package:easy_localization/easy_localization.dart';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';


class CreateAccount extends StatefulWidget {
  const CreateAccount({super.key});

  @override
  State<CreateAccount> createState() => _CreateAccountState();
}

class _CreateAccountState extends State<CreateAccount> {


  final _formkey = GlobalKey<FormState>();
  @override
  Widget build(BuildContext context) {
    final screenW = Device.width(context);
    final screenH = Device.height(context);
    final themeprovider = Provider.of<Themeprovider>(context);
     final authprovider = context.watch<AuthProvider>();
    return Form( key: _formkey,
      child: SafeArea(
        child: Scaffold(    backgroundColor:  themeprovider.isDark ? AppColors.darkBackground : AppColors.lightBackground,
               
          body:  SingleChildScrollView(
            child: Padding(
           padding:  EdgeInsets.symmetric(horizontal: screenW* 0.05  ),
              child: Column(  
              
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              
               
                 SizedBox(height: screenH*0.08,),
                Text( 
                               "LET'S GET STARTED",
                               style: GoogleFonts.ibmPlexSansArabic(
                                 fontSize: screenW*0.04,
                                fontWeight: FontWeight.w500,
                                 color: themeprovider.isDark
                    ? AppColors.darkAccent
                    : AppColors.lightAccent,
                               ),
                             ),
                             SizedBox(height: screenH*0.02,),
         Text(
            "Create your account",
            style: GoogleFonts.ibmPlexSansArabic(
              fontSize: screenW*0.08,
              fontWeight: FontWeight.bold,
              color: themeprovider.isDark
                  ? AppColors.darkText
                  : AppColors.lightText,
            ),
          ),
        SizedBox(height: screenH*0.02,),
                 Text( 
                             "One minute stands between you and real insight into your money",
                             style: GoogleFonts.ibmPlexSansArabic(
                               fontSize: screenW*0.04,
                              fontWeight: FontWeight.w500,
                               color: themeprovider.isDark
                  ? AppColors.darkSubText
                  : AppColors.lightSubText,
                             ),
                           ),
                            SizedBox(height: screenH*0.03,),
                Padding(
                 padding: EdgeInsets.symmetric(horizontal: screenW*0.02),
                   child: Text("Full name" , style: TextStyle(fontSize: screenW*0.04 ,  color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText , fontWeight: FontWeight.bold),),
                 ),
                 SizedBox(height: screenH*0.01,),
                 CustomTextfield(validator: (value){

 if(value == null || value.isEmpty){
   return "Name is required";
 }

 return null;

},
                  controller: authprovider.nameController, hint: "Enter your full name", type:  TextFieldType.name , icon: Icons.person,),
                        SizedBox(height: screenH*0.02,),
                Padding(
                 padding: EdgeInsets.symmetric(horizontal: screenW*0.02),
                   child: Text("Phone number" , style: TextStyle(fontSize: screenW*0.04 ,  color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText , fontWeight: FontWeight.bold),),
                 ),
                 SizedBox(height: screenH*0.01,),
               CustomPhoneField(controller: authprovider.phoneController ,
                validator:    (value){

    if(value == null || value.isEmpty){
      return "Phone number is required";
    }


    if(value.length != 9){
      return "Enter a valid phone number";
    }


    if(!value.startsWith("7")){
      return "Invalid phone number";
    }


    return null;
  },),
        
           SizedBox(height: screenH*0.02,),
            Padding(
                 padding: EdgeInsets.symmetric(horizontal: screenW*0.02),
                   child: Text("Date of birth" , style: TextStyle(fontSize: screenW*0.04 ,  color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText , fontWeight: FontWeight.bold),),
                 ),
                 SizedBox(height: screenH*0.01,),
               CustomTextfield(
 controller: authprovider.birthDateController,
 hint: "Select your birth date",
 icon: Icons.calendar_month,
 type: TextFieldType.date,
 readOnly: true,

 onTap: () async {

   final date = await Navigator.push(
     context,
     MaterialPageRoute(
       builder: (_) => BirthDateScreen(
         initialDate: authprovider.birthDate,
       ),
     ),
   );


   if(date != null){

     authprovider.setBirthDate(date);

   }

 },
),
                        SizedBox(height: screenH*0.02,),
          Padding(
                 padding: EdgeInsets.symmetric(horizontal: screenW*0.02),
                   child: Text("Password ", style: TextStyle(fontSize: screenW*0.04 , color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText,  fontWeight: FontWeight.bold),),
                 ),
                 SizedBox(height: screenH*0.01,),
        
                       CustomTextfield(
                controller: authprovider.passwordController,
                hint: "Minimum 6 characters",
                icon: Icons.lock_outline_rounded,
                type: TextFieldType.password,
                validator: (value) {
                  if (value == null || value.isEmpty) return "validation.password_required".tr();
                  if (value.length < 6) return "validation.password_short".tr();
                  return null;
                },
              ),
        
           SizedBox(height: screenH * 0.02),
                  Row( mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(onPressed: () {
              
              
              authprovider.toggleRemember();
                        
                   
                      }, icon: authprovider.rememberMe ? Icon( size: screenW * 0.06,
                        Icons.check_box , color: themeprovider.isDark ? AppColors.darkSecondary :AppColors.lightSecondary,) :Icon(Icons.square_outlined , color: themeprovider.isDark ? AppColors.darkSecondary :AppColors.lightSecondary,) 
                      ),
                      Text("remember_me".tr(),  style: TextStyle( fontSize: screenW * 0.04 , fontWeight: FontWeight.w600 , color: themeprovider.isDark ? AppColors.darkSecondary :AppColors.lightSecondary ),)
                    ],
                  ),
              SizedBox(height: screenH*0.03,),
        
        Center(
          child: authprovider.isLoading ? CircularProgressIndicator(color: AppColors.darkAccent,) :
             ElevatedButton(
                  onPressed: () async {


if(!_formkey.currentState!.validate()) return;



final success =
await context.read<AuthProvider>().register(

  name: authprovider.nameController.text.trim(),

  phone: "0${authprovider.phoneController.text.trim()}",

  birthDate: authprovider.birthDateController.text,

  password: authprovider.passwordController.text.trim(),

);



if(success){


Navigator.push(
 context,
 MaterialPageRoute(
  builder: (_) => OtpScreen(
    phoneNumber: "${authprovider.phoneController.text.trim()}",
  ),
 ),
);


}else{


ScaffoldMessenger.of(context).showSnackBar(

const SnackBar(
 content: Text("Registration failed"),
 backgroundColor: Colors.red,
),

);


}


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
                       "Send verification code",
                       style: TextStyle(
             fontSize: screenW * 0.055,
             color: AppColors.darkBorder,
             fontWeight: FontWeight.w600,
                       ),
                     ),
                   ),
        ),
        
         
                             SizedBox(height: screenH * 0.06),
                    Padding(
                       padding: EdgeInsets.only(bottom: screenH*0.02),
                      child: Row(
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