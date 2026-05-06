import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#0f1629' }}
    >
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, #7c3aed 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex items-center justify-center rounded-2xl text-white font-bold text-3xl"
            style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 16px 48px rgba(124,58,237,0.5)' }}
          >
            K8
          </div>
          <div>
            <div className="text-white font-bold text-3xl tracking-tight">Kato.8 Studios</div>
            <div className="text-slate-400 text-base mt-1 font-medium tracking-widest uppercase text-sm">
              Central Command
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-slate-400 text-base max-w-sm leading-relaxed">
          One login. Every tool. Built for the studio.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/sign-in"
            className="px-8 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 24px rgba(124,58,237,0.4)' }}
          >
            Sign in to the studio
          </Link>
          <Link
            href="/sign-up"
            className="px-8 py-3 text-sm font-semibold text-slate-400 rounded-xl border border-white/10 hover:border-white/20 hover:text-slate-200 transition-all"
          >
            Create account
          </Link>
        </div>

        {/* Tool pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-lg">
          {['Scheduler', 'HR Tool', 'Social Media Dash', 'Video Editor', 'Executive Assistant', 'Legal Agent'].map(t => (
            <span key={t} className="text-xs text-slate-500 border border-white/10 rounded-full px-3 py-1">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
