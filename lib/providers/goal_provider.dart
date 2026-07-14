import 'package:flutter/material.dart';

import '../models/goal_model.dart';



class GoalProvider extends ChangeNotifier {



  final TextEditingController targetDateController =
  TextEditingController();



  String? selectedIcon;



  final TextEditingController nameController =
  TextEditingController();



  final TextEditingController amountController =
  TextEditingController();




  DateTime? targetDate;





  final List<String> icons = [


    "Device",

    "Travel",

    "Car",


  ];







  void setIcon(String value){


    selectedIcon = value;


    notifyListeners();


  }









  void setTargetDate(DateTime date){


    targetDate = date;



    targetDateController.text =

        "${date.day}/${date.month}/${date.year}";



    notifyListeners();


  }









  void setName(String value){


    nameController.text = value;


    notifyListeners();


  }









  void setAmount(String value){


    amountController.text = value;


    notifyListeners();


  }









  double get targetAmount{


    return double.tryParse(

        amountController.text.replaceAll(",", "")

    ) ?? 0;


  }









  double get monthlySuggestion{



    if(targetDate == null ||

        targetAmount <= 0){


      return 0;


    }






    final now = DateTime.now();




    final months =

        (targetDate!.year - now.year) * 12 +

            (targetDate!.month - now.month);





    if(months <= 0){


      return targetAmount;


    }





    return targetAmount / months;


  }









  bool get isValid{


    return

        selectedIcon != null &&

        nameController.text.trim().isNotEmpty &&

        targetAmount > 0 &&

        targetDate != null;


  }









  double get pageProgress {



    const double startProgress = 2 / 3;


    const int totalFields = 4;



    int completedFields = 0;





    // 1 - Icon

    if(selectedIcon != null){

      completedFields++;

    }






    // 2 - Name

    if(nameController.text.trim().isNotEmpty){

      completedFields++;

    }






    // 3 - Amount

    if(targetAmount > 0){

      completedFields++;

    }







    // 4 - Date

    if(targetDate != null){

      completedFields++;

    }







    return startProgress +

        (completedFields / totalFields) *

            (1 / 3);



  }









  Goal get goal{


    return Goal(



      icon:

      selectedIcon ?? "",



      name:

      nameController.text.trim(),



      amount:

      targetAmount,



      targetDate:

      targetDate,



    );


  }









  Map<String,dynamic> get data =>

      goal.toJson();









  @override
  void dispose(){


    targetDateController.dispose();


    nameController.dispose();


    amountController.dispose();



    super.dispose();


  }



}