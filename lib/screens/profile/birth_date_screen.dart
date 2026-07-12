import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';

class BirthDateScreen extends StatefulWidget {
  @override
  _BirthDateScreenState createState() => _BirthDateScreenState();
}

class _BirthDateScreenState extends State<BirthDateScreen> {
  DateTime _focusedDay = DateTime(2008, 5, 12);
  DateTime? _selectedDay = DateTime(2008, 5, 12);
  int _selectedYear = 2008;

  @override
  Widget build(BuildContext context) {
    final screenW = Device.width(context);
    final screenH = Device.height(context);
    final themeprovider = Provider.of<Themeprovider>(context);
    return SafeArea(
      child: Scaffold(
       backgroundColor:  themeprovider.isDark ? AppColors.darkBackground : AppColors.lightBackground,
        body: Padding(
           padding:  EdgeInsets.symmetric(horizontal: screenW* 0.05  ),
          child: Column(
            children: [
             
              Padding(
                padding: EdgeInsets.only(top:  screenH*0.05),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                     Text(
                            "Date of Birth",
                            style: GoogleFonts.ibmPlexSansArabic(
                fontSize: screenW*0.08,
                fontWeight: FontWeight.bold,
                color: themeprovider.isDark
                    ? AppColors.darkText
                    : AppColors.lightText,
                            ),
                          ),
                    Card( color: themeprovider.isDark ? AppColors.darkBorder : AppColors.lightBorder,
                      child: IconButton(
                          icon: const Icon(Icons.close, color: Colors.white),
                          onPressed: () {}),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
        
              // المحتوى الرئيسي قابل للتمرير
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      // Horizontal Years List
                      SizedBox(
                        height: 50,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: 50,
                          itemBuilder: (context, index) {
                            int year = 2008 - index;
                            bool isSelected = year == _selectedYear;
                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedYear = year;
                                  _focusedDay = DateTime(year, _focusedDay.month, _focusedDay.day);
                                  _selectedDay = _focusedDay;
                                });
                              },
                              child: Container(
                                margin: const EdgeInsets.symmetric(horizontal: 5),
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFF38E5A7) : const Color(0xFF1E2624),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Center(
                                    child: Text("$year",
                                        style: TextStyle(
                                            color: isSelected ? Colors.black : Colors.white))),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 20),
        
                      // Calendar
                      Container(
                        decoration: BoxDecoration(
                            color: const Color(0xFF1E2624),
                            borderRadius: BorderRadius.circular(20)),
                        child: TableCalendar(
                          
        locale: 'en_US',
                          firstDay: DateTime(1900),
                          lastDay: DateTime(2008, 12, 31),
                          focusedDay: _focusedDay,
                          calendarFormat: CalendarFormat.month,
                          selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                          onDaySelected: (selectedDay, focusedDay) {
                            setState(() {
                              _selectedDay = selectedDay;
                              _focusedDay = focusedDay;
                            });
                          },
                          headerStyle: const HeaderStyle(
                              formatButtonVisible: false,
                              titleCentered: true,
                              titleTextStyle: TextStyle(color: Colors.white, fontSize: 18),
                              leftChevronIcon: Icon(Icons.chevron_left, color: Colors.white),
                              rightChevronIcon: Icon(Icons.chevron_right, color: Colors.white)),
                          calendarStyle: const CalendarStyle(
                              defaultTextStyle: TextStyle(color: Colors.white),
                              weekendTextStyle: TextStyle(color: Colors.white),
                              selectedDecoration: BoxDecoration(
                                  color: Color(0xFF38E5A7), shape: BoxShape.circle),
                              todayDecoration: BoxDecoration(color: Colors.transparent)),
                        ),
                      ),
                      const SizedBox(height: 20),
        
                      // Selected Date Box
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                            color: const Color(0xFF1E2624),
                            borderRadius: BorderRadius.circular(20)),
                        child: Column(
                          children: [
                            const Text("Selected date",
                                style: TextStyle(color: Colors.grey, fontSize: 14)),
                            const SizedBox(height: 8),
                            Text(
                              _selectedDay != null
                                  ? DateFormat('MMMM d, yyyy').format(_selectedDay!)
                                  : "Select a date",
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
        
              // Confirm Button (ثابت في الأسفل)
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF38E5A7),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15))),
                  onPressed: () {},
                  child: const Text("Confirm date",
                      style: TextStyle(color: Colors.black, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}