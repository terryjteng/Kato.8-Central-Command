'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { TOOLS } from '@/lib/tools'
import { getUserRole, ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'
import ToolCard from '@/components/ToolCard'
import Sidebar from '@/components/Sidebar'

function PendingApproval({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center" style={{ background: '#f8fafc' }}>
      <div className="max-w-md w-full mx-4 text-center">
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-6 text-white text-2xl font-bold"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          K8
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Access Pending</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-2">
          Your account <span className="font-medium text-slate-700">{email}</span> has been created
          but hasn't been assigned a role yet.
        </p>
        <p className="text-sm text-slate-400 mb-8">
          A Kato.8 admin will approve your access shortly. You'll be able to log back in once
          your role has been assigned.
        </p>
        <button
          onClick={onSignOut}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#f8fafc' }}>
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const role = getUserRole(user?.publicMetadata as Record<string, unknown>)

  if (role === null) {
    const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
    return (
      <PendingApproval
        email={email}
        onSignOut={() => signOut({ redirectUrl: '/sign-in' })}
      />
    )
  }

  const roleStyle = ROLE_COLORS[role]
  const visibleTools = TOOLS.filter(t => t.access[role] !== 'none')
  const lockedTools  = TOOLS.filter(t => t.access[role] === 'none')

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const firstName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ?? 'there'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-8 py-4 bg-white"
          style={{ borderBottom: '1px solid #e2e8f0', minHeight: '64px' }}
        >
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {greeting}, {firstName}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {visibleTools.length} tool{visibleTools.length !== 1 ? 's' : ''} available to you
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
              {ROLE_LABELS[role]}
            </span>
            <div className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Tool grid */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {/* Accessible tools */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Your Tools</h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {visibleTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} accessLevel={tool.access[role]} accessLabel={tool.accessLabel[role]} comingSoon={tool.comingSoon} />
              ))}
            </div>
          </div>

          {/* Locked tools — shown grayed out so users know they exist */}
          {lockedTools.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Restricted</h2>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {lockedTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} accessLevel="none" accessLabel="No access" locked />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
