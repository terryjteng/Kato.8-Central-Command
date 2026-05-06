import { SignUp } from '@clerk/nextjs'

const APPEARANCE = {
  variables: {
    colorPrimary: '#7c3aed',
    colorBackground: '#1e2942',
    colorText: '#f1f5f9',
    colorInputBackground: '#232d47',
    colorInputText: '#f1f5f9',
  },
  elements: {
    card: 'shadow-2xl border border-white/10',
    headerTitle: 'text-slate-100',
    headerSubtitle: 'text-slate-400',
    formFieldLabel: 'text-slate-300',
    footerActionLink: 'text-violet-400 hover:text-violet-300',
  },
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a2035' }}>
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kato8-icon.png" alt="Kato.8 Studios" width={64} height={64} className="rounded-2xl" style={{ boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }} />
          <div className="text-center">
            <div className="text-white font-semibold text-xl">Kato.8 Studios</div>
            <div className="text-slate-400 text-sm">Central Command</div>
          </div>
        </div>
        <SignUp appearance={APPEARANCE} />
      </div>
    </div>
  )
}
