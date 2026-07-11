import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:flutter/material.dart';


class CustomTextfield extends StatefulWidget {
 final TextEditingController controller ;
   final String hint;
  final IconData? icon;
  final bool isPassword;
  final VoidCallback? togglePassword;
  final Function(String)? onChanged;
  final String? Function(String?)? validator;

   CustomTextfield({ super.key , required this.controller ,  required this.hint,
     this.icon,
    this.isPassword = false,
    this.togglePassword,
    this.validator,
    this.onChanged,});

  @override
  State<CustomTextfield> createState() => _CustomTextfieldState();
}

class _CustomTextfieldState extends State<CustomTextfield> {
  bool _isSecure = true;
  @override
  Widget build(BuildContext context) {
     final double screenW = Device.width(context);
    return    Padding(
                          padding: EdgeInsets.symmetric(horizontal: screenW*0.02),
                          child: TextFormField(  controller: widget.controller,
                          obscureText:  widget.isPassword ? _isSecure : false,
                            keyboardType:
          widget.isPassword ? TextInputType.text : TextInputType.emailAddress,
                            style: TextStyle(color: AppColors.darkText ),
                            decoration: InputDecoration( 
                              
                              hintText: widget.hint,
                              hintStyle: TextStyle(color: AppColors.darkAccent  ),
                              prefixIcon: Icon(widget.icon, color:  AppColors.darkAccent, size: screenW * 0.06),
                              suffixIcon: widget.isPassword ?
                               IconButton(onPressed: () {
                             setState(() => _isSecure = !_isSecure);
          if (widget.togglePassword != null) widget.togglePassword!();
                              }, icon: Icon( _isSecure?   Icons.visibility_off : Icons.visibility ,  color:  AppColors.darkSubText, size: screenW * 0.06) ) : null ,
                              focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: AppColors.darkCard, width: 1.5) , borderRadius: BorderRadius.circular(10)) , filled: true , fillColor:AppColors.darkBorder ,
                              border: OutlineInputBorder( borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(  color: AppColors.darkCard, width: 1)
                            ),
                         
                             
                         
                           ),
                           validator: widget.validator
                            
                          ),
                        );
  }
}