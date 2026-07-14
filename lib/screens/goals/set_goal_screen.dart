import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/providers/goal_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/widgets/custom_textfield.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';
import 'package:provider/provider.dart';



class SetGoalScreen extends StatelessWidget {


  const SetGoalScreen({
    super.key,
  });




  @override
  Widget build(BuildContext context) {



    final screenW =
    Device.width(context);


    final screenH =
    Device.height(context);



    final themeProvider =
    Provider.of<Themeprovider>(context);



    final goalProvider =
    context.watch<GoalProvider>();





    return Scaffold(


      backgroundColor:

      themeProvider.isDark

          ?

      AppColors.darkBackground

          :

      AppColors.lightBackground,





      body:

      SafeArea(


        child:

        SingleChildScrollView(


          padding:

          EdgeInsets.symmetric(

            horizontal:

            screenW * 0.05,

          ),




          child:

          Column(


            crossAxisAlignment:

            CrossAxisAlignment.start,



            children: [




              SizedBox(

                height:

                screenH * 0.03,

              ),




              Text(

                "Step 3 of 3",

                style:

                GoogleFonts.ibmPlexSansArabic(

                  fontSize:

                  screenW * 0.04,


                  fontWeight:

                  FontWeight.w500,


                  color:

                  themeProvider.isDark

                      ?

                  AppColors.darkAccent

                      :

                  AppColors.lightAccent,

                ),

              ),





              SizedBox(

                height:

                screenH * 0.02,

              ),





              Text(

                "Set your first goal",

                style:

                GoogleFonts.ibmPlexSansArabic(

                  fontSize:

                  screenW * 0.075,


                  fontWeight:

                  FontWeight.bold,


                  color:

                  themeProvider.isDark

                      ?

                  AppColors.darkText

                      :

                  AppColors.lightText,

                ),

              ),





              SizedBox(

                height:

                screenH * 0.01,

              ),





              Text(

                "You can add more anytime later",

                style:

                TextStyle(

                  fontSize:

                  screenW * 0.035,


                  color:

                  themeProvider.isDark

                      ?

                  AppColors.darkSubText

                      :

                  AppColors.lightSubText,

                ),

              ),




SizedBox(height: screenH*0.02,),
                           LinearPercentIndicator( 
                             lineHeight: screenH*0.02, // سماكة الشريط
                             percent: goalProvider.pageProgress, // النسبة المئوية للتقدم
                             backgroundColor: themeProvider.isDark ? AppColors.darkBorder : AppColors.lightBorder, // لون الخلفية
                             progressColor:  themeProvider.isDark ? AppColors.darkSecondary : AppColors.lightSecondary, // لون الشريط
                             barRadius: Radius.circular(10), 
                             animation: false, 
                             animationDuration: 1000, 
                           ),
                            SizedBox(height: screenH*0.03,),




              SizedBox(

                height:

                screenH * 0.03,

              ),






              Text(

                "Choose a goal icon",

                style:

                TextStyle(

                  fontWeight:

                  FontWeight.bold,


                  color:

                  themeProvider.isDark

                      ?

                  AppColors.darkSubText

                      :

                  AppColors.lightSubText,

                ),

              ),





              SizedBox(

                height:

                screenH * 0.015,

              ),





              SizedBox(


                height:

                90,



                child:

                ListView.builder(



                  scrollDirection:

                  Axis.horizontal,



                  itemCount:

                  goalProvider.icons.length,



                  itemBuilder:

                  (context,index){



                    final iconName =

                    goalProvider.icons[index];



                    final selected =

                    goalProvider.selectedIcon

                        == iconName;





                    return GestureDetector(



                      onTap:(){



                        goalProvider

                            .setIcon(iconName);



                      },




                      child:

                      Container(



                        width:

                        90,



                        margin:

                        const EdgeInsets.only(

                            right:10

                        ),



                        decoration:

                        BoxDecoration(



                          borderRadius:

                          BorderRadius.circular(15),




                          border:

                          Border.all(


                            color:

                            selected

                                ?

                            AppColors.lightPrimary

                                :

                            Colors.transparent,


                            width:

                            2,

                          ),




                          color:

                          themeProvider.isDark

                              ?

                          AppColors.darkBorder

                              :

                          AppColors.lightBackground,


                        ),



                        child:

                        Center(

                          child:

                          Text(

                            iconName,

                          ),

                        ),



                      ),



                    );


                  },


                ),


              ),





              SizedBox(

                height:

                screenH * 0.03,

              ),






              Text(

                "Goal name",

                style:

                TextStyle(

                  fontWeight:

                  FontWeight.w600,


                  color:

                  themeProvider.isDark

                      ?

                  AppColors.darkSubText

                      :

                  AppColors.lightSubText,

                ),

              ),






              SizedBox(

                height:

                screenH * 0.01,

              ),





              CustomTextfield(



                controller:

                goalProvider.nameController,



                hint:

                "Enter goal name",



                type:

                TextFieldType.name,


              ),






              SizedBox(

                height:

                screenH * 0.02,

              ),






              Text(

                "Target amount",

                style:

                TextStyle(

                  fontWeight:

                  FontWeight.w600,


                  color:

                  themeProvider.isDark

                      ?

                  AppColors.darkSubText

                      :

                  AppColors.lightSubText,

                ),

              ),





              SizedBox(

                height:

                screenH * 0.01,

              ),






              CustomTextfield(



                controller:

                goalProvider.amountController,



                hint:

                "Enter amount",



                type:

                TextFieldType.number,



                suffix:

                const Padding(

                  padding:

                  EdgeInsets.all(12),


                  child:

                  Text("JOD"),

                ),


              ),

                            SizedBox(

                height:

                screenH * 0.03,

              ),






              Text(

                "Target date",

                style:

                TextStyle(

                  fontWeight:

                  FontWeight.w600,


                  color:

                  themeProvider.isDark

                      ?

                  AppColors.darkSubText

                      :

                  AppColors.lightSubText,

                ),

              ),





              SizedBox(

                height:

                screenH * 0.01,

              ),







              CustomTextfield(



                controller:

                goalProvider.targetDateController,



                hint:

                "Select target date",



                type:

                TextFieldType.date,



                readOnly:

                true,



                suffix:

                const Icon(

                    Icons.calendar_today

                ),



                onTap:

                    () async {



                  final date =

                  await showDatePicker(



                    context:

                    context,



                    initialDate:

                    DateTime.now(),



                    firstDate:

                    DateTime.now(),



                    lastDate:

                    DateTime(2100),



                  );




                  if(date != null){



                    goalProvider

                        .setTargetDate(date);



                  }



                },


              ),







              SizedBox(

                height:

                screenH * 0.03,

              ),







              Container(



                width:

                double.infinity,



                padding:

                const EdgeInsets.all(16),




                decoration:

                BoxDecoration(



                  color:

                  themeProvider.isDark

                      ?

                  AppColors.darkBorder

                      :

                  AppColors.lightBorder,



                  borderRadius:

                  BorderRadius.circular(15),



                ),




                child:

                Row(



                  children: [



                    const Icon(

                      Icons.lightbulb,

                      color:

                      Colors.amber,

                    ),





                    const SizedBox(

                      width:

                      12,

                    ),





                    Expanded(



                      child:

                      Text(



                        goalProvider.monthlySuggestion > 0

                            ?

                        "Basira suggests\n"
                            "To reach this goal on time, save about "
                            "${goalProvider.monthlySuggestion.toStringAsFixed(0)} JD monthly"

                            :

                        "Basira will calculate your monthly saving suggestion",





                        style:

                        TextStyle(



                          fontSize:

                          screenW * 0.035,



                          color:

                          themeProvider.isDark

                              ?

                          AppColors.darkText

                              :

                          AppColors.lightText,

                        ),



                      ),



                    ),



                  ],



                ),



              ),







              SizedBox(

                height:

                screenH * 0.04,

              ),







              SizedBox(



                width:

                double.infinity,



                height:

                screenH * 0.065,





                child:

                ElevatedButton(



                  onPressed:

                  goalProvider.isValid

                      ? (){



                    debugPrint(

                        goalProvider.data.toString()

                    );




                    ScaffoldMessenger.of(context)

                        .showSnackBar(



                      const SnackBar(

                        content:

                        Text(

                            "Goal saved successfully"

                        ),

                      ),



                    );



                  }



                      : (){



                    ScaffoldMessenger.of(context)

                        .showSnackBar(



                      const SnackBar(

                        content:

                        Text(

                            "Please complete goal information"

                        ),

                      ),



                    );



                  },






                  style:

                  ButtonStyle(



                    backgroundColor:

                    WidgetStatePropertyAll(



                      themeProvider.isDark

                          ?

                      AppColors.darkPrimary

                          :

                      AppColors.lightPrimary,



                    ),




                    shape:

                    WidgetStatePropertyAll(



                      RoundedRectangleBorder(



                        borderRadius:

                        BorderRadius.circular(12),



                      ),



                    ),



                  ),





                  child:

                  const Text(



                    "Finish setup ✓",



                    style:

                    TextStyle(



                      fontSize:

                      18,


                      fontWeight:

                      FontWeight.w600,


                    ),



                  ),



                ),



              ),








              SizedBox(

                height:

                screenH * 0.03,

              ),





            ],



          ),



        ),



      ),



    );



  }


}