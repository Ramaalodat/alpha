import 'package:flutter/material.dart';

import '../models/income_source.dart';
import '../models/expense_item.dart';



class FinancialProvider extends ChangeNotifier {



  String? moneyRelationship;


  double? savingTarget;


  String? mainGoal;


  double? householdIncome;





  final savingTargetController =
  TextEditingController();



  final householdIncomeController =
  TextEditingController();







  List<IncomeSource> incomeSources = [


    IncomeSource(name: "Regular Salary"),


    IncomeSource(name: "Temporary Job"),


    IncomeSource(name: "Family Support"),


    IncomeSource(name: "External Support"),


    IncomeSource(name: "Rent Income"),


    IncomeSource(name: "Other"),


  ];








  List<ExpenseItem> fixedExpenses = [


    ExpenseItem(name: "Education"),


    ExpenseItem(name: "House Rent"),


    ExpenseItem(name: "Loan"),


    ExpenseItem(name: "Bills"),


    ExpenseItem(name: "Treatment"),


    ExpenseItem(name: "Saving"),


    ExpenseItem(name: "Other"),


  ];








  List<ExpenseItem> flexibleExpenses = [


    ExpenseItem(name: "Food"),


    ExpenseItem(name: "Transport"),


    ExpenseItem(name: "Clothes"),


    ExpenseItem(name: "Entertainment"),


    ExpenseItem(name: "Personal Care"),


    ExpenseItem(name: "Other"),


  ];









  void setMoneyRelationship(String value){


    moneyRelationship=value;


    notifyListeners();


  }








  void setSavingTarget(String value){


    savingTarget =
        double.tryParse(
            value.replaceAll(",", ".")
        );



    notifyListeners();


  }








  void setMainGoal(String value){


    mainGoal=value;


    notifyListeners();


  }








  void setHouseholdIncome(String value){


    householdIncome =
        double.tryParse(
            value.replaceAll(",", ".")
        );



    notifyListeners();


  }









  void toggleIncome(IncomeSource item){


    item.selected =
    !item.selected;


    notifyListeners();


  }









  void updateIncomeAmount(
      IncomeSource item,
      String value
      ){



    item.amount =
        double.tryParse(
            value.replaceAll(",", ".")
        ) ?? 0;



    notifyListeners();


  }









  void toggleExpense(ExpenseItem item){


    item.selected =
    !item.selected;


    notifyListeners();


  }









  void updateExpenseAmount(
      ExpenseItem item,
      String value
      ){


    item.amount =
        double.tryParse(
            value.replaceAll(",", ".")
        ) ?? 0;



    notifyListeners();


  }









  double get totalIncome{


    return incomeSources

        .where((e)=>e.selected)

        .fold(
        0.0,
            (sum,item)=>
        sum + item.amount
    );


  }









  double get totalExpenses{


    final fixed = fixedExpenses

        .where((e)=>e.selected)

        .fold(
        0.0,
            (sum,item)=>
        sum + item.amount
    );



    final flexible = flexibleExpenses

        .where((e)=>e.selected)

        .fold(
        0.0,
            (sum,item)=>
        sum + item.amount
    );



    return fixed + flexible;


  }









  double get balance{


    return (householdIncome ?? 0)

        -

        (totalExpenses +

            (savingTarget ?? 0));


  }









  bool get isBalanced{


    return balance.abs() < 0.01;


  }









  double get pageProgress{


    const int totalQuestions = 7;


    int completed = 0;





    if(moneyRelationship != null){

      completed++;

    }




    if(savingTarget != null){

      completed++;

    }





    if(mainGoal != null){

      completed++;

    }





    if(householdIncome != null){

      completed++;

    }






    final selectedIncome =

    incomeSources
        .where((e)=>e.selected)
        .toList();




    if(selectedIncome.isNotEmpty &&

        selectedIncome.every(
                (e)=>e.amount > 0
        )){


      completed++;


    }







    final selectedFixed =

    fixedExpenses
        .where((e)=>e.selected)
        .toList();




    if(selectedFixed.isNotEmpty &&

        selectedFixed.every(
                (e)=>e.amount > 0
        )){


      completed++;


    }







    final selectedFlexible =

    flexibleExpenses
        .where((e)=>e.selected)
        .toList();




    if(selectedFlexible.isNotEmpty &&

        selectedFlexible.every(
                (e)=>e.amount > 0
        )){


      completed++;


    }







    return  (1 / 3) +

        ((completed / totalQuestions) *  (1 / 3));


  }









  bool get isValid {

  final hasIncomeSource =
      incomeSources.any((e) => e.selected && e.amount > 0);


  return
      moneyRelationship != null &&
      savingTarget != null &&
      mainGoal != null &&
      householdIncome != null &&
      hasIncomeSource;

}








  bool get canSave => isValid;









  Map<String,dynamic> get data=>{


    "money_relationship":

    moneyRelationship,



    "saving_target":

    savingTarget,



    "main_goal":

    mainGoal,



    "household_income":

    householdIncome,



    "income_sources":

    incomeSources

        .where((e)=>e.selected)

        .map((e)=>e.toJson())

        .toList(),



    "fixed_expenses":

    fixedExpenses

        .where((e)=>e.selected)

        .map((e)=>e.toJson())

        .toList(),



    "flexible_expenses":

    flexibleExpenses

        .where((e)=>e.selected)

        .map((e)=>e.toJson())

        .toList(),


  };









  @override
  void dispose(){


    savingTargetController.dispose();


    householdIncomeController.dispose();



    for(var item in incomeSources){

      item.controller.dispose();

    }



    for(var item in fixedExpenses){

      item.controller.dispose();

    }



    for(var item in flexibleExpenses){

      item.controller.dispose();

    }




    super.dispose();


  }



}