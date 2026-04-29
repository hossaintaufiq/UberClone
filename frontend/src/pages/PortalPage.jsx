import Layout from '../components/Layout'
import { StatCard } from '../components/Ui'

export default function PortalPage() {
  return (
    <Layout title="Driver / Admin Portal" subtitle="Operations overview for live transit metrics.">
      <div className="mb-5 rounded-2xl border border-[#d9e3ec] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(14,47,74,0.06)]">
        <p className="m-0 text-sm text-[#5f7181]">Monitor operations, fleet availability, and revenue performance from a single dashboard panel.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="Drivers Online" value={32} />
        <StatCard label="Active Rides" value={118} />
        <StatCard label="Revenue (Today)" value="BDT 128,450" />
      </div>
    </Layout>
  )
}
