import { Link } from 'react-router-dom'
import { ShieldCheck, Car, ArrowRight, ArrowLeft } from 'lucide-react'

export default function PortalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf3f9] selection:bg-[#007AFF]/20 selection:text-[#007AFF] px-4 py-12 sm:px-8">
      
      <div className="relative w-full max-w-[800px]">
        
        {/* Floating Return Button */}
        <Link to="/" className="group absolute -top-16 left-0 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-[#607282] shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:bg-[#007AFF] hover:text-white">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Return to Main Site
        </Link>

        <div className="overflow-hidden rounded-[3rem] bg-white shadow-[0_20px_80px_rgba(14,47,74,0.08)] ring-1 ring-[#d9e3ec]">
          
          {/* Header Area */}
          <div className="relative overflow-hidden bg-[#1c2731] px-10 pb-16 pt-16 text-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="absolute -left-10 -top-20 h-64 w-64 rounded-full bg-[#007AFF] opacity-30 blur-[80px]"></div>
            
            <div className="relative z-10">
              <h1 className="text-4xl font-black text-white sm:text-5xl">Transitely Portals</h1>
              <p className="mx-auto mt-4 max-w-md text-[16px] font-medium leading-relaxed text-[#a0b0c0]">
                Select your secure gateway to access fleet tools or system administration panels.
              </p>
            </div>
          </div>

          <div className="relative z-20 -mt-10 px-6 pb-12 sm:px-10">
            <div className="grid gap-6 sm:grid-cols-2">
              
              {/* Driver Portal Card */}
              <Link to="/driver/login" className="group relative overflow-hidden rounded-[2rem] bg-white p-8 text-left shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,122,255,0.12)] hover:ring-[#007AFF]/30">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-[2.5]"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 grid h-16 w-16 place-items-center rounded-[1.2rem] bg-gradient-to-tr from-[#007AFF] to-[#0062CC] text-white shadow-[0_8px_20px_rgba(0,122,255,0.4)]">
                    <Car size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-[#1c2731] transition-colors group-hover:text-[#007AFF]">Captain Portal</h2>
                  <p className="mt-2 text-[14px] font-medium text-[#607282]">Access your driver dashboard, manage documents, and track your daily earnings.</p>
                  
                  <div className="mt-8 flex items-center gap-2 text-[13px] font-black uppercase tracking-widest text-[#007AFF]">
                    Enter Portal <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>

              {/* Admin Portal Card */}
              <Link to="/admin/login" className="group relative overflow-hidden rounded-[2rem] bg-white p-8 text-left shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(28,39,49,0.12)] hover:ring-[#1c2731]/30">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-100 transition-transform duration-500 group-hover:scale-[2.5]"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 grid h-16 w-16 place-items-center rounded-[1.2rem] bg-[#1c2731] text-white shadow-[0_8px_20px_rgba(28,39,49,0.3)]">
                    <ShieldCheck size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-[#1c2731] transition-colors group-hover:text-[#1c2731]">System Admin</h2>
                  <p className="mt-2 text-[14px] font-medium text-[#607282]">Monitor live traffic, resolve disputes, and configure global platform algorithms.</p>
                  
                  <div className="mt-8 flex items-center gap-2 text-[13px] font-black uppercase tracking-widest text-[#1c2731]">
                    Enter Control Center <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>

            </div>
          </div>
          
        </div>
        
        <div className="mt-8 text-center text-[13px] font-medium text-[#8a9aab]">
          Transitely Secure Systems © {new Date().getFullYear()}
        </div>
      </div>
    </main>
  )
}
