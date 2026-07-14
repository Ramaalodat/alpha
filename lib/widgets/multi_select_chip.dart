import 'package:flutter/material.dart';


class MultiSelectChip extends StatelessWidget {


  final List<String> items;

  final List<String> selectedItems;

  final Function(String) onTap;



  const MultiSelectChip({

    super.key,

    required this.items,

    required this.selectedItems,

    required this.onTap,

  });



  @override
  Widget build(BuildContext context) {


    return SizedBox(

      height:50,


      child:ListView.builder(

        scrollDirection:
        Axis.horizontal,


        itemCount:
        items.length,


        itemBuilder:(context,index){


          final item =
          items[index];


          final selected =
          selectedItems.contains(item);



          return GestureDetector(


            onTap:(){

              onTap(item);

            },


            child:Container(


              margin:

              const EdgeInsets.only(

                right:10,

              ),



              padding:

              const EdgeInsets.symmetric(

                horizontal:18,

                vertical:12,

              ),



              decoration:

              BoxDecoration(


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

                item,


                style:

                TextStyle(


                  color:

                  selected

                      ?

                  Colors.teal

                      :

                  Colors.grey.shade300,


                  fontWeight:

                  FontWeight.w600,


                ),

              ),


            ),


          );


        },

      ),

    );


  }


}