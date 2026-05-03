/** Rule-based driver copilot: navigation + fleet-app guidance (no external API). */

export const DRIVER_NAV = [
  {
    path: '/driver/dashboard',
    label: 'Dashboard',
    keys: ['dashboard', 'home', 'overview', 'main', 'summary', 'welcome'],
  },
  {
    path: '/driver/incoming',
    label: 'Incoming Rides',
    keys: ['incoming', 'request', 'requests', 'offer', 'offers', 'new ride', 'pending', 'available rides'],
  },
  {
    path: '/driver/trip',
    label: 'Current Trip',
    keys: ['trip', 'current trip', 'active trip', 'ongoing', 'navigate', 'now riding', 'pickup'],
  },
  {
    path: '/driver/history',
    label: 'Ride History',
    keys: ['history', 'past', 'completed', 'previous rides', 'old rides'],
  },
  {
    path: '/driver/payments',
    label: 'Earnings',
    keys: ['payment', 'payments', 'earning', 'earnings', 'wallet', 'payout', 'money', 'balance'],
  },
  {
    path: '/driver/profile',
    label: 'Profile',
    keys: ['profile', 'account', 'settings', 'my info', 'documents', 'personal'],
  },
]

const HELP_TEXT = `**What I can do**
• **Navigate** — Say “open incoming”, “go to earnings”, “current trip”, etc.
• **Orient you** — Ask **where am I?** or read the tips below.

**Screens**
• **Dashboard** — Go **online / offline** and see today’s stats.
• **Incoming Rides** — View and respond to new ride offers near you.
• **Current Trip** — Active ride details while you’re on a job.
• **Ride History** — Completed trips list.
• **Earnings** — Payments and totals overview.
• **Profile** — Your driver profile and account info.

**Tips**
• Turn **online** from the Dashboard when you’re ready to receive requests.
• Use **Logout** (top right) to sign out safely.

Ask me to open any section by name.`

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripOpenVerbs(q) {
  const openWords = ['open', 'go to', 'goto', 'show', 'navigate', 'take me', 'switch to', 'visit', 'jump']
  let stripped = q
  for (const w of openWords) {
    stripped = stripped.split(w).join(' ')
  }
  return stripped.trim() || q
}

export function processDriverMessage(raw, currentPath) {
  const q = normalize(raw)
  if (!q) {
    return { reply: 'Try: **open dashboard**, **incoming rides**, **earnings**, or type **help**.' }
  }

  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening))\b/.test(q)) {
    return {
      reply: `Hi! You’re on **${prettyPath(currentPath)}**. Say **incoming**, **trip**, or **help** anytime.`,
    }
  }

  if (q.includes('where am i') || q.includes('current page')) {
    return { reply: `You’re on **${prettyPath(currentPath)}**. Tell me another screen to open.` }
  }

  if (q.includes('thank')) {
    return { reply: 'Glad to help — drive safe!' }
  }

  if (/^(help|commands|\?)$/.test(q) || q.includes('what can you') || q.includes('how do i')) {
    return { reply: HELP_TEXT }
  }

  if (q.includes('online') || q.includes('offline') || q.includes('go live')) {
    return {
      reply:
        'Toggle **Go Online / Go Offline** on the **Dashboard**. When online, you can receive offers — check **Incoming Rides**.',
      navigate: currentPath === '/driver/dashboard' ? undefined : '/driver/dashboard',
    }
  }

  if (q.includes('logout') || q.includes('sign out') || q.includes('log out')) {
    return {
      reply: 'Tap **Logout** in the top-right of the driver app header.',
    }
  }

  const search = stripOpenVerbs(q)

  for (const nav of DRIVER_NAV) {
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

  if (q.includes('bottom menu') || q.includes('tab bar') || q.includes('navigation')) {
    return {
      reply:
        'On mobile you have **tabs** at the bottom for quick jumps; on desktop use the **top navigation bar**. I can also open screens by name.',
    }
  }

  return {
    reply:
      'Not sure I understood. Try **dashboard**, **incoming**, **current trip**, **history**, **earnings**, or **profile**. Type **help** for more.',
  }
}

function prettyPath(path) {
  const hit = DRIVER_NAV.find((n) => n.path === path)
  return hit ? hit.label : path || 'Driver app'
}
