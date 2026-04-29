import { useState } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../components/SiteFooter'

const networkStats = [
  { label: 'Daily Trips Processed', value: '84,200+' },
  { label: 'Connected Vehicles', value: '12,480' },
  { label: 'Active City Corridors', value: '146' },
  { label: 'Emergency Response SLA', value: '< 3 min' },
]

const serviceCards = [
  {
    title: 'Fleet Command Center',
    description: 'Real-time dispatching, route health, and vehicle utilization analytics for city-scale operations.',
  },
  {
    title: 'Digital Rider Services',
    description: 'Unified rider onboarding, booking, payment, and support with secure identity controls.',
  },
  {
    title: 'Compliance & Safety',
    description: 'Automated logs, audit-ready reports, and policy checks for transport authority requirements.',
  },
]

const timeline = [
  { time: '06:00 AM', event: 'Morning demand forecast and driver heatmap synced' },
  { time: '09:30 AM', event: 'Peak-hour control room intervention completed' },
  { time: '01:00 PM', event: 'Midday payment reconciliation and fraud scan' },
  { time: '05:45 PM', event: 'Evening fleet balancing across major zones' },
]

const riderOnboardingSteps = [
  { step: '01', title: 'Create Rider Account', description: 'Open Rider Registration, enter your basic details, and submit securely.' },
  { step: '02', title: 'Verify and Sign In', description: 'Use your registered credentials to sign in from Rider Login instantly.' },
  { step: '03', title: 'Request Your First Ride', description: 'Set pickup and destination in Rider App, confirm fare, and track driver live.' },
]

const usageTips = [
  'Use exact pickup landmarks to reduce wait time.',
  'Keep location access on for better driver matching.',
  'Choose your preferred payment method before booking.',
  'Check ride history for receipts and support issues.',
]

const routeDemand = [
  { zone: 'Dhaka North', trips: '18.2k', width: 'w-[88%]' },
  { zone: 'Dhaka South', trips: '14.6k', width: 'w-[72%]' },
  { zone: 'Chattogram', trips: '10.9k', width: 'w-[56%]' },
  { zone: 'Sylhet', trips: '7.8k', width: 'w-[42%]' },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#edf3f9] text-[#1c2731]">
      <header className="sticky top-3 z-50 px-4">
        <div className="mx-auto mt-2 flex w-full max-w-7xl items-center justify-between gap-3 rounded-[32px] border border-[#d7e0ea] bg-white/92 px-4 py-3 shadow-[0_12px_32px_rgba(16,47,74,0.1)] backdrop-blur-md sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#0f7db4] text-sm font-bold text-white">T</div>
            <p className="m-0 text-lg font-semibold text-[#16222d]">Transitely</p>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            <Link to="/user/login" className="rounded-full border border-[#bfd4e4] px-4 py-2 text-sm font-semibold text-[#1e445f] no-underline transition-colors hover:border-[#0d6fa3] hover:text-[#0d6fa3]">
              User Login
            </Link>
            <Link to="/user/register" className="rounded-full border border-[#bfd4e4] px-4 py-2 text-sm font-semibold text-[#1e445f] no-underline transition-colors hover:border-[#0d6fa3] hover:text-[#0d6fa3]">
              User Registration
            </Link>
            <Link to="/user/app" className="rounded-full border border-[#bfd4e4] px-4 py-2 text-sm font-semibold text-[#1e445f] no-underline transition-colors hover:border-[#0d6fa3] hover:text-[#0d6fa3]">
              User App
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/admin/dashboard" className="rounded-full bg-[#3aa7e8] px-5 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#2898d9]">
              Admin Dashboard
            </Link>
            <Link to="/driver/login" className="rounded-full border border-[#bfd4e4] px-4 py-2 text-sm font-semibold text-[#1e445f] no-underline transition-colors hover:border-[#2f9edf] hover:text-[#2f9edf]">
              Driver Login
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#c2d6e6] text-[#24506d] md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="mx-auto mt-3 w-full max-w-7xl rounded-3xl border border-[#d7e0ea] bg-white px-4 py-4 shadow-[0_12px_32px_rgba(16,47,74,0.1)] md:hidden">
            <nav className="grid gap-2">
              <Link to="/user/login" onClick={() => setMobileMenuOpen(false)} className="rounded-full border border-[#bfd4e4] px-4 py-2 text-sm font-semibold text-[#1e445f] no-underline">
                User Login
              </Link>
              <Link to="/user/register" onClick={() => setMobileMenuOpen(false)} className="rounded-full border border-[#bfd4e4] px-4 py-2 text-sm font-semibold text-[#1e445f] no-underline">
                User Registration
              </Link>
              <Link to="/user/app" onClick={() => setMobileMenuOpen(false)} className="rounded-full border border-[#bfd4e4] px-4 py-2 text-sm font-semibold text-[#1e445f] no-underline">
                User App
              </Link>
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="rounded-full bg-[#3aa7e8] px-4 py-2 text-center text-sm font-semibold text-white no-underline">
                Admin Dashboard
              </Link>
              <Link to="/driver/login" onClick={() => setMobileMenuOpen(false)} className="rounded-full border border-[#bfd4e4] px-4 py-2 text-center text-sm font-semibold text-[#1e445f] no-underline">
                Driver Login
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <section className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 py-10 sm:px-5 md:grid-cols-[1fr_420px] md:items-center md:gap-10 md:py-12">
        <div>
          <div className="mb-5 inline-flex rounded-full bg-[#cde7f9] px-4 py-1 text-xs font-bold tracking-[0.12em] text-[#2f6690]">
            ENTERPRISE PORTAL
          </div>
          <h1 className="m-0 max-w-[530px] text-4xl font-bold leading-[1.1] text-[#18232d] md:text-5xl md:leading-[1.08]">
            Powering Bangladesh&apos;s <span className="text-[#0f84bf]">Transit</span> Future.
          </h1>
          <p className="mt-5 max-w-[560px] text-lg leading-7 text-[#4f6070] md:mt-6 md:text-xl md:leading-8">
            Access the mission control center for Transitely&apos;s nationwide logistics and public transport infrastructure.
          </p>

          <div className="mt-10 flex flex-wrap gap-8 md:mt-12 md:gap-14">
            <div>
              <p className="m-0 text-4xl font-bold text-[#0e6f9f] md:text-[42px]">99.9%</p>
              <p className="m-0 text-base text-[#58697a]">Uptime SLA</p>
            </div>
            <div>
              <p className="m-0 text-4xl font-bold text-[#0e6f9f] md:text-[42px]">256-bit</p>
              <p className="m-0 text-base text-[#58697a]">AES Encryption</p>
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-[#dfe7ef] bg-white px-7 py-8 shadow-[0_22px_45px_rgba(10,49,77,0.09)]">
          <h2 className="m-0 text-[34px] font-bold text-[#1e2935]">Admin Dashboard Login</h2>
          <p className="mt-3 text-base text-[#607182]">Secure access to the transit management ecosystem</p>

          <div className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold tracking-[0.05em] text-[#6d7f8f]">EMAIL ADDRESS</span>
              <input className="w-full rounded-lg border border-[#d5dee8] bg-[#f5f8fb] px-4 py-3 text-[#8ea0af] outline-none" value="admin@transitely.com" readOnly />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold tracking-[0.05em] text-[#6d7f8f]">PASSWORD</span>
              <input className="w-full rounded-lg border border-[#d5dee8] bg-[#f5f8fb] px-4 py-3 text-[#8ea0af] outline-none" value="••••••••" readOnly />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-[#5f7181]">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 accent-[#127eaf]" />
              Remember this device for 30 days
            </label>
            <a href="#" className="font-semibold text-[#127eaf]">
              Forgot password?
            </a>
          </div>

          <Link to="/portal" className="mt-6 block rounded-full bg-[#1092ce] py-3 text-center text-lg font-semibold text-white no-underline shadow-[0_10px_18px_rgba(16,146,206,0.34)] transition-colors hover:bg-[#0d80b4]">
            Login to Dashboard
          </Link>

          <div className="mt-7 border-t border-[#e6edf3] pt-5 text-center">
            <p className="m-0 text-xs font-bold tracking-[0.14em] text-[#8c9baa]">SECURITY PROTOCOLS</p>
            <p className="mt-2 text-sm text-[#5c6d7d]">Identity verified by Transitely Auth Service</p>
          </div>
        </aside>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-4 sm:px-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {networkStats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-[#d6e1ec] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(14,47,74,0.06)]">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-[#6b7d8d]">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-[#1b2a36]">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 py-6 sm:px-5 md:grid-cols-3">
        {serviceCards.map((service) => (
          <article key={service.title} className="rounded-2xl border border-[#d6e1ec] bg-white p-5 shadow-[0_8px_20px_rgba(14,47,74,0.06)]">
            <h3 className="m-0 text-xl font-bold text-[#1b2a36]">{service.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#5f7181]">{service.description}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-[1180px] gap-5 px-4 py-6 sm:px-5 lg:grid-cols-[1.1fr_1fr]">
        <article className="rounded-2xl border border-[#d6e1ec] bg-white p-6 shadow-[0_8px_20px_rgba(14,47,74,0.06)]">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#6b7d8d]">How To Start</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1b2a36]">How to Sign Up and Use the App</h3>
          <div className="mt-5 grid gap-3">
            {riderOnboardingSteps.map((item) => (
              <div key={item.step} className="flex gap-4 rounded-xl border border-[#d7e3ee] bg-[#f8fbff] p-4">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f84bf] text-xs font-bold text-white">{item.step}</span>
                <div>
                  <p className="m-0 font-semibold text-[#1f2e3a]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#5c6f80]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/user/register" className="mt-5 inline-block rounded-full bg-[#1092ce] px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_10px_18px_rgba(16,146,206,0.24)] hover:bg-[#0d80b4]">
            Start User Registration
          </Link>
        </article>

        <article className="rounded-2xl border border-[#d6e1ec] bg-white p-6 shadow-[0_8px_20px_rgba(14,47,74,0.06)]">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#6b7d8d]">Usage Guide</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1b2a36]">Daily Rider Best Practices</h3>
          <ul className="mt-4 space-y-3">
            {usageTips.map((tip) => (
              <li key={tip} className="flex items-start gap-3 rounded-lg border border-[#deebf6] bg-[#f8fbff] px-3 py-2.5 text-sm text-[#506373]">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#0f84bf]" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-[#0f7db4] p-4 text-white">
            <p className="m-0 text-xs uppercase tracking-[0.1em] text-[#bde7ff]">Rider Completion Rate</p>
            <p className="mt-1 text-3xl font-bold">96.4%</p>
            <p className="m-0 text-sm text-[#e4f6ff]">Successful trip completion across verified riders this month.</p>
          </div>
        </article>
      </section>

      <section className="mx-auto grid w-full max-w-[1180px] gap-5 px-4 py-6 sm:px-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-[#d6e1ec] bg-white p-6 shadow-[0_8px_20px_rgba(14,47,74,0.06)]">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#6b7d8d]">Demand Graph</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1b2a36]">Route Demand by Service Zone</h3>
          <div className="mt-5 space-y-4">
            {routeDemand.map((item) => (
              <div key={item.zone}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#2a3b49]">{item.zone}</span>
                  <span className="text-[#5f7282]">{item.trips} trips</span>
                </div>
                <div className="h-3 rounded-full bg-[#e6eef6]">
                  <div className={`h-3 rounded-full bg-gradient-to-r from-[#17a1df] to-[#0f7db4] ${item.width}`} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#d6e1ec] bg-white p-6 shadow-[0_8px_20px_rgba(14,47,74,0.06)]">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#6b7d8d]">Quick Snapshot</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1b2a36]">Service Health</h3>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#f4f9ff] p-4">
              <p className="m-0 text-xs text-[#6a7d8e]">Avg Pickup Time</p>
              <p className="m-0 mt-1 text-2xl font-bold text-[#1d2d39]">4.2m</p>
            </div>
            <div className="rounded-xl bg-[#f4f9ff] p-4">
              <p className="m-0 text-xs text-[#6a7d8e]">On-time Arrival</p>
              <p className="m-0 mt-1 text-2xl font-bold text-[#1d2d39]">93%</p>
            </div>
            <div className="rounded-xl bg-[#f4f9ff] p-4">
              <p className="m-0 text-xs text-[#6a7d8e]">Support Tickets</p>
              <p className="m-0 mt-1 text-2xl font-bold text-[#1d2d39]">128</p>
            </div>
            <div className="rounded-xl bg-[#f4f9ff] p-4">
              <p className="m-0 text-xs text-[#6a7d8e]">Driver Acceptance</p>
              <p className="m-0 mt-1 text-2xl font-bold text-[#1d2d39]">89%</p>
            </div>
          </div>
        </article>
      </section>

      <section className="mx-auto grid w-full max-w-[1180px] gap-5 px-4 py-6 sm:px-5 md:grid-cols-[1.3fr_1fr]">
        <article className="rounded-2xl border border-[#d6e1ec] bg-white p-6 shadow-[0_8px_20px_rgba(14,47,74,0.06)]">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#6b7d8d]">Operational Timeline</p>
          <h3 className="mt-2 text-2xl font-bold text-[#1b2a36]">Today&apos;s Mobility Operations</h3>
          <div className="mt-5 space-y-4">
            {timeline.map((item) => (
              <div key={item.time} className="flex items-start gap-4">
                <span className="rounded-full bg-[#e3f1fa] px-3 py-1 text-xs font-semibold text-[#0d6fa3]">{item.time}</span>
                <p className="m-0 text-sm text-[#4e6172]">{item.event}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#d6e1ec] bg-[#0f7db4] p-6 text-white shadow-[0_10px_24px_rgba(12,73,111,0.28)]">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#bde7ff]">System Trust</p>
          <h3 className="mt-2 text-2xl font-bold">Built for Public-Scale Reliability</h3>
          <p className="mt-3 text-sm leading-6 text-[#e6f6ff]">
            Transitely delivers secure APIs, live monitoring, and auditable event pipelines for ministries, city operators, and enterprise partners.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-[#eaf8ff]">
            <li>ISO-aligned data protection workflow</li>
            <li>24/7 operations center oversight</li>
            <li>Transparent governance and reporting</li>
          </ul>
        </article>
      </section>

      <SiteFooter />
    </main>
  )
}
