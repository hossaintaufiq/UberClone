/// Rider-facing labels for backend ride status strings.
class RiderRideStatusUi {
  final String badge;
  final String headline;
  final String subtitle;

  const RiderRideStatusUi({required this.badge, required this.headline, required this.subtitle});
}

RiderRideStatusUi riderFacingRideUi(String? status) {
  final s = (status ?? "").trim().toLowerCase();
  switch (s) {
    case "requested":
      return const RiderRideStatusUi(
        badge: "Finding a driver",
        headline: "Trip request live",
        subtitle:
            "Your booking is active. We notify the nearest online driver; you’ll see an update when someone accepts.",
      );
    case "accepted":
      return const RiderRideStatusUi(
        badge: "Driver assigned",
        headline: "Driver matched",
        subtitle: "A driver accepted your ride. Meet them at the pickup location.",
      );
    case "arrived":
      return const RiderRideStatusUi(
        badge: "Driver arrived",
        headline: "At pickup",
        subtitle: "Your driver has arrived at the pickup point.",
      );
    case "started":
      return const RiderRideStatusUi(
        badge: "Trip started",
        headline: "On the way",
        subtitle: "Heading toward your destination.",
      );
    case "ongoing":
      return const RiderRideStatusUi(
        badge: "On trip",
        headline: "En route",
        subtitle: "Ride in progress to your drop-off.",
      );
    case "completed":
      return const RiderRideStatusUi(badge: "Completed", headline: "Trip finished", subtitle: "");
    case "cancelled":
      return const RiderRideStatusUi(badge: "Cancelled", headline: "Ride cancelled", subtitle: "");
    default:
      return RiderRideStatusUi(
        badge: s.isEmpty ? "Updating…" : s.replaceAll("_", " "),
        headline: "Ride status",
        subtitle: "",
      );
  }
}

String formatPaymentMethod(String? method) {
  switch ((method ?? "").toLowerCase()) {
    case "bkash":
      return "bKash";
    case "nagad":
      return "Nagad";
    case "card":
      return "Card";
    case "cash":
      return "Cash";
    default:
      final raw = method?.trim();
      return (raw != null && raw.isNotEmpty) ? raw : "Cash";
  }
}

bool rideNeedsPayment(dynamic r) {
  if (_stDyn(r) != "completed") return false;
  return r["paymentPaid"] != true;
}

int? rideTripMinutes(Map<String, dynamic> r) {
  final a = r["tripStartedAt"];
  final b = r["tripCompletedAt"];
  if (a == null || b == null) return null;
  DateTime? s;
  DateTime? e;
  if (a is String) {
    s = DateTime.tryParse(a);
  }
  if (b is String) {
    e = DateTime.tryParse(b);
  }
  if (s == null || e == null || !e.isAfter(s)) return null;
  return e.difference(s).inMinutes;
}

Map<String, double> rideFareBreakdown(Map<String, dynamic> r) {
  double toD(dynamic v) {
    final n = num.tryParse("${v ?? 0}");
    return n?.toDouble() ?? 0;
  }

  final total = toD(r["fare"]);
  final base = toD(r["estimatedFare"]);
  var discount = 0.0;
  if (base > total) discount = double.parse((base - total).toStringAsFixed(2));
  return {"baseFare": base, "discount": discount, "total": total};
}

String _stDyn(dynamic r) => "${r["status"] ?? ""}".toLowerCase();

const String kDriverMatchingExplainer =
    "Eligible drivers are online, approved, and sharing GPS. We don’t show a list—Transitely offers your trip to the nearest match first. Names appear after a driver accepts.";
