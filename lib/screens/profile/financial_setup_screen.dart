
import 'package:alpha_app/providers/financial_setup_provider.dart';
import 'package:alpha_app/widgets/multi_select_chip.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';



class FinancialSetupScreen extends StatelessWidget {


  const FinancialSetupScreen({super.key});



  @override
  Widget build(BuildContext context) {


    final provider =
    context.watch<FinancialProvider>();



    return Scaffold(


      body: SafeArea(


        child: SingleChildScrollView(


          padding:
          const EdgeInsets.all(20),



          child: Column(


            crossAxisAlignment:
            CrossAxisAlignment.start,



            children: [




              const Text(

                "STEP 2 OF 2",

                style:

                TextStyle(

                  color: Colors.teal,

                  fontWeight: FontWeight.bold,

                ),

              ),




              const SizedBox(height:10),




              const Text(

                "Financial Setup",

                style:

                TextStyle(

                  fontSize:26,

                  fontWeight:FontWeight.bold,

                ),

              ),





              const SizedBox(height:30),






              // ================= GENERAL =================




              const Text(

                "How do you describe your relationship with money?",

                style:

                TextStyle(

                  fontWeight:FontWeight.w600,

                ),

              ),



              const SizedBox(height:12),




              MultiSelectChip(

                items:const [

                  "Careful spending",

                  "Balanced spending",

                  "Emotional spending",

                ],


                selectedItems:

                provider.moneyRelationship == null

                    ?

                []

                    :

                [

                  provider.moneyRelationship!

                ],



                onTap:(value){

                  provider.setMoneyRelationship(value);

                },


              ),






              const SizedBox(height:25),






              const Text(

                "Extra monthly saving target",

                style:

                TextStyle(

                  fontWeight:FontWeight.w600,

                ),

              ),




              const SizedBox(height:10),




              TextField(


                keyboardType:

                TextInputType.number,



                onChanged:

                provider.setSavingTarget,



                decoration:

                InputDecoration(


                  hintText:
                  "Enter amount",



                  suffixText:
                  "JOD",



                  filled:true,


                  border:

                  OutlineInputBorder(


                    borderRadius:

                    BorderRadius.circular(12),


                  ),


                ),



              ),






              const SizedBox(height:25),






              const Text(

                "Main goal",

                style:

                TextStyle(

                  fontWeight:FontWeight.w600,

                ),

              ),




              const SizedBox(height:12),




              MultiSelectChip(

                items:const [

                  "Saving",

                  "Debt payment",

                  "Daily budget",

                  "Other",

                ],


                selectedItems:

                provider.mainGoal == null

                    ?

                []

                    :

                [

                  provider.mainGoal!

                ],



                onTap:(value){

                  provider.setMainGoal(value);

                },


              ),







              const SizedBox(height:30),






              const Text(

                "Average household income",

                style:

                TextStyle(

                  fontWeight:FontWeight.w600,

                ),

              ),





              const SizedBox(height:10),





              TextField(



                keyboardType:

                TextInputType.number,



                onChanged:

                provider.setHouseholdIncome,



                decoration:

                InputDecoration(


                  hintText:

                  "Enter income",



                  suffixText:

                  "JOD",



                  border:

                  OutlineInputBorder(

                    borderRadius:

                    BorderRadius.circular(12),

                  ),

                ),


              ),






              const SizedBox(height:35),







              // ================= INCOME =================






              const Text(

                "Income Sources",

                style:

                TextStyle(

                  fontSize:18,

                  fontWeight:FontWeight.bold,

                ),

              ),





              const SizedBox(height:12),





              MultiSelectChip(



                items:

                provider.incomeSources

                    .map((e)=>e.name)

                    .toList(),




                selectedItems:

                provider.incomeSources

                    .where((e)=>e.selected)

                    .map((e)=>e.name)

                    .toList(),




                onTap:(value){


                  final item =

                  provider.incomeSources

                      .firstWhere(

                          (e)=>e.name==value

                  );


                  provider.toggleIncome(item);



                },


              ),







              const SizedBox(height:15),





              ...provider.incomeSources

                  .where((e)=>e.selected)

                  .map((income){


                return Padding(

                  padding:

                  const EdgeInsets.only(

                    bottom:12,

                  ),


                  child:TextField(



                    keyboardType:

                    TextInputType.number,



                    onChanged:(value){


                      provider.updateIncomeAmount(

                        income,

                        value,

                      );


                    },



                    decoration:

                    InputDecoration(


                      labelText:

                      income.name,



                      suffixText:

                      "JOD",



                      border:

                      OutlineInputBorder(


                        borderRadius:

                        BorderRadius.circular(12),

                      ),

                    ),


                  ),


                );


              }),





              Text(

                "Total Income: ${provider.totalIncome.toStringAsFixed(2)} JOD",

                style:

                const TextStyle(

                  fontWeight:FontWeight.bold,

                ),

              ),







              const SizedBox(height:35),








              // ================= FIXED =================






              const Text(

                "Fixed Expenses",

                style:

                TextStyle(

                  fontSize:18,

                  fontWeight:FontWeight.bold,

                ),

              ),




              const SizedBox(height:12),




              MultiSelectChip(


                items:

                provider.fixedExpenses

                    .map((e)=>e.name)

                    .toList(),



                selectedItems:

                provider.fixedExpenses

                    .where((e)=>e.selected)

                    .map((e)=>e.name)

                    .toList(),




                onTap:(value){


                  final item =

                  provider.fixedExpenses

                      .firstWhere(

                          (e)=>e.name==value

                  );



                  provider.toggleExpense(item);


                },


              ),





              const SizedBox(height:15),




              ...provider.fixedExpenses

                  .where((e)=>e.selected)

                  .map((expense){


                return _amountField(

                    expense.name,

                    (value){

                      provider.updateExpenseAmount(

                          expense,

                          value

                      );


                    }

                );


              }),







              const SizedBox(height:35),







              // ================= FLEXIBLE =================





              const Text(

                "Flexible Expenses",

                style:

                TextStyle(

                  fontSize:18,

                  fontWeight:FontWeight.bold,

                ),

              ),






              const SizedBox(height:12),





              MultiSelectChip(


                items:

                provider.flexibleExpenses

                    .map((e)=>e.name)

                    .toList(),




                selectedItems:

                provider.flexibleExpenses

                    .where((e)=>e.selected)

                    .map((e)=>e.name)

                    .toList(),



                onTap:(value){


                  final item =

                  provider.flexibleExpenses

                      .firstWhere(

                          (e)=>e.name==value

                  );



                  provider.toggleExpense(item);


                },


              ),






              const SizedBox(height:15),





              ...provider.flexibleExpenses

                  .where((e)=>e.selected)

                  .map((expense){


                return _amountField(

                    expense.name,

                    (value){


                      provider.updateExpenseAmount(

                          expense,

                          value

                      );


                    }

                );


              }),








              const SizedBox(height:30),






              // ================= BALANCE =================






              Container(



                padding:

                const EdgeInsets.all(15),



                decoration:

                BoxDecoration(


                  color:

                  provider.balance >=0

                      ?

                  Colors.green.withOpacity(.15)

                      :

                  Colors.red.withOpacity(.15),




                  borderRadius:

                  BorderRadius.circular(12),


                ),




                child:

                Text(



                  provider.balance >=0

                      ?

                  "Surplus: ${provider.balance.toStringAsFixed(2)} JOD"

                      :

                  "Deficit: ${provider.balance.abs().toStringAsFixed(2)} JOD",




                  style:

                  TextStyle(


                    color:

                    provider.balance>=0

                        ?

                    Colors.green

                        :

                    Colors.red,


                    fontWeight:

                    FontWeight.bold,

                  ),



                ),


              ),







              const SizedBox(height:30),







              SizedBox(

                width:

                double.infinity,

                height:

                55,



                child:

                ElevatedButton(



                  onPressed:

                  provider.isBalanced

                      ?

                      (){


                    debugPrint(

                        provider.data.toString()

                    );


                  }

                      :

                  null,




                  child:

                  const Text(

                    "Save and Continue",

                  ),



                ),

              )





            ],


          ),


        ),


      ),


    );


  }






  Widget _amountField(

      String label,

      Function(String) onChanged,

      ){



    return Padding(

      padding:

      const EdgeInsets.only(

          bottom:12

      ),



      child:TextField(



        keyboardType:

        TextInputType.number,



        onChanged:onChanged,



        decoration:

        InputDecoration(



          labelText:

          label,



          suffixText:

          "JOD",



          border:

          OutlineInputBorder(



            borderRadius:

            BorderRadius.circular(12),



          ),


        ),



      ),


    );


  }



}