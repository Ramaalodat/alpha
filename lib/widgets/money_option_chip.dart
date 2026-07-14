import 'package:flutter/material.dart';


class MoneyOptionChip extends StatelessWidget {


  final String title;

  final bool selected;

  final VoidCallback onTap;



  const MoneyOptionChip({

    super.key,

    required this.title,

    required this.selected,

    required this.onTap,

  });




  @override
  Widget build(BuildContext context) {



    return GestureDetector(


      onTap:onTap,


      child: Container(


        padding:

        const EdgeInsets.symmetric(

          horizontal:18,

          vertical:12,

        ),



        decoration:BoxDecoration(



          color:

          selected

              ?

          Colors.teal.withOpacity(.15)

              :

          const Color(0xff1C2222),



          borderRadius:

          BorderRadius.circular(12),



          border:

          Border.all(


            color:

            selected

                ?

            Colors.teal

                :

            Colors.transparent,



            width:1.5,


          ),


        ),



        child:Text(


          title,


          style:TextStyle(


            color:

            selected

                ?

            Colors.teal

                :

            Colors.white,



            fontWeight:

            FontWeight.w600,


          ),


        ),



      ),


    );


  }

}