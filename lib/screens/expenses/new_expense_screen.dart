import 'package:alpha_app/core/utils/app_colors.dart';
import 'package:alpha_app/core/utils/device.dart';
import 'package:alpha_app/models/expense_model.dart';
import 'package:alpha_app/providers/expense_provider.dart';
import 'package:alpha_app/providers/themeprovider.dart';
import 'package:alpha_app/widgets/custom_textfield.dart';
import 'package:alpha_app/widgets/multi_select_chip.dart';
import 'package:alpha_app/widgets/option_chip.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class NewExpenseScreen extends StatefulWidget {
  final ExpenseModel? expenseToEdit;

  const NewExpenseScreen({
    super.key,
    this.expenseToEdit,
  });

  @override
  State<NewExpenseScreen> createState() =>
      _NewExpenseScreenState();
}

class _NewExpenseScreenState
    extends State<NewExpenseScreen> {
  bool _formPrepared = false;

  bool get _isEditing =>
      widget.expenseToEdit != null;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || _formPrepared) {
        return;
      }

      _formPrepared = true;

      final provider =
          context.read<ExpenseProvider>();

      if (widget.expenseToEdit != null) {
        provider.prepareExpenseForEditing(
          widget.expenseToEdit!,
        );
      } else {
        provider.clearForm();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider =
        context.watch<ExpenseProvider>();

    final themeProvider =
        context.watch<Themeprovider>();

    final bool isDark =
        themeProvider.isDark;

    final double screenW =
        Device.width(context);

    final double screenH =
        Device.height(context);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (
        didPop,
        result,
      ) {
        if (!didPop) {
          _closeScreen();
        }
      },
      child: Scaffold(
        backgroundColor: isDark
            ? AppColors.darkBackground
            : AppColors.lightBackground,
        body: SafeArea(
          child: Stack(
            children: [
              SingleChildScrollView(
                physics:
                    const BouncingScrollPhysics(),
                padding: EdgeInsets.symmetric(
                  horizontal: screenW * 0.05,
                ),
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      height: screenH * 0.022,
                    ),

                    _buildHeader(
                      isDark: isDark,
                      screenW: screenW,
                    ),

                    SizedBox(
                      height: screenH * 0.012,
                    ),

                    Text(
                      _isEditing
                          ? "Update the expense details below."
                          : "Record the expense accurately so Alpha can analyze its effect on your budget.",
                      style: GoogleFonts
                          .ibmPlexSansArabic(
                        color: isDark
                            ? AppColors.darkSubText
                            : AppColors.lightSubText,
                        fontSize: screenW * 0.034,
                        fontWeight:
                            FontWeight.w500,
                        height: 1.5,
                      ),
                    ),

                    SizedBox(
                      height: screenH * 0.03,
                    ),

                    // ================= CATEGORY =================

                    _SectionTitle(
                      title: "Category",
                      screenW: screenW,
                      isDark: isDark,
                    ),

                    SizedBox(
                      height: screenH * 0.012,
                    ),

                    MultiSelectChip(
                      items: provider.categories,
                      selectedItems:
                          provider.selectedCategory ==
                                  null
                              ? []
                              : [
                                  provider
                                      .selectedCategory!,
                                ],
                      onTap:
                          provider.setCategory,
                    ),

                    if (provider.selectedCategory ==
                        "Other") ...[
                      SizedBox(
                        height: screenH * 0.018,
                      ),

                      CustomTextfield(
                        controller: provider
                            .customCategoryController,
                        hint:
                            "Enter category name",
                        type: TextFieldType.name,
                        icon:
                            Icons.category_outlined,
                        onChanged: (_) {
                          provider
                              .notifyExpenseFormChanged();
                        },
                      ),
                    ],

                    SizedBox(
                      height: screenH * 0.025,
                    ),

                    // ================= EXPENSE NAME =================

                    _SectionTitle(
                      title: "Expense name",
                      screenW: screenW,
                      isDark: isDark,
                    ),

                    SizedBox(
                      height: screenH * 0.01,
                    ),

                    CustomTextfield(
                      controller:
                          provider.titleController,
                      hint:
                          "Enter expense name",
                      type: TextFieldType.name,
                      icon: Icons
                          .receipt_long_outlined,
                      onChanged: (_) {
                        provider
                            .notifyExpenseFormChanged();
                      },
                    ),

                    SizedBox(
                      height: screenH * 0.022,
                    ),

                    // ================= AMOUNT =================

                    _SectionTitle(
                      title: "Amount",
                      screenW: screenW,
                      isDark: isDark,
                    ),

                    SizedBox(
                      height: screenH * 0.01,
                    ),

                    CustomTextfield(
                      controller:
                          provider.amountController,
                      hint: "Enter amount",
                      type: TextFieldType.number,
                      icon:
                          Icons.payments_outlined,
                      suffix: const Padding(
                        padding:
                            EdgeInsets.all(12),
                        child: Text("JOD"),
                      ),
                      onChanged: (_) {
                        provider
                            .notifyExpenseFormChanged();
                      },
                    ),

                    SizedBox(
                      height: screenH * 0.022,
                    ),

                    // ================= NEED / WANT =================

                    _SectionTitle(
                      title: "Expense type",
                      screenW: screenW,
                      isDark: isDark,
                    ),

                    SizedBox(
                      height: screenH * 0.012,
                    ),

                    OptionChip(
                      items: const [
                        "Need",
                        "Want",
                      ],
                      selected:
                          provider.expenseType ==
                                  ExpenseType.need
                              ? "Need"
                              : "Want",
                      onTap: (value) {
                        provider.setExpenseType(
                          value == "Need"
                              ? ExpenseType.need
                              : ExpenseType.want,
                        );
                      },
                    ),

                    SizedBox(
                      height: screenH * 0.022,
                    ),

                    // ================= MOVEMENT TYPE =================

                    _SectionTitle(
                      title: "Movement type",
                      screenW: screenW,
                      isDark: isDark,
                    ),

                    SizedBox(
                      height: screenH * 0.012,
                    ),

                    OptionChip(
                      items:
                          provider.movementTypes,
                      selected:
                          provider.movementTypeLabel,
                      onTap: provider
                          .setMovementTypeByLabel,
                    ),

                    if (provider.isRecurring) ...[
                      SizedBox(
                        height: screenH * 0.022,
                      ),

                      _SectionTitle(
                        title: "Coverage period",
                        screenW: screenW,
                        isDark: isDark,
                      ),

                      SizedBox(
                        height: screenH * 0.012,
                      ),

                      MultiSelectChip(
                        items:
                            provider.coveragePeriods,
                        selectedItems: [
                          provider
                              .coveragePeriodLabel,
                        ],
                        onTap: provider
                            .setCoveragePeriodByLabel,
                      ),
                    ],

                    SizedBox(
                      height: screenH * 0.022,
                    ),

                    // ================= PAYMENT METHOD =================

                    _SectionTitle(
                      title: "Payment method",
                      screenW: screenW,
                      isDark: isDark,
                    ),

                    SizedBox(
                      height: screenH * 0.012,
                    ),

                    OptionChip(
                      items:
                          provider.paymentMethods,
                      selected:
                          provider.paymentMethod,
                      onTap: provider
                          .setPaymentMethod,
                    ),

                    SizedBox(
                      height: screenH * 0.022,
                    ),

                    // ================= DATE =================

                    _SectionTitle(
                      title: "Date",
                      screenW: screenW,
                      isDark: isDark,
                    ),

                    SizedBox(
                      height: screenH * 0.01,
                    ),

                    CustomTextfield(
                      controller:
                          provider.dateController,
                      hint:
                          "Select expense date",
                      type: TextFieldType.date,
                      icon: Icons
                          .calendar_month_outlined,
                      readOnly: true,
                      onTap: () {
                        _selectDate(
                          provider: provider,
                          isDark: isDark,
                        );
                      },
                    ),

                    SizedBox(
                      height: screenH * 0.022,
                    ),

                    // ================= NOTE =================

                    _SectionTitle(
                      title: "Note (optional)",
                      screenW: screenW,
                      isDark: isDark,
                    ),

                    SizedBox(
                      height: screenH * 0.01,
                    ),

                    CustomTextfield(
                      controller:
                          provider.noteController,
                      hint: "Add a note",
                      type: TextFieldType.name,
                      icon: Icons.notes_rounded,
                      onChanged: (_) {
                        provider
                            .notifyExpenseFormChanged();
                      },
                    ),

                    if (provider.errorMessage !=
                        null) ...[
                      SizedBox(
                        height: screenH * 0.016,
                      ),

                      _ErrorCard(
                        message:
                            provider.errorMessage!,
                        onClose:
                            provider.clearError,
                      ),
                    ],

                    SizedBox(
                      height: screenH * 0.025,
                    ),

                    // ================= ALPHA PREVIEW =================

                    _AlphaPreviewCard(
                      provider: provider,
                      isDark: isDark,
                      screenW: screenW,
                    ),

                    SizedBox(
                      height: screenH * 0.03,
                    ),

                    // ================= SAVE BUTTON =================

                    SizedBox(
                      width: double.infinity,
                      height: screenH * 0.065,
                      child: ElevatedButton(
                        onPressed:
                            provider.isSaving
                                ? null
                                : _saveExpense,
                        style: ElevatedButton
                            .styleFrom(
                          backgroundColor: isDark
                              ? AppColors.darkPrimary
                              : AppColors.lightPrimary,
                          foregroundColor:
                              AppColors.darkBorder,
                          disabledBackgroundColor:
                              (isDark
                                      ? AppColors
                                          .darkPrimary
                                      : AppColors
                                          .lightPrimary)
                                  .withOpacity(0.45),
                          elevation: 0,
                          shape:
                              RoundedRectangleBorder(
                            borderRadius:
                                BorderRadius.circular(
                              10,
                            ),
                          ),
                        ),
                        child: provider.isSaving
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child:
                                    CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                _isEditing
                                    ? "Save Changes"
                                    : provider
                                            .isShoppingSessionActive
                                        ? "Add to Session"
                                        : "Add Expense",
                                style: TextStyle(
                                  fontSize:
                                      screenW * 0.05,
                                  fontWeight:
                                      FontWeight.w600,
                                ),
                              ),
                      ),
                    ),

                    SizedBox(
                      height: screenH * 0.03,
                    ),
                  ],
                ),
              ),

              if (provider.isSaving)
                Positioned.fill(
                  child: AbsorbPointer(
                    child: Container(
                      color: Colors.black
                          .withOpacity(0.15),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader({
    required bool isDark,
    required double screenW,
  }) {
    return Row(
      children: [
        InkWell(
          onTap: _closeScreen,
          borderRadius:
              BorderRadius.circular(12),
          child: Container(
            width: screenW * 0.11,
            height: screenW * 0.11,
            decoration: BoxDecoration(
              color: isDark
                  ? const Color(0xFF203330)
                  : Colors.white,
              borderRadius:
                  BorderRadius.circular(12),
              border: Border.all(
                color: isDark
                    ? Colors.white
                        .withOpacity(0.04)
                    : Colors.black
                        .withOpacity(0.05),
              ),
            ),
            child: Icon(
              Icons.arrow_back_ios_new_rounded,
              color: isDark
                  ? AppColors.darkText
                  : AppColors.lightText,
              size: screenW * 0.05,
            ),
          ),
        ),

        SizedBox(
          width: screenW * 0.035,
        ),

        Expanded(
          child: Text(
            _isEditing
                ? "Edit Expense"
                : "Add Expense",
            style: GoogleFonts
                .ibmPlexSansArabic(
              color: isDark
                  ? AppColors.darkText
                  : AppColors.lightText,
              fontSize: screenW * 0.065,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _selectDate({
    required ExpenseProvider provider,
    required bool isDark,
  }) async {
    final selectedDate =
        await showDatePicker(
      context: context,
      initialDate: provider.selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      builder: (
        context,
        child,
      ) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme:
                ColorScheme.fromSeed(
              seedColor: isDark
                  ? AppColors.darkPrimary
                  : AppColors.lightPrimary,
              brightness: isDark
                  ? Brightness.dark
                  : Brightness.light,
            ),
          ),
          child: child!,
        );
      },
    );

    if (selectedDate == null ||
        !mounted) {
      return;
    }

    provider.setDate(selectedDate);
  }

  Future<void> _saveExpense() async {
    FocusScope.of(context).unfocus();

    final provider =
        context.read<ExpenseProvider>();

    final bool wasEditing =
        _isEditing;

    final bool addedToSession =
        provider.isShoppingSessionActive &&
            !wasEditing;

    final bool saved =
        await provider.saveCurrentExpense();

    if (!mounted) {
      return;
    }

    if (!saved) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: Text(
              provider.errorMessage ??
                  provider.validationMessage ??
                  "Could not save expense",
              style: GoogleFonts
                  .ibmPlexSansArabic(),
            ),
            backgroundColor:
                const Color(0xFFFF6B6B),
            behavior:
                SnackBarBehavior.floating,
          ),
        );

      return;
    }

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(
            wasEditing
                ? "Expense updated successfully"
                : addedToSession
                    ? "Expense added to shopping session"
                    : "Expense added successfully",
            style: GoogleFonts
                .ibmPlexSansArabic(
              fontWeight: FontWeight.w600,
            ),
          ),
          backgroundColor:
              const Color(0xFF0F766E),
          behavior:
              SnackBarBehavior.floating,
        ),
      );

    Navigator.pop(
      context,
      true,
    );
  }

  void _closeScreen() {
    context
        .read<ExpenseProvider>()
        .clearForm();

    Navigator.pop(context);
  }
}

// =====================================================
// SECTION TITLE
// =====================================================

class _SectionTitle extends StatelessWidget {
  final String title;
  final double screenW;
  final bool isDark;

  const _SectionTitle({
    required this.title,
    required this.screenW,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style:
          GoogleFonts.ibmPlexSansArabic(
        fontSize: screenW * 0.04,
        color: isDark
            ? AppColors.darkSubText
            : AppColors.lightSubText,
        fontWeight: FontWeight.bold,
      ),
    );
  }
}

// =====================================================
// ERROR CARD
// =====================================================

class _ErrorCard extends StatelessWidget {
  final String message;
  final VoidCallback onClose;

  const _ErrorCard({
    required this.message,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding:
          const EdgeInsets.only(
        left: 13,
        top: 8,
        bottom: 8,
      ),
      decoration: BoxDecoration(
        color: const Color(
          0xFFFF6B6B,
        ).withOpacity(0.10),
        borderRadius:
            BorderRadius.circular(14),
        border: Border.all(
          color: const Color(
            0xFFFF6B6B,
          ).withOpacity(0.18),
        ),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.error_outline_rounded,
            color: Color(0xFFFF6B6B),
          ),

          const SizedBox(width: 9),

          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color:
                    Color(0xFFFF6B6B),
              ),
            ),
          ),

          IconButton(
            onPressed: onClose,
            icon: const Icon(
              Icons.close_rounded,
              color:
                  Color(0xFFFF6B6B),
              size: 18,
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================
// ALPHA PREVIEW
// =====================================================

class _AlphaPreviewCard
    extends StatelessWidget {
  final ExpenseProvider provider;
  final bool isDark;
  final double screenW;

  const _AlphaPreviewCard({
    required this.provider,
    required this.isDark,
    required this.screenW,
  });

  @override
  Widget build(BuildContext context) {
    final String message =
        _buildMessage();

    return Container(
      width: double.infinity,
      padding:
          const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkSecondary
                .withOpacity(0.10)
            : AppColors.lightSecondary
                .withOpacity(0.10),
        borderRadius:
            BorderRadius.circular(15),
        border: Border.all(
          color: const Color(
            0xFF34D399,
          ).withOpacity(0.14),
        ),
      ),
      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(
                0xFF34D399,
              ).withOpacity(0.13),
              borderRadius:
                  BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.auto_awesome_rounded,
              color:
                  Color(0xFF34D399),
            ),
          ),

          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  "Alpha Preview",
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: const Color(
                      0xFF34D399,
                    ),
                    fontSize:
                        screenW * 0.036,
                    fontWeight:
                        FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  message,
                  style: GoogleFonts
                      .ibmPlexSansArabic(
                    color: isDark
                        ? AppColors.darkText
                        : AppColors.lightText,
                    fontSize:
                        screenW * 0.032,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _buildMessage() {
    if (provider.amount <= 0) {
      return "Enter the expense details to preview its financial effect.";
    }

    if (provider.expenseType ==
        ExpenseType.want) {
      return "This is a secondary want. Alpha will compare it with your remaining budget and current goals.";
    }

    if (provider.isRecurring) {
      return "This recurring movement covers ${provider.coveragePeriodLabel} and its financial effect will be distributed across that period.";
    }

    if (provider.amount >= 100) {
      return "This is a relatively high expense. Review its impact on the remaining days of the month.";
    }

    return "This expense will be included in your actual spending and daily safe allowance analysis.";
  }
}