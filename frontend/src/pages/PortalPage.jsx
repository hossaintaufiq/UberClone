import Layout from '../components/Layout'
import { StatCard } from '../components/Ui'
import { Link } from 'react-router-dom'

export default function PortalPage() {
  return (
    <Layout title="Driver / Admin Portal" subtitle="Operations overview for live transit metrics.">
      <div className="mb-5 rounded-2xl border border-[#d9e3ec] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(14,47,74,0.06)]">
        <p className="m-0 text-sm text-[#5f7181]">Monitor operations, fleet availability, and revenue performance from a single dashboard panel.</p>
      </div>
      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Link to="/admin/dashboard" className="rounded-xl bg-[#36a7e6] px-4 py-3 text-center text-sm font-semibold text-white no-underline shadow-[0_10px_18px_rgba(54,167,230,0.26)] transition-colors hover:bg-[#2898d9]">
          Open Admin Dashboard
        </Link>
        <Link to="/driver/login" className="rounded-xl border border-[#c7dcec] bg-white px-4 py-3 text-center text-sm font-semibold text-[#2a5f80] no-underline transition-colors hover:border-[#36a7e6] hover:text-[#2a95d2]">
          Open Driver Dashboard
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="Drivers Online" value={32} />
        <StatCard label="Active Rides" value={118} />
        <StatCard label="Revenue (Today)" value="BDT 128,450" />
      </div>
    </Layout>
  )
}
