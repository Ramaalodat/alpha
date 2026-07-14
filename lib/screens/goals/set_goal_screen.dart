import 'package:flutter/material.dart';

class SetGoalScreen extends StatefulWidget {
  const SetGoalScreen({super.key});

  @override
  State<SetGoalScreen> createState() => _SetGoalScreenState();
}

class _SetGoalScreenState extends State<SetGoalScreen> {
  // المتغيرات لإدارة الحالة
  String selectedIcon = "Device";
  final TextEditingController _nameController = TextEditingController(text: "New laptop");
  final TextEditingController _amountController = TextEditingController(text: "1,000.000");

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1414),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("9:41", style: TextStyle(color: Colors.white)), // Status bar mock
              const SizedBox(height: 20),
              const Text("Set your first goal", style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
              const Text("You can add more anytime later", style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 20),
              const LinearProgressIndicator(value: 0.9, backgroundColor: Color(0xFF1C2222), color: Colors.teal),
              
              const SizedBox(height: 30),
              _buildLabel("Choose a goal icon"),
              _buildIconSelector(),

              const SizedBox(height: 25),
              _buildLabel("Goal name"),
              _buildTextField(_nameController, Icons.edit),

              const SizedBox(height: 20),
              _buildLabel("Target amount"),
              _buildTextField(_amountController, null, suffix: "JD"),

              const SizedBox(height: 20),
              _buildLabel("Target date"),
              _buildTextField(TextEditingController(text: "September 2026"), Icons.calendar_today),

              const SizedBox(height: 25),
              // مربع الاقتراح
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: const Color(0xFF1C2222), borderRadius: BorderRadius.circular(15)),
                child: Row(
                  children: [
                    const Icon(Icons.lightbulb, color: Colors.amber),
                    const SizedBox(width: 10),
                    const Expanded(child: Text("Basira suggests\nTo hit this goal on time, save ~65 JD a month", style: TextStyle(color: Colors.white))),
                  ],
                ),
              ),

              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity, height: 60,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.teal, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
                  child: const Text("Finish setup ✓", style: TextStyle(fontSize: 18, color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) => Padding(padding: const EdgeInsets.only(bottom: 8), child: Text(text, style: const TextStyle(color: Colors.grey)));

  Widget _buildTextField(TextEditingController controller, IconData? icon, {String? suffix}) {
    return TextField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        filled: true, fillColor: const Color(0xFF1C2222),
        suffixText: suffix,
        suffixStyle: const TextStyle(color: Colors.grey),
        prefixIcon: icon != null ? Icon(icon, color: Colors.grey, size: 18) : null,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      ),
    );
  }

  Widget _buildIconSelector() {
    List<Map<String, dynamic>> icons = [
      {"name": "Device", "icon": Icons.laptop_mac},
      {"name": "Travel", "icon": Icons.flight},
      {"name": "Car", "icon": Icons.directions_car},
    ];
    return SizedBox(
      height: 90,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: icons.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, i) {
          bool isSelected = selectedIcon == icons[i]["name"];
          return GestureDetector(
            onTap: () => setState(() => selectedIcon = icons[i]["name"]),
            child: Container(
              width: 80,
              decoration: BoxDecoration(
                color: const Color(0xFF1C2222),
                border: Border.all(color: isSelected ? Colors.teal : Colors.transparent, width: 2),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(icons[i]["icon"], color: isSelected ? Colors.teal : Colors.white),
                Text(icons[i]["name"], style: TextStyle(color: isSelected ? Colors.teal : Colors.white, fontSize: 12)),
              ]),
            ),
          );
        },
      ),
    );
  }
}