class Goal {

  final String category;

  final String? customName;

  final double monthlySaving;

  final int priority;

  final DateTime? targetDate;

  Goal({

    required this.category,

    this.customName,

    required this.monthlySaving,

    required this.priority,

    this.targetDate,

  });

  Map<String, dynamic> toJson() {

    return {

      "category": category,

      "custom_name": customName,

      "monthly_saving": monthlySaving,

      "priority": priority,

      "target_date": targetDate?.toIso8601String(),

    };

  }

}