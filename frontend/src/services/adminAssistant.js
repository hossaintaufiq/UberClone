/** Rule-based admin copilot: navigation + portal guidance (no external API). */

export const ADMIN_NAV = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    keys: ['dashboard', 'home', 'overview', 'summary', 'stats', 'main screen', 'landing'],
  },
  {
    path: '/admin/riders',
    label: 'Manage Users',
    keys: ['rider', 'riders', 'user', 'users', 'passenger', 'passengers', 'customer', 'customers', 'manage user'],
  },
  {
    path: '/admin/drivers',
    label: 'Manage Drivers',
    keys: ['driver', 'drivers', 'fleet', 'captain', 'captains', 'manage driver', 'fleet management'],
  },
  {
    path: '/admin/rides',
    label: 'Ride Monitor',
    keys: ['ride', 'rides', 'trip', 'trips', 'monitor', 'live ride', 'tracking', 'global ride'],
  },
  {
    path: '/admin/payments',
    label: 'Payments & Fare',
    keys: ['payment', 'payments', 'revenue', 'wallet', 'financial', 'money', 'fare settings', 'billing'],
  },
  {
    path: '/admin/promocodes',
    label: 'Promo Codes',
    keys: ['promo', 'promotion', 'promotions', 'coupon', 'coupons', 'discount', 'promocode', 'promo code'],
  },
  {
    path: '/admin/analytics',
    label: 'Analytics',
    keys: ['analytics', 'report', 'reports', 'chart', 'charts', 'insights', 'metrics'],
  },
]

const HELP_TEXT = `**What I can do**
• **Navigate** — Say things like “open drivers”, “go to payments”, “show analytics”.
• **Orient you** — Ask “where am I?” or “what’s on this page?”

**Sections**
• **Dashboard** — High-level counts and quick links.
• **Manage Users** — Riders / passengers; suspend or activate accounts.
• **Manage Drivers** — Approve drivers, verify documents, toggle availability.
• **Ride Monitor** — Recent rides and statuses.
• **Payments & Fare** — Revenue view and fare-related operations.
• **Promo Codes** — Create and manage discount codes.
• **Analytics** — Trends and reporting widgets.

Use the sidebar anytime; I’m here for voice-style shortcuts and reminders.`

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function containsNavIntent(q) {
  const openWords = ['open', 'go to', 'goto', 'show', 'navigate', 'take me', 'switch to', 'visit', 'jump']
  let stripped = q
  for (const w of openWords) {
    stripped = stripped.split(w).join(' ')
  }
  return stripped.trim() || q
}

export function processAdminMessage(raw, currentPath) {
  const q = normalize(raw)
  if (!q) {
    return { reply: 'Try: **open dashboard**, **drivers**, **payments**, or type **help**.' }
  }

  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening))\b/.test(q)) {
    return {
      reply: `Hi! You’re on **${prettyPath(currentPath)}**. Tell me where to go (e.g. **promo codes**, **ride monitor**) or ask **help**.`,
    }
  }

  if (q.includes('where am i') || q.includes('current page')) {
    return { reply: `You’re on **${prettyPath(currentPath)}**. Say another section name and I’ll open it.` }
  }

  if (q.includes('thank')) {
    return { reply: 'You’re welcome — anything else you need in the portal?' }
  }

  if (/^(help|commands|\?)$/.test(q) || q.includes('what can you') || q.includes('how do i')) {
    return { reply: HELP_TEXT }
  }

  if (q.includes('logout') || q.includes('sign out') || q.includes('log out')) {
    return {
      reply: 'Use **Logout** at the bottom of the sidebar to exit the admin portal (same as always).',
    }
  }

  const search = containsNavIntent(q)

  for (const nav of ADMIN_NAV) {
    if (nav.keys.some((k) => search.includes(k) || q.includes(k))) {
      return {
        reply:
          currentPath === nav.path
            ? `You’re already on **${nav.label}**. Need something else? Try **help**.`
            : `Opening **${nav.label}**…`,
        navigate: currentPath === nav.path ? undefined : nav.path,
      }
    }
  }

  if (q.includes('sidebar') || q.includes('menu') || q.includes('navigation')) {
    return {
      reply:
        'The **sidebar** lists every admin section. On mobile, tap the **menu** icon (top left) to open it. You can also ask me to open a page by name.',
    }
  }

  return {
    reply:
      'I’m not sure what you mean. Try **open drivers**, **payments**, **promo codes**, or **analytics**. Type **help** for the full list.',
  }
}

function prettyPath(path) {
  const hit = ADMIN_NAV.find((n) => n.path === path)
  return hit ? hit.label : path || 'Admin'
}
