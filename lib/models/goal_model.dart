class Goal {


  String icon;

  String name;

  double amount;

  DateTime? targetDate;



  Goal({

    required this.icon,

    required this.name,

    required this.amount,

    this.targetDate,

  });





  Map<String,dynamic> toJson(){


    return {


      "icon":
      icon,


      "name":
      name,


      "amount":
      amount,


      "target_date":
      targetDate?.toIso8601String(),


    };


  }





}