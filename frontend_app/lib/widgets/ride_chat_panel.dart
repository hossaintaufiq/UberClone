import "package:flutter/material.dart";
import "package:socket_io_client/socket_io_client.dart" as io;

import "../core/app_config.dart";
import "../services/ride_chat_service.dart";

/// Live rider ↔ driver chat: REST + Socket.IO `ride:chat:message` (room `join:ride`).
class RideChatPanel extends StatefulWidget {
  final String rideId;
  final String tokenPref;
  /// Driver sees own messages on the right; rider the same with [isDriver] = false.
  final bool isDriver;

  const RideChatPanel({
    super.key,
    required this.rideId,
    required this.tokenPref,
    required this.isDriver,
  });

  @override
  State<RideChatPanel> createState() => _RideChatPanelState();
}

class _RideChatRow {
  final String id;
  final bool fromDriver;
  final String text;
  final DateTime? at;

  _RideChatRow({required this.id, required this.fromDriver, required this.text, this.at});

  static _RideChatRow? fromJson(Map<String, dynamic> j) {
    final id = "${j["_id"] ?? ""}".trim();
    if (id.isEmpty) return null;
    final role = "${j["senderRole"] ?? ""}";
    final fromDriver = role == "driver";
    DateTime? at;
    final raw = j["createdAt"];
    if (raw is String) {
      at = DateTime.tryParse(raw);
    } else if (raw != null) {
      at = DateTime.tryParse(raw.toString());
    }
    return _RideChatRow(
      id: id,
      fromDriver: fromDriver,
      text: "${j["message"] ?? ""}",
      at: at,
    );
  }
}

class _RideChatPanelState extends State<RideChatPanel> {
  final _scroll = ScrollController();
  final _input = TextEditingController();
  io.Socket? _socket;
  List<_RideChatRow> _rows = [];
  bool _loading = true;
  bool _sending = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  @override
  void didUpdateWidget(covariant RideChatPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.rideId != widget.rideId) {
      _bootstrap();
    }
  }

  Future<void> _bootstrap() async {
    await _loadHistory();
    _connectSocket();
  }

  Future<void> _loadHistory() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await RideChatService.fetchMessages(widget.rideId, tokenPref: widget.tokenPref);
      if (!mounted) return;
      final rows = <_RideChatRow>[];
      for (final m in list) {
        final r = _RideChatRow.fromJson(m);
        if (r != null) rows.add(r);
      }
      setState(() => _rows = rows);
    } catch (e) {
      if (mounted) setState(() => _error = "$e");
    } finally {
      if (mounted) setState(() => _loading = false);
      _scrollToEnd();
    }
  }

  void _connectSocket() {
    _socket?.dispose();
    final uri = AppConfig.baseUrl;
    final s = io.io(
      uri,
      io.OptionBuilder().setTransports(["websocket", "polling"]).enableAutoConnect().build(),
    );
    _socket = s;
    s.onConnect((_) {
      s.emit("join:ride", widget.rideId);
    });
    s.on("ride:chat:message", (data) {
      if (data is! Map) return;
      final map = Map<String, dynamic>.from(data);
      final rid = "${map["rideId"] ?? ""}";
      if (rid != widget.rideId) return;
      final msg = map["message"];
      if (msg is! Map) return;
      final row = _RideChatRow.fromJson(Map<String, dynamic>.from(msg));
      if (row == null) return;
      if (!mounted) return;
      setState(() {
        if (_rows.any((x) => x.id == row.id)) return;
        _rows = [..._rows, row];
      });
      _scrollToEnd();
    });
    if (s.connected) {
      s.emit("join:ride", widget.rideId);
    }
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scroll.hasClients) return;
      _scroll.animateTo(
        _scroll.position.maxScrollExtent + 80,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      final list = await RideChatService.sendMessage(widget.rideId, text, tokenPref: widget.tokenPref);
      if (!mounted) return;
      final rows = <_RideChatRow>[];
      for (final m in list) {
        final r = _RideChatRow.fromJson(m);
        if (r != null) rows.add(r);
      }
      setState(() => _rows = rows);
      _input.clear();
      _scrollToEnd();
    } catch (e) {
      if (mounted) setState(() => _error = "$e");
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  bool _isMine(_RideChatRow r) => widget.isDriver ? r.fromDriver : !r.fromDriver;

  @override
  void dispose() {
    _socket?.dispose();
    _socket = null;
    _scroll.dispose();
    _input.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final accent = widget.isDriver ? const Color(0xFF34C759) : const Color(0xFF007AFF);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Icon(Icons.chat_bubble_outline_rounded, size: 20, color: accent),
            const SizedBox(width: 8),
            Text(
              widget.isDriver ? "Chat with rider" : "Chat with driver",
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: accent),
            ),
            if (_loading) ...[
              const SizedBox(width: 10),
              const SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ],
          ],
        ),
        if (_error != null) ...[
          const SizedBox(height: 8),
          Text(_error!, style: const TextStyle(color: Color(0xFFFF3B30), fontSize: 12, fontWeight: FontWeight.w600)),
        ],
        const SizedBox(height: 10),
        Container(
          constraints: const BoxConstraints(maxHeight: 260),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: _rows.isEmpty && !_loading
              ? const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    "No messages yet.",
                    style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                  ),
                )
              : ListView.builder(
                  controller: _scroll,
                  shrinkWrap: true,
                  padding: const EdgeInsets.all(10),
                  itemCount: _rows.length,
                  itemBuilder: (_, i) {
                    final m = _rows[i];
                    final mine = _isMine(m);
                    final time = m.at != null
                        ? TimeOfDay.fromDateTime(m.at!.toLocal()).format(context)
                        : "";
                    return Align(
                      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.78),
                        decoration: BoxDecoration(
                          color: mine ? accent : Colors.white,
                          borderRadius: BorderRadius.circular(14).copyWith(
                            bottomRight: mine ? const Radius.circular(4) : null,
                            bottomLeft: !mine ? const Radius.circular(4) : null,
                          ),
                          border: mine ? null : Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: mine
                              ? [BoxShadow(color: accent.withValues(alpha: 0.25), blurRadius: 8, offset: const Offset(0, 2))]
                              : null,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              m.text,
                              style: TextStyle(
                                color: mine ? Colors.white : const Color(0xFF1C2731),
                                fontWeight: FontWeight.w600,
                                height: 1.25,
                              ),
                            ),
                            if (time.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                time,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: mine ? Colors.white.withValues(alpha: 0.85) : const Color(0xFF94A3B8),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _input,
                minLines: 1,
                maxLines: 3,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _send(),
                decoration: InputDecoration(
                  hintText: widget.isDriver ? "Message rider…" : "Message driver…",
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(999), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(999), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(999),
                    borderSide: BorderSide(color: accent, width: 1.5),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            FilledButton(
              onPressed: _sending || _loading ? null : _send,
              style: FilledButton.styleFrom(
                backgroundColor: accent,
                padding: const EdgeInsets.all(14),
                shape: const CircleBorder(),
              ),
              child: _sending
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.send_rounded, size: 20),
            ),
          ],
        ),
      ],
    );
  }
}
