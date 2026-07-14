class ExpenseItem {


  String name;

  bool selected;

  double amount;

  String frequency;



  ExpenseItem({

    required this.name,

    this.selected=false,

    this.amount=0,

    this.frequency="Monthly",

  });



  Map<String,dynamic> toJson(){


    return {

      "name":name,

      "amount":amount,

      "frequency":frequency,

    };


  }

}