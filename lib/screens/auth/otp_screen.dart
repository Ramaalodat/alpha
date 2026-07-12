import 'dart:async';
import 'package:flutter/material.dart';

class OtpScreen extends StatefulWidget {
  final String phoneNumber;

  const OtpScreen({Key? key, required this.phoneNumber}) : super(key: key);

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  // متغيرات التصميم
  final Color primaryColor = const Color(0xFF004D40);
  final Color lightTeal = const Color(0xFFE0F2F1);
  final Color borderColor = const Color(0xFF00897B);
  final Color textColor = const Color(0xFF263238);

  // متغيرات الوقت
  int _secondsRemaining = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() {
          _secondsRemaining--;
        });
      } else {
        _timer?.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            children: [
              const SizedBox(height: 40),
              // الأيقونة
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                child: const Icon(Icons.mail_outline, size: 50, color: Colors.black),
              ),
              const SizedBox(height: 30),
              
              Text('Verify your number',
                  style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: textColor)),
              const SizedBox(height: 10),
              Text('We sent a 4-digit code to ${widget.phoneNumber}',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.grey[700])),
              
              const SizedBox(height: 40),
              // حقول الـ OTP
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (index) => _buildOtpBox()),
              ),
              
              const SizedBox(height: 20),
              // وقت العد التنازلي
              Text(
                _secondsRemaining > 0 
                  ? "Didn't get the code? Resend (0:${_secondsRemaining.toString().padLeft(2, '0')})"
                  : "Didn't get the code? Resend now",
                style: const TextStyle(color: Colors.grey),
              ),
              
              const Spacer(),
              // زر التحقق
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  ),
                  onPressed: () {},
                  child: const Text('Verify', style: TextStyle(fontSize: 18, color: Colors.white)),
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOtpBox() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8),
      width: 60,
      height: 70,
      decoration: BoxDecoration(
        color: lightTeal,
        border: Border.all(color: borderColor),
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }
}