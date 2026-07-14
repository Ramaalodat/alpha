import 'package:flutter/material.dart';

import '../models/income_source.dart';
import '../models/expense_item.dart';


class FinancialProvider extends ChangeNotifier {


  String? moneyRelationship;


  double savingTarget = 0;


  String? mainGoal;


  double householdIncome = 0;



  List<IncomeSource> incomeSources = [

    IncomeSource(
      name: "Regular Salary",
    ),

    IncomeSource(
      name: "Temporary Job",
    ),

    IncomeSource(
      name: "Family Support",
    ),

    IncomeSource(
      name: "External Support",
    ),

    IncomeSource(
      name: "Rent Income",
    ),

    IncomeSource(
      name: "Other",
    ),

  ];




  List<ExpenseItem> fixedExpenses = [

    ExpenseItem(
      name: "Education",
    ),

    ExpenseItem(
      name: "House Rent",
    ),

    ExpenseItem(
      name: "Loan",
    ),

    ExpenseItem(
      name: "Bills",
    ),

    ExpenseItem(
      name: "Treatment",
    ),

    ExpenseItem(
      name: "Saving",
    ),

    ExpenseItem(
      name: "Other",
    ),

  ];





  List<ExpenseItem> flexibleExpenses = [

    ExpenseItem(
      name: "Food",
    ),

    ExpenseItem(
      name: "Transport",
    ),

    ExpenseItem(
      name: "Clothes",
    ),

    ExpenseItem(
      name: "Entertainment",
    ),

    ExpenseItem(
      name: "Personal Care",
    ),

    ExpenseItem(
      name: "Other",
    ),

  ];





  void setMoneyRelationship(String value){

    moneyRelationship = value;

    notifyListeners();

  }




  void setSavingTarget(String value){

    savingTarget =
        double.tryParse(value) ?? 0;


    notifyListeners();

  }




  void setMainGoal(String value){

    mainGoal = value;

    notifyListeners();

  }




  void setHouseholdIncome(String value){

    householdIncome =
        double.tryParse(value) ?? 0;


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
        double.tryParse(value) ?? 0;


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
        double.tryParse(value) ?? 0;


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


    return totalIncome -

        (totalExpenses + savingTarget);


  }








  bool get isBalanced{


    return balance.abs() < 0.01;


  }








  Map<String,dynamic> get data{


    return {


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


  }



}