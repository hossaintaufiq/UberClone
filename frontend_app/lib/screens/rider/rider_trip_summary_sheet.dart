import "package:flutter/material.dart";

import "../../core/app_config.dart";
import "../../core/app_theme.dart";
import "../../services/rider_service.dart";
import "../../utils/ride_status.dart";

const Color _kTeal = Color(0xFF0F766E);

/// Post-ride summary: pay, rate, written feedback — parity with rider web modal.
Future<void> showRiderTripSummarySheet(
  BuildContext context, {
  required Map rideFromList,
  required Future<void> Function() reloadRides,
  required VoidCallback onGoBook,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => _RiderTripSummaryBody(
      rideFromList: rideFromList,
      reloadRides: reloadRides,
      onGoBook: onGoBook,
    ),
  );
}

class _RiderTripSummaryBody extends StatefulWidget {
  final Map rideFromList;
  final Future<void> Function() reloadRides;
  final VoidCallback onGoBook;

  const _RiderTripSummaryBody({
    required this.rideFromList,
    required this.reloadRides,
    required this.onGoBook,
  });

  @override
  State<_RiderTripSummaryBody> createState() => _RiderTripSummaryBodyState();
}

class _RiderTripSummaryBodyState extends State<_RiderTripSummaryBody> {
  Map<String, dynamic> _ride = {};
  bool _loading = true;
  bool _payBusy = false;
  bool _fbBusy = false;
  int _stars = 0;
  late final TextEditingController _comment = TextEditingController();

  String get _id => "${_ride["_id"] ?? _ride["id"] ?? ""}";

  Future<void> _merge() async {
    final seed = Map<String, dynamic>.from(widget.rideFromList as Map);
    final rideId = "${seed["_id"] ?? seed["id"]}";
    try {
      final tr = await RiderService.trackRide(rideId);
      final d = Map<String, dynamic>.from(tr["data"] as Map? ?? {});
      setState(() {
        _ride = {
          ...seed,
          ...d,
          "paymentPaid": seed["paymentPaid"],
          "paymentMethod": seed["paymentMethod"] ?? d["paymentMethod"],
          "paymentAmount": seed["paymentAmount"] ?? d["paymentAmount"],
          "driverId": d["driverId"] ?? seed["driverId"],
        };
      });
    } catch (_) {
      setState(() => _ride = seed);
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _merge();
      final rn = (_ride["riderRating"] as num?)?.clamp(1, 5);
      final s = rn != null ? rn.round() : 5;
      if (!mounted) return;
      setState(() {
        _stars = s;
        _comment.text = "${_ride["riderFeedback"] ?? ""}";
        _loading = false;
      });
    });
  }

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  String? _driverPhoto(dynamic d) {
    if (d is! Map) return null;
    final p = d["profilePhoto"];
    if (p is! String || p.isEmpty) return null;
    if (p.startsWith("http")) return p;
    return "${AppConfig.baseUrl}$p";
  }

  Future<void> _pay(String method) async {
    if (_id.isEmpty) return;
    setState(() => _payBusy = true);
    try {
      await RiderService.payRide(_id, method);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Payment recorded. Thank you!")));
      await widget.reloadRides();
      await _merge();
      if (!mounted) return;
      setState(() {});
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
    } finally {
      if (mounted) setState(() => _payBusy = false);
    }
  }

  Future<void> _submitFeedback() async {
    if (_id.isEmpty) return;
    setState(() => _fbBusy = true);
    try {
      await RiderService.rateDriver(_id, _stars, comment: _comment.text.trim());
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Feedback saved.")));
      await widget.reloadRides();
      await _merge();
      if (!mounted) return;
      setState(() {
        _comment.text = "${_ride["riderFeedback"] ?? _comment.text}";
      });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$e")));
    } finally {
      if (mounted) setState(() => _fbBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final h = MediaQuery.of(context).size.height * 0.92;
    final driver = _ride["driverId"];
    final driverName = driver is Map ? "${driver["name"] ?? "Driver"}" : "Your driver";
    final photo = _driverPhoto(driver);
    final km = num.tryParse("${_ride["distanceKm"] ?? 0}")?.round() ?? 0;
    final distLabel = km > 0 ? "$km km" : "—";
    final br = rideFareBreakdown(_ride);
    final tripMin = rideTripMinutes(_ride);
    final durLabel = tripMin != null ? "$tripMin min" : "—";
    final needPay = rideNeedsPayment(_ride);
    final st = "${_ride["status"] ?? ""}".toLowerCase();
    final ratingRaw = num.tryParse("${_ride["riderRating"] ?? ""}");
    final hasSavedRating = ratingRaw != null && ratingRaw >= 1 && ratingRaw <= 5;
    final hasSavedComment = "${_ride["riderFeedback"] ?? ""}".trim().isNotEmpty;
    final feedbackLocked = hasSavedRating || hasSavedComment;

    return Container(
      height: h,
      decoration: const BoxDecoration(
        color: Color(0xFFF1F5F9),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 10),
          Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(99))),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 8, 8),
            child: Row(
              children: [
                const Expanded(
                  child: Text("Trip summary", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: kText)),
                ),
                IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close_rounded)),
              ],
            ),
          ),
          if (_loading) const Expanded(child: Center(child: CircularProgressIndicator())),
          if (!_loading)
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                children: [
                  _card(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _addrRow(isPickup: true, label: "Pickup", text: "${_ride["pickupAddress"] ?? ""}"),
                                  const SizedBox(height: 8),
                                  _addrRow(isPickup: false, label: "Destination", text: "${_ride["dropoffAddress"] ?? ""}"),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Text("Distance", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: kMuted)),
                                Text(distLabel, style: const TextStyle(fontWeight: FontWeight.w900)),
                                const SizedBox(height: 8),
                                const Text("Fare", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: kMuted)),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFDCFCE7),
                                    borderRadius: BorderRadius.circular(999),
                                    border: Border.all(color: const Color(0xFFBBF7D0)),
                                  ),
                                  child: Text(
                                    "৳${num.tryParse("${_ride["fare"] ?? 0}")?.toString() ?? "0"}",
                                    style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF166534)),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  _card(
                    child: Row(
                      children: [
                        if (photo != null)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(999),
                            child: Image.network(photo, width: 64, height: 64, fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _avatarFallback(driverName)),
                          )
                        else
                          _avatarFallback(driverName),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(driverName, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                              const Text("Driver", style: TextStyle(color: kMuted, fontWeight: FontWeight.w600)),
                              if (driver is Map && driver["rating"] != null)
                                Text(
                                  "Avg ${driver["rating"]}",
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFFD97706)),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  _card(
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            children: [
                              const Text("Your rating", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: kMuted)),
                              const SizedBox(height: 6),
                              Wrap(
                                alignment: WrapAlignment.center,
                                spacing: 2,
                                runSpacing: 2,
                                children: List.generate(5, (i) {
                                  final n = i + 1;
                                  return InkResponse(
                                    radius: 16,
                                    onTap: feedbackLocked ? null : () => setState(() => _stars = n),
                                    child: Padding(
                                      padding: const EdgeInsets.all(2),
                                      child: Icon(
                                        Icons.star_rounded,
                                        color: n <= _stars ? const Color(0xFFFBBF24) : const Color(0xFFCBD5E1),
                                        size: 24,
                                      ),
                                    ),
                                  );
                                }),
                              ),
                              Text(_stars < 1 ? "Tap stars" : "$_stars/5", style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: kMuted)),
                            ],
                          ),
                        ),
                        Container(width: 1, height: 72, color: const Color(0xFFF1F5F9)),
                        Expanded(
                          child: Column(
                            children: [
                              const Text("Pay method", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: kMuted)),
                              const SizedBox(height: 8),
                              Text(
                                needPay ? "Choose below" : formatPaymentMethod("${_ride["paymentMethod"] ?? "cash"}"),
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        Container(width: 1, height: 72, color: const Color(0xFFF1F5F9)),
                        Expanded(
                          child: Column(
                            children: [
                              const Text("Duration", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: kMuted)),
                              const SizedBox(height: 8),
                              Text(durLabel, style: const TextStyle(fontWeight: FontWeight.w900)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  _card(
                    child: Row(
                      children: [
                        Expanded(child: _moneyCol("Quoted base", "৳${br["baseFare"]!.toStringAsFixed(0)}")),
                        Expanded(child: _moneyCol("You saved", br["discount"]! > 0 ? "৳${br["discount"]!.toStringAsFixed(0)}" : "—", accent: const Color(0xFFF59E0B))),
                        Expanded(child: _moneyCol("Total", "৳${br["total"]!.toStringAsFixed(0)}", accent: _kTeal)),
                      ],
                    ),
                  ),
                  if (st == "completed" && needPay) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFA7F3D0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text("Pay for this trip", style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF065F46))),
                          const SizedBox(height: 8),
                          const Text(
                            "Cash, bKash, Nagad, or Card.",
                            style: TextStyle(fontSize: 12, color: Color(0xFF047857)),
                          ),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              for (final m in [
                                ["cash", "Cash"],
                                ["bkash", "bKash"],
                                ["nagad", "Nagad"],
                                ["card", "Card"],
                              ])
                                FilledButton(
                                  style: FilledButton.styleFrom(
                                    backgroundColor: _kTeal,
                                    visualDensity: VisualDensity.compact,
                                  ),
                                  onPressed: _payBusy ? null : () => _pay("${m[0]}"),
                                  child: Text("${m[1]}"),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                  if (st == "completed" && !needPay) ...[
                    const SizedBox(height: 10),
                    const Text("Paid · thank you", textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF16A34A))),
                  ],
                  const SizedBox(height: 12),
                  const Text("Feedback", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: kMuted, letterSpacing: 1)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _comment,
                    readOnly: feedbackLocked,
                    maxLines: 4,
                    maxLength: 2000,
                    decoration: InputDecoration(
                      hintText: "How was the ride?",
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                  if (feedbackLocked) ...[
                    const SizedBox(height: 4),
                    const Text(
                      "Feedback already submitted for this trip.",
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF16A34A)),
                    ),
                  ],
                  const SizedBox(height: 8),
                  FilledButton(
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(48),
                      backgroundColor: _kTeal,
                    ),
                    onPressed: (feedbackLocked || _fbBusy || _stars < 1) ? null : _submitFeedback,
                    child: Text(feedbackLocked ? "Feedback submitted" : _fbBusy ? "Saving…" : "Submit feedback"),
                  ),
                  const SizedBox(height: 12),
                  FilledButton(
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(48),
                      backgroundColor: const Color(0xFF0F172A),
                    ),
                    onPressed: () {
                      Navigator.pop(context);
                      widget.onGoBook();
                    },
                    child: const Text("Re-order ride"),
                  ),
                  const SizedBox(height: 36),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _moneyCol(String label, String val, {Color? accent}) {
    return Column(
      children: [
        Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: kMuted)),
        const SizedBox(height: 6),
        Text(val, textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.w900, color: accent ?? kText)),
      ],
    );
  }

  Widget _avatarFallback(String name) {
    return CircleAvatar(
      radius: 32,
      backgroundColor: _kTeal.withOpacity(0.15),
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : "D",
        style: const TextStyle(fontWeight: FontWeight.w900, color: _kTeal, fontSize: 22),
      ),
    );
  }

  Widget _addrRow({required bool isPickup, required String label, required String text}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: isPickup ? const Color(0xFFCCFBF1) : const Color(0xFFF1F5F9),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
            ),
            child: Icon(isPickup ? Icons.circle : Icons.place_rounded, size: isPickup ? 8 : 16, color: isPickup ? const Color(0xFF0D9488) : kText),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: kMuted, letterSpacing: 0.5)),
              Text(text, style: const TextStyle(fontWeight: FontWeight.w800, height: 1.25)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _card({required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE8EEF4)),
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2))],
      ),
      child: child,
    );
  }
}
