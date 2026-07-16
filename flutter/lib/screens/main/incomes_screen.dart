import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/screens/main/add_income_screen.dart';
import 'package:alpha_app/services/finance_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class IncomesScreen extends StatefulWidget {
  const IncomesScreen({super.key});

  @override
  State<IncomesScreen> createState() => _IncomesScreenState();
}

class _IncomesScreenState extends State<IncomesScreen> {
  late Future<List<dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = FinanceService.loadIncomes();
  }

  Future<void> _deleteItem(Map<String, dynamic> item) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Income?'),
        content: const Text('Are you sure you want to delete this income?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    
    if (confirm == true) {
      try {
        await FinanceService.deleteIncome(item['id']);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Income deleted successfully')),
          );
          setState(() {
            _future = FinanceService.loadIncomes();
          });
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<Themeprovider>(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Incomes')),
      backgroundColor:
          theme.isDark ? AppColors.darkBackground : AppColors.lightBackground,
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(context,
              MaterialPageRoute(builder: (_) => const AddIncomeScreen()));
          if (result == true) {
            setState(() {
              _future = FinanceService.loadIncomes();
            });
          }
        },
        backgroundColor:
            theme.isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
                child: Text(snapshot.error.toString(),
                    style: TextStyle(
                        color: theme.isDark
                            ? AppColors.darkText
                            : AppColors.lightText)));
          }
          final items = snapshot.data ?? [];
          if (items.isEmpty) {
            return Center(
                child: Text('No incomes yet',
                    style: TextStyle(
                        color: theme.isDark
                            ? AppColors.darkText
                            : AppColors.lightText)));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final item = items[index] as Map<String, dynamic>;
              return Card(
                child: ListTile(
                  title: Text(item['source'] ?? 'Income'),
                  subtitle: Text(item['description'] ?? 'Source'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('${item['amount'] ?? 0}'),
                      IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () => _deleteItem(item),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
