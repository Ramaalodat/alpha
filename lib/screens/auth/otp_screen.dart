import 'dart:async';
import 'package:flutter/material.dart';
import 'package:pinput/pinput.dart';

class OtpScreen extends StatefulWidget {
  final String phoneNumber;
  const OtpScreen({Key? key, required this.phoneNumber}) : super(key: key);

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _pinController = TextEditingController();
  int _secondsRemaining = 30;
  Timer? _timer;

  String maskPhoneNumber(String phone) {
    if (phone.length <= 3) return phone;
    return "${phone.substring(0, 3)}\u2022\u2022\u2022${phone.substring(phone.length - 4)}";
  }

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    setState(() {
      _secondsRemaining = 30;
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          if (_secondsRemaining > 0) {
            _secondsRemaining--;
          } else {
            _timer?.cancel();
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final defaultPinTheme = PinTheme(
      width: 60,
      height: 70,
      textStyle: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF00897B)),
      decoration: BoxDecoration(
        color: const Color(0xFFE0F2F1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF00897B)),
      ),
    );

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            children: [
              const SizedBox(height: 50),
              Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)), child: const Icon(Icons.mail_outline, size: 50)),
              const SizedBox(height: 30),
              const Text('Verify your number', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              Text('We sent a 4-digit code to ${maskPhoneNumber(widget.phoneNumber)}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, color: Colors.grey)),
              const SizedBox(height: 40),
              
              Pinput(
                controller: _pinController,
                length: 4,
                defaultPinTheme: defaultPinTheme,
                focusedPinTheme: defaultPinTheme.copyWith(decoration: defaultPinTheme.decoration!.copyWith(border: Border.all(color: Colors.black))),
              ),
              
              const SizedBox(height: 20),
              
              // التعديل هنا: "Resend" فقط وبدون خط تحتها
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Didn't get the code? ", style: TextStyle(color: Colors.grey)),
                  GestureDetector(
                    onTap: _secondsRemaining == 0 ? _startTimer : null,
                    child: Text(
                      _secondsRemaining > 0 
                          ? "Resend (0:${_secondsRemaining.toString().padLeft(2, '0')})"
                          : "Resend",
                      style: TextStyle(
                        color: _secondsRemaining == 0 ? Colors.blueAccent : Colors.grey,
                        fontWeight: FontWeight.bold,
                        decoration: TextDecoration.none, // التأكد من عدم وجود خط
                      ),
                    ),
                  ),
                ],
              ),
              
              const Spacer(),
              
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF004D40), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15))),
                  onPressed: () { print("تم إدخال الرمز: ${_pinController.text}"); },
                  child: const Text('Verify', style: TextStyle(color: Colors.white, fontSize: 18)),
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
}