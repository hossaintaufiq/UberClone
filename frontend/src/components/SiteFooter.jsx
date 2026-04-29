export default function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-[#d7e0ea] bg-white">
      <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-8 md:grid-cols-4">
        <div>
          <p className="m-0 text-lg font-bold text-[#22303c]">Transitely Bangladesh</p>
          <p className="mt-2 text-sm text-[#6c7c8d]">Nationwide digital transit infrastructure for riders, operators, and regulators.</p>
          <span className="mt-4 inline-flex rounded-full bg-[#d8f4e6] px-4 py-1 text-xs font-bold text-[#2c9463]">SYSTEMS NOMINAL</span>
        </div>

        <div>
          <p className="m-0 text-sm font-semibold text-[#243340]">Platform</p>
          <div className="mt-3 space-y-2 text-sm text-[#607282]">
            <a href="#" className="block">Operations Dashboard</a>
            <a href="#" className="block">Fleet Intelligence</a>
            <a href="#" className="block">Rider Services</a>
            <a href="#" className="block">Incident Center</a>
          </div>
        </div>

        <div>
          <p className="m-0 text-sm font-semibold text-[#243340]">Governance</p>
          <div className="mt-3 space-y-2 text-sm text-[#607282]">
            <a href="#" className="block">Privacy &amp; Data</a>
            <a href="#" className="block">Legal Terms</a>
            <a href="#" className="block">Audit Logs</a>
            <a href="#" className="block">Accessibility</a>
          </div>
        </div>

        <div>
          <p className="m-0 text-sm font-semibold text-[#243340]">Contact</p>
          <div className="mt-3 space-y-2 text-sm text-[#607282]">
            <p className="m-0">Support: +880 9610-TRANSIT</p>
            <p className="m-0">Email: support@transitely.com</p>
            <p className="m-0">Dhaka Control Tower, Bangladesh</p>
          </div>
        </div>
      </div>
      <div className="border-t border-[#e1e8ef]">
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs text-[#708294]">
          <p className="m-0">© 2026 Fluid Transit Framework. Managed by Ministry of Transport.</p>
          <p className="m-0">Version 4.2.0 · Secure session verified</p>
        </div>
      </div>
    </footer>
  )
}
