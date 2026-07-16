import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/services/finance_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late Future<List<dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = FinanceService.loadNotifications();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<Themeprovider>(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      backgroundColor: theme.isDark ? AppColors.darkBackground : AppColors.lightBackground,
      body: FutureBuilder<List<dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text(snapshot.error.toString(), style: TextStyle(color: theme.isDark ? AppColors.darkText : AppColors.lightText)));
          }
          final items = snapshot.data ?? [];
          if (items.isEmpty) {
            return Center(child: Text('No notifications', style: TextStyle(color: theme.isDark ? AppColors.darkText : AppColors.lightText)));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final item = items[index] as Map<String, dynamic>;
              return Card(
                child: ListTile(
                  title: Text(item['title'] ?? 'Notification'),
                  subtitle: Text(item['message'] ?? ''),
                  trailing: item['isRead'] == true ? const Icon(Icons.done) : const Icon(Icons.circle_outlined),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
