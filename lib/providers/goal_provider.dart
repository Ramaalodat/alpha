import 'package:flutter/material.dart';

import '../models/goal_model.dart';



class GoalProvider extends ChangeNotifier {



  // ================= CONTROLLERS =================



  final TextEditingController customNameController =
      TextEditingController();



  final TextEditingController amountController =
      TextEditingController();



  final TextEditingController targetDateController =
      TextEditingController();






  // ================= GOAL DATA =================




  String? selectedCategory;



  DateTime? targetDate;



  int priority = 5;



  double emergencyPercentage = 10;





  final List<String> goalCategories = [


    "Emergency Fund",

    "Laptop",

    "Travel",

    "Car",

    "Education",

    "House",

    "Business",

    "Furniture",

    "Other",


  ];







  // ================= CATEGORY =================




  void setCategory(String value){


    selectedCategory = value;



    notifyListeners();


  }








  // ================= PRIORITY =================





  void setPriority(int value){


    priority = value;



    notifyListeners();


  }








  // ================= EMERGENCY =================





  void setEmergencyPercentage(double value){


    emergencyPercentage = value;



    notifyListeners();


  }








  // ================= DATE =================






  void setDate(DateTime date){



    targetDate = date;



    targetDateController.text =

        "${date.day}/${date.month}/${date.year}";



    notifyListeners();


  }









  // ================= AMOUNT =================






  double get monthlySaving{



    return double.tryParse(



      amountController.text

          .replaceAll(",", "")



    ) ?? 0;



  }









  // ================= VALIDATION =================





  bool get isValid{


    final nameValid =


    selectedCategory == "Other"

        ? customNameController.text.trim().isNotEmpty

        : selectedCategory != null;



    return

        nameValid &&

        monthlySaving > 0 &&

        targetDate != null;



  }









  // ================= PROGRESS =================





  double get pageProgress{


    const totalSteps = 4;



    int completed = 0;



    // اختيار الهدف

    if(selectedCategory != null){

      completed++;

    }



    // الاسم

    if(selectedCategory == "Other"){


      if(customNameController.text.trim().isNotEmpty){

        completed++;

      }


    }

    else if(selectedCategory != null){

      completed++;

    }







    // المبلغ


    if(monthlySaving > 0){

      completed++;

    }






    // التاريخ


    if(targetDate != null){

      completed++;

    }






    return  (2 / 3) +

        ((completed / totalSteps) *  (1 / 3));


  }









  // ================= MODEL =================





  Goal get goal{



    return Goal(



      category:

      selectedCategory ?? "",



      customName:

      selectedCategory == "Other"

          ?

      customNameController.text.trim()

          :

      null,



      monthlySaving:

      monthlySaving,



      priority:

      priority,



      targetDate:

      targetDate,



    );



  }




void refresh(){

    notifyListeners();

  }




  Map<String,dynamic> get data =>

      goal.toJson();









  @override
  void dispose(){



    customNameController.dispose();



    amountController.dispose();



    targetDateController.dispose();



    super.dispose();



  }



}