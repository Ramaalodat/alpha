class IncomeSource {

  String name;

  bool selected;

  double amount;

  String frequency;

  DateTime? collectionDate;

  String type;



  IncomeSource({

    required this.name,

    this.selected = false,

    this.amount = 0,

    this.frequency = "Monthly",

    this.collectionDate,

    this.type = "Permanent",

  });



  Map<String,dynamic> toJson(){

    return {

      "name": name,

      "amount": amount,

      "frequency": frequency,

      "collection_date":
      collectionDate?.toIso8601String(),

      "type": type,

    };

  }

}