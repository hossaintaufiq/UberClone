import "dart:async";

import "package:flutter/material.dart";

import "../../core/app_theme.dart";
import "../../services/driver_service.dart";

class DriverFeedbackScreen extends StatefulWidget {
  const DriverFeedbackScreen({super.key});

  @override
  State<DriverFeedbackScreen> createState() => _DriverFeedbackScreenState();
}

class _DriverFeedbackScreenState extends State<DriverFeedbackScreen> {
  List<dynamic> _items = [];
  bool _loading = true;
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    _load();
    _poll = Timer.periodic(const Duration(seconds: 30), (_) => _load());
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final list = await DriverService.riderFeedback();
      if (!mounted) return;
      setState(() {
        _items = list;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _items = [];
        _loading = false;
      });
    }
  }

  String _fmt(dynamic iso) {
    if (iso == null) return "—";
    final d = DateTime.tryParse("$iso");
    return d?.toLocal().toString().substring(0, 16) ?? "—";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        title: const Text("Rider feedback", style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? ListView(children: const [SizedBox(height: 120), Center(child: CircularProgressIndicator())])
            : _items.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: const [
                      SizedBox(height: 80),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 24),
                        child: Text(
                          "No ratings or comments yet. They appear after riders submit feedback on completed trips.",
                          textAlign: TextAlign.center,
                          style: TextStyle(color: kMuted, fontWeight: FontWeight.w600, height: 1.4),
                        ),
                      ),
                    ],
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                    itemCount: _items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      final ride = _items[i] as Map<String, dynamic>;
                      final rider = ride["riderId"];
                      final name = rider is Map ? "${rider["name"] ?? "Rider"}" : "Rider";
                      final stars = (ride["riderRating"] as num?)?.toInt();
                      final text = "${ride["riderFeedback"] ?? ""}".trim();
                      return Card(
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                          side: const BorderSide(color: kCardBorder),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
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
                                        Text(name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                                        const SizedBox(height: 4),
                                        Text(
                                          _fmt(ride["tripCompletedAt"] ?? ride["updatedAt"]),
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: kMuted),
                                        ),
                                        if (stars != null && stars >= 1 && stars <= 5) ...[
                                          const SizedBox(height: 8),
                                          Text("$stars/5", style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFFD97706))),
                                        ],
                                      ],
                                    ),
                                  ),
                                  const Icon(Icons.route_rounded, color: kMuted),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text("${ride["pickupAddress"] ?? ""}", maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12)),
                              Text("→ ${ride["dropoffAddress"] ?? ""}", maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: kMuted)),
                              if (text.isNotEmpty) ...[
                                const SizedBox(height: 12),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                  ),
                                  child: Text(text, style: const TextStyle(fontWeight: FontWeight.w600, height: 1.35)),
                                ),
                              ] else ...[
                                const SizedBox(height: 8),
                                const Text("No written comment.", style: TextStyle(fontSize: 12, color: kMuted, fontWeight: FontWeight.w600)),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
