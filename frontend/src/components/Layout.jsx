import SiteFooter from './SiteFooter'

export default function Layout({ title, subtitle, actions, children }) {
  return (
    <main className="min-h-screen bg-[#edf3f9] px-4 py-6 text-[#1e2a35] md:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 rounded-2xl border border-[#d9e3ec] bg-white px-5 py-5 shadow-[0_10px_26px_rgba(14,47,74,0.08)]">
          <div className="flex flex-col gap-3 text-left md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="m-0 text-3xl font-bold text-[#18242f] md:text-4xl">{title}</h1>
              <p className="mt-2 text-sm text-[#607282] md:text-base">{subtitle}</p>
            </div>
            {actions}
          </div>
        </header>
        {children}
      </div>
      <SiteFooter />
    </main>
  )
}
