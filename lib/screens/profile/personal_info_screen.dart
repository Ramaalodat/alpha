import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/providers/personal_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/profile/financial_setup_screen.dart';
import 'package:alpha_app/widgets/option_chip.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';
import 'package:provider/provider.dart';



class PersonalInfoScreen extends StatelessWidget {


 PersonalInfoScreen({super.key});



@override
Widget build(BuildContext context){


final personalProvider =
context.watch<PersonalProvider>();
  final screenW = Device.width(context);
    final screenH = Device.height(context);
    final themeprovider = Provider.of<Themeprovider>(context);


return Scaffold(  backgroundColor:  themeprovider.isDark ? AppColors.darkBackground : AppColors.lightBackground,


body:SafeArea(


child:SingleChildScrollView(


   padding:  EdgeInsets.symmetric(horizontal: screenW* 0.05  ),



child:Column(


crossAxisAlignment:
CrossAxisAlignment.start,


children:[

SizedBox(height:screenH*0.03,),

 Text( 
                               "Step 1 of 2",
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
            "Personal Information",
            style: GoogleFonts.ibmPlexSansArabic(
              fontSize: screenW*0.075,
              fontWeight: FontWeight.bold,
              color: themeprovider.isDark
                  ? AppColors.darkText
                  : AppColors.lightText,
            ),
          ),
        SizedBox(height: screenH*0.02,),
                 Text( 
                             "Accurate data means sharper advice from Alpha",
                             style: GoogleFonts.ibmPlexSansArabic(
                               fontSize: screenW*0.035,
                              fontWeight: FontWeight.w500,
                               color: themeprovider.isDark
                  ? AppColors.darkSubText
                  : AppColors.lightSubText,
                             ),
                           ),

SizedBox(height: screenH*0.02,),
                           LinearPercentIndicator( 
                             lineHeight: screenH*0.02, // سماكة الشريط
                             percent: personalProvider.pageProgress, // النسبة المئوية للتقدم
                             backgroundColor: themeprovider.isDark ? AppColors.darkBorder : AppColors.lightBorder, // لون الخلفية
                             progressColor:  themeprovider.isDark ? AppColors.darkSecondary : AppColors.lightSecondary, // لون الشريط
                             barRadius: Radius.circular(10), 
                             animation: false, 
                             animationDuration: 1000, 
                           ),
                            SizedBox(height: screenH*0.03,),



 Text("Gender", style: TextStyle(fontSize: screenW*0.04 ,  color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText , fontWeight: FontWeight.bold),),

SizedBox(height: screenH*0.01,),

OptionChip(

items:["Female","Male"],

selected:personalProvider.gender,

onTap:personalProvider.setGender,

),




SizedBox(height: screenH*0.02,),



Text("Marital Status" , style: TextStyle(fontSize: screenW*0.04 ,  color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText , fontWeight: FontWeight.bold),),


SizedBox(height: screenH*0.01,),
OptionChip(

items:[

"Single",

"Married",

"Other"

],

selected:personalProvider.maritalStatus,

onTap:personalProvider.setMaritalStatus,

),





SizedBox(height: screenH*0.02,),




 Text(
"Are you head of household?" , style: TextStyle(fontSize: screenW*0.04 ,  color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText , fontWeight: FontWeight.bold),),

SizedBox(height: screenH*0.01,),


OptionChip(

items:["Yes","No"],

selected:

personalProvider.isHeadOfHousehold == null

? null

:

personalProvider.isHeadOfHousehold!

? "Yes"

: "No",


onTap:(value){

personalProvider.setHeadOfHousehold(
value=="Yes"
);

},

),





if(personalProvider.isHeadOfHousehold==false)...[


SizedBox(height: screenH*0.02,),


 Text(
"Do you contribute to family expenses?" , style: TextStyle(fontSize: screenW*0.04 ,  color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText , fontWeight: FontWeight.bold),),

SizedBox(height: screenH*0.01,),


OptionChip(

items:["Yes","No"],


selected:

personalProvider.contributesToExpenses==null

?null

:

personalProvider.contributesToExpenses!

?"Yes"

:"No",


onTap:(value){

personalProvider.setContributes(
value=="Yes"
);

},


),

],





SizedBox(height: screenH*0.02,),




Text(
"Are you university student?" , style: TextStyle(fontSize: screenW*0.04 ,  color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText , fontWeight: FontWeight.bold),),



SizedBox(height: screenH*0.01,),

OptionChip(

items:["Yes","No"],

selected:

personalProvider.isStudent==null

?null

:

personalProvider.isStudent!

?"Yes"

:"No",



onTap:(value){

personalProvider.setStudent(
value=="Yes"
);

},


),




SizedBox(height: screenH*0.02,),




Text(
"Family members:  " , style: TextStyle(fontSize: screenW*0.04 ,  color: themeprovider.isDark ? AppColors.darkSubText:AppColors.lightSubText , fontWeight: FontWeight.bold),),


SizedBox(height: screenH*0.01,),

Row(
  mainAxisAlignment: MainAxisAlignment.start, // توسيط الـ Row
  children: [
   
    _buildCounterButton(
      icon: Icons.remove,
      onTap: personalProvider.decreaseFamily,
      isDark: themeprovider.isDark,
      screenW: screenW,
    ),
    
    
    Padding(
      padding: EdgeInsets.symmetric(horizontal: screenW * 0.05),
      child: Text(
        "${personalProvider.familyMembers}",
        style: TextStyle(
          fontSize: screenW * 0.06,
          color: themeprovider.isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
          fontWeight: FontWeight.bold,
        ),
      ),
    ),
    
  
    _buildCounterButton(
      icon: Icons.add,
      onTap: personalProvider.increaseFamily,
      isDark: themeprovider.isDark,
      screenW: screenW,
    ),
  ],
),




SizedBox(height: screenH*0.03,),



Padding(
            
                    padding: EdgeInsets.only(
                      bottom: screenH * 0.02,
                    ),
            
            
                    child: ElevatedButton(
            
                      onPressed: () {
       
              if(personalProvider.isValid){

    Navigator.push(context, MaterialPageRoute(builder: (context) => FinancialSetupScreen(),));

  }else{

    ScaffoldMessenger.of(context)
        .showSnackBar(

       SnackBar( backgroundColor: themeprovider.isDark ? AppColors.darkError : AppColors.lightError,

        content: Text(
          "Please complete all required fields" ,
          style: TextStyle(
          fontSize: screenW * 0.04,
          fontWeight: FontWeight.w500,
          ),
        ),

        duration:
        Duration(seconds: 2),

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
            
                        "Next",
            
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


);


}



Widget _buildCounterButton({required IconData icon, required VoidCallback onTap, required bool isDark, required double screenW}) {
  return InkWell(
    onTap: onTap,
    borderRadius: BorderRadius.circular(12),
    child: Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkAccent.withOpacity(0.1) : AppColors.lightAccent.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? AppColors.darkAccent : AppColors.lightAccent),
      ),
      child: Icon(
        icon,
        color: isDark ? AppColors.darkAccent : AppColors.lightAccent,
        size: screenW * 0.06,
      ),
    ),
  );
}

}