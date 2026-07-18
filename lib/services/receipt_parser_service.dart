import 'package:alpha_app/models/parsed_receipt_model.dart';

class ReceiptParserService {
  Future<ParsedReceiptModel> parseText({
    required String text,
    required ReceiptInputType inputType,
  }) async {
    await Future.delayed(
      const Duration(seconds: 1),
    );

    if (text.trim().isEmpty) {
      throw Exception(
        'No readable receipt information was found',
      );
    }

    // بيانات مؤقتة إلى أن يتم ربط AI أو Backend.
    return ParsedReceiptModel(
      storeName: inputType == ReceiptInputType.voice
          ? 'Voice Expense'
          : 'National Supermarket',
      date: DateTime.now(),
      suggestedCategory: 'Shopping',
      confidence:
          inputType == ReceiptInputType.image
              ? 0.97
              : 0.92,
      inputType: inputType,
      extractedText: text,
      items: const [
        ReceiptItemModel(
          id: 'item_1',
          name: 'Fruits & vegetables',
          category: 'Groceries',
          amount: 8.200,
        ),
        ReceiptItemModel(
          id: 'item_2',
          name: 'Dairy products',
          category: 'Groceries',
          amount: 5.750,
        ),
        ReceiptItemModel(
          id: 'item_3',
          name: 'Other',
          category: 'Shopping',
          amount: 4.550,
        ),
      ],
      total: 18.500,
    );
  }
}