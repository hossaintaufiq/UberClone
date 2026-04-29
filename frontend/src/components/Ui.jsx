export function Card({ title, actions, children }) {
  return (
    <section className="rounded-2xl border border-[#d9e3ec] bg-white p-5 shadow-[0_8px_20px_rgba(14,47,74,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1d2a35]">{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  )
}

export function ListCard({ title, items, render, empty }) {
  return <Card title={title}>{items.length ? <div className="grid gap-2">{items.map((item, idx) => <div key={item._id || item.id || idx}>{render(item)}</div>)}</div> : <Empty text={empty} />}</Card>
}

export function StatCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-[#d9e3ec] bg-white p-5 shadow-[0_8px_20px_rgba(14,47,74,0.06)]">
      <p className="text-xs uppercase tracking-wider text-[#6f8191]">{label}</p>
      <h3 className="mt-1 text-3xl font-bold text-[#1b2a36]">{value}</h3>
    </article>
  )
}

export function RideItem({ ride }) {
  return (
    <article className="grid gap-2 rounded-xl border border-[#d9e3ec] bg-[#f9fcff] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-[#1f2d39]">{ride.pickupAddress || ride.pickup_address || 'Pickup'} to {ride.dropoffAddress || ride.dropoff_address || 'Dropoff'}</p>
        <span className="rounded-full bg-[#d9eef9] px-2 py-1 text-xs font-bold capitalize text-[#0f6d9b]">{ride.status || 'unknown'}</span>
      </div>
      <p className="text-sm text-[#607281]">Fare: BDT {Number(ride.fare || ride.final_fare || ride.estimated_fare || 0).toLocaleString()}</p>
    </article>
  )
}

export function PaymentItem({ payment }) {
  return (
    <article className="rounded-xl border border-[#d9e3ec] bg-[#f9fcff] p-4">
      <p className="font-semibold text-[#1f2d39]">BDT {Number(payment.amount || 0).toLocaleString()}</p>
      <p className="text-sm text-[#607281]">{(payment.method || 'cash').toUpperCase()} / {payment.status || 'pending'}</p>
    </article>
  )
}

export function NotificationItem({ item }) {
  return (
    <article className="rounded-xl border border-[#d9e3ec] bg-[#f9fcff] p-4">
      <p className="font-semibold text-[#1f2d39]">{item.title || 'Notification'}</p>
      <p className="text-sm text-[#607281]">{item.message || ''}</p>
    </article>
  )
}

export function ProfileGrid({ profile }) {
  const rows = [
    ['Name', profile.name || profile.full_name || 'Rider'],
    ['Email', profile.email || 'Not set'],
    ['Phone', profile.phone || 'Not set'],
    ['Status', profile.status || 'active'],
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {rows.map(([k, v]) => (
        <div key={k} className="rounded-lg border border-[#d9e3ec] bg-[#f9fcff] p-3">
          <p className="text-xs text-[#6f8191]">{k}</p>
          <p className="font-semibold text-[#1f2d39]">{v}</p>
        </div>
      ))}
    </div>
  )
}

export function Empty({ text }) {
  return <div className="rounded-lg border border-dashed border-[#c5d3e1] bg-[#f7fbff] p-4 text-[#6b7d8d]">{text}</div>
}

export function Field(props) {
  return <input {...props} className="h-11 rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 text-[#1f2e3a] outline-none focus:border-[#1092ce]" />
}
