import "package:flutter/material.dart";

import "../core/app_theme.dart";

typedef AssistantJump = void Function(String target);

/// Rule-based navigation assistant (matches web admin/driver assistants).
class NavAssistantSheet extends StatefulWidget {
  final String title;
  final String accentLabel;
  final Color accent;
  final List<({String id, String label})> quickLinks;
  final String helpText;
  final AssistantJump onJump;

  const NavAssistantSheet({
    super.key,
    required this.title,
    required this.accentLabel,
    required this.accent,
    required this.quickLinks,
    required this.helpText,
    required this.onJump,
  });

  static Future<void> show(
    BuildContext context, {
    required String title,
    required String accentLabel,
    required Color accent,
    required List<({String id, String label})> quickLinks,
    required String helpText,
    required AssistantJump onJump,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(ctx).bottom),
        child: NavAssistantSheet(
          title: title,
          accentLabel: accentLabel,
          accent: accent,
          quickLinks: quickLinks,
          helpText: helpText,
          onJump: onJump,
        ),
      ),
    );
  }

  @override
  State<NavAssistantSheet> createState() => _NavAssistantSheetState();
}

class _NavAssistantSheetState extends State<NavAssistantSheet> {
  final _ctrl = TextEditingController();
  final _msgs = <({bool user; String text})>[];
  final _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _msgs.add((user: false, text: "Say **open** + a section name, or tap a shortcut below. Type **help** for tips."));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _reply(String text, {String? jump}) {
    setState(() => _msgs.add((user: false, text: text)));
    if (jump != null) {
      widget.onJump(jump);
      Navigator.pop(context);
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) _scroll.jumpTo(_scroll.position.maxScrollExtent);
    });
  }

  void _handle(String raw) {
    final q = raw.toLowerCase().trim();
    if (q.isEmpty) return;
    setState(() => _msgs.add((user: true, text: raw)));

    if (q == "help" || q.contains("what can")) {
      _reply(widget.helpText);
      return;
    }
    if (q.contains("thank")) {
      _reply("Glad to help!");
      return;
    }

    for (final link in widget.quickLinks) {
      final slug = link.label.toLowerCase();
      final id = link.id;
      if (q.contains(slug.split(" ").first) || q.contains(id.replaceAll("_", " "))) {
        _reply("Opening **${link.label}**…", jump: id);
        return;
      }
    }

    _reply("Try a shortcut chip or say **help**.");
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height * 0.72),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 10),
          Container(width: 44, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(99))),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 8, 8),
            child: Row(
              children: [
                CircleAvatar(backgroundColor: widget.accent, child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 20)),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(widget.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                    Text(widget.accentLabel, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: widget.accent)),
                  ]),
                ),
                IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close_rounded)),
              ],
            ),
          ),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ...widget.quickLinks.map(
                (l) => ActionChip(
                  label: Text(l.label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  onPressed: () => _handle("open ${l.label}"),
                  backgroundColor: widget.accent.withOpacity(0.12),
                  side: BorderSide.none,
                ),
              ),
              ActionChip(
                label: const Text("Help", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                onPressed: () => _handle("help"),
                backgroundColor: const Color(0xFFE8F4FD),
              ),
            ],
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView.builder(
              controller: _scroll,
              padding: const EdgeInsets.all(16),
              itemCount: _msgs.length,
              itemBuilder: (_, i) {
                final m = _msgs[i];
                return Align(
                  alignment: m.user ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.82),
                    decoration: BoxDecoration(
                      color: m.user ? widget.accent : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16).copyWith(
                        bottomRight: m.user ? const Radius.circular(4) : null,
                        bottomLeft: !m.user ? const Radius.circular(4) : null,
                      ),
                      border: Border.all(color: m.user ? Colors.transparent : kCardBorder),
                    ),
                    child: Text(
                      m.text.replaceAll("**", ""),
                      style: TextStyle(color: m.user ? Colors.white : kText, fontWeight: FontWeight.w600, height: 1.35),
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(12, 0, 12, 12 + MediaQuery.paddingOf(context).bottom),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _ctrl,
                    decoration: InputDecoration(
                      hintText: "Try: open dashboard…",
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kCardBorder)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: kCardBorder)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: widget.accent)),
                    ),
                    onSubmitted: (v) {
                      _handle(v);
                      _ctrl.clear();
                    },
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: () {
                    _handle(_ctrl.text);
                    _ctrl.clear();
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: widget.accent,
                    shape: const CircleBorder(),
                    padding: const EdgeInsets.all(14),
                  ),
                  child: const Icon(Icons.send_rounded, color: Colors.white, size: 22),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
