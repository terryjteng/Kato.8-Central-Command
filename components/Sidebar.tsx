'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getUserRole, ROLE_LABELS, ROLE_COLORS, UserRole } from '@/lib/roles'

interface SidebarProps {
  role: UserRole
  activePage?: 'dashboard' | 'admin'
}

export default function Sidebar({ role, activePage }: SidebarProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const pathname = usePathname()
  const active = activePage ?? (pathname.startsWith('/admin') ? 'admin' : 'dashboard')
  const roleStyle = ROLE_COLORS[role]

  return (
    <aside
      className="flex flex-col h-screen bg-[#1a2035] text-slate-300 select-none flex-shrink-0"
      style={{ width: '220px', minWidth: '220px', borderRight: '1px solid #2e3a57' }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #2e3a57' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg text-white font-bold text-sm flex-shrink-0"
            style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            K8
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Kato.8 Studios</div>
            <div className="text-slate-500 text-xs">Central Command</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pt-4 sidebar-scroll overflow-y-auto">
        <div className="px-3 mb-1.5">
          <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Navigation</span>
        </div>

        <ul className="space-y-0.5 mb-6">
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active === 'dashboard'
                  ? 'bg-[#2a3454] text-white'
                  : 'text-slate-400 hover:bg-[#232d47] hover:text-slate-200'
              }`}
            >
              <svg className={`w-4 h-4 ${active === 'dashboard' ? 'text-violet-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>
          </li>

          {role === 'super_admin' && (
            <li>
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active === 'admin'
                    ? 'bg-[#2a3454] text-white'
                    : 'text-slate-400 hover:bg-[#232d47] hover:text-slate-200'
                }`}
              >
                <svg className={`w-4 h-4 ${active === 'admin' ? 'text-violet-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                User Admin
              </Link>
            </li>
          )}
        </ul>

        {/* My role */}
        <div className="px-3 mb-1.5">
          <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">My Access</span>
        </div>
        <div className="px-3 py-2 mb-4">
          <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
            {ROLE_LABELS[role]}
          </span>
        </div>
      </nav>

      {/* User profile + sign out */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid #2e3a57' }}>
        {user ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                {user.firstName?.[0] ?? user.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-300 truncate">
                  {user.fullName ?? user.emailAddresses?.[0]?.emailAddress}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {user.emailAddresses?.[0]?.emailAddress}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: '/sign-in' })}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-[#232d47] hover:text-slate-300 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        ) : (
          <Link href="/sign-in" className="text-xs text-slate-400 hover:text-slate-200 px-2">
            Sign in
          </Link>
        )}
      </div>
    </aside>
  )
}
