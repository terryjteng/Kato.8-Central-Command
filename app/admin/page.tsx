'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserRole, ROLE_LABELS, ROLE_COLORS, ROLE_OPTIONS, UserRole } from '@/lib/roles'
import Sidebar from '@/components/Sidebar'

interface ClerkUser {
  id: string
  firstName: string | null
  lastName: string | null
  emailAddress: string
  role: UserRole | null
  imageUrl: string
  createdAt: number
  lastSignInAt: number | null
}

type ConfirmStep = 'select' | 'grant_needed' | 'updating' | 'success'

function getInitials(first: string | null, last: string | null, email: string): string {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase()
  if (first) return first.slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

function fmtDate(ts: number | null) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtRelative(ts: number | null) {
  if (!ts) return 'Never'
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin:           'Full access + admin controls on all tools',
  team_lead:             'Team Lead controls in Scheduler; full access to HR, Scheduler, Social Media (view)',
  social_media_manager:  'Social Media edit + Video Editor access',
  member:                'HR, Scheduler full; Social Media view only',
  client:                'HR client portal only',
}

export default function AdminPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [users, setUsers]   = useState<ClerkUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Expand / role-assign state
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>('member')
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>('select')
  const [confirmedRole, setConfirmedRole] = useState<UserRole>('member')

  const myRole = getUserRole(user?.publicMetadata as Record<string, unknown>)

  useEffect(() => {
    if (isLoaded && myRole !== 'super_admin') router.replace('/dashboard')
  }, [isLoaded, myRole, router])

  useEffect(() => {
    if (!isLoaded || myRole !== 'super_admin') return
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { setUsers(data.users ?? []); setLoading(false) })
      .catch(() => { setError('Failed to load users'); setLoading(false) })
  }, [isLoaded, myRole])

  // Reset confirm state whenever a different row is expanded
  useEffect(() => {
    setSelectedRole('member')
    setConfirmStep('select')
    setConfirmedRole('member')
  }, [expandedId])

  const handleConfirm = async (u: ClerkUser) => {
    setConfirmedRole(selectedRole)
    if (!u.role) {
      setConfirmStep('grant_needed')
    } else {
      setConfirmStep('updating')
      await applyRole(u.id, selectedRole)
      setConfirmStep('success')
    }
  }

  const handleGrantAccess = async (userId: string) => {
    setConfirmStep('updating')
    await applyRole(userId, confirmedRole)
    setConfirmStep('success')
  }

  const applyRole = async (userId: string, role: UserRole) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
  }

  if (!isLoaded || myRole !== 'super_admin') return null

  const sorted = [...users].sort((a, b) => {
    if (!a.role && b.role) return -1
    if (a.role && !b.role) return 1
    return (b.lastSignInAt ?? b.createdAt) - (a.lastSignInAt ?? a.createdAt)
  })

  const filtered = sorted.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.emailAddress.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    )
  })

  const pendingUsers = users.filter(u => !u.role)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      <Sidebar role={myRole} activePage="admin" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-8 py-4 bg-white"
          style={{ borderBottom: '1px solid #e2e8f0', minHeight: '64px' }}
        >
          <div>
            <h1 className="text-lg font-semibold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-400 mt-0.5">Assign roles and control tool access for every team member</p>
          </div>
          <div className="flex items-center gap-3">
            {pendingUsers.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse inline-block" />
                {pendingUsers.length} awaiting access
              </span>
            )}
            {users.length > 0 && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                {users.length} user{users.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Pending access alert */}
          {pendingUsers.length > 0 && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {pendingUsers.length === 1
                    ? '1 person is requesting access'
                    : `${pendingUsers.length} people are requesting access`}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {pendingUsers.map(u => u.firstName ? `${u.firstName} ${u.lastName ?? ''}`.trim() : u.emailAddress).join(', ')} — expand their row below to assign a role and grant access.
                </p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-4 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or role…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-violet-400 shadow-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              {/* Table header */}
              <div
                className="grid text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3 bg-slate-50"
                style={{ gridTemplateColumns: '1fr 220px 160px 100px 20px', borderBottom: '1px solid #e2e8f0' }}
              >
                <div>Member</div>
                <div>Email</div>
                <div>Role</div>
                <div>Last active</div>
                <div />
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">No users found.</div>
              )}

              {filtered.map((u, idx) => {
                const isPending = !u.role
                const isSelf = u.id === user?.id
                const isOpen = expandedId === u.id
                const roleStyle = u.role ? (ROLE_COLORS[u.role] ?? ROLE_COLORS['member']) : null
                const displayName = u.firstName && u.lastName
                  ? `${u.firstName} ${u.lastName}`
                  : u.firstName ?? u.emailAddress.split('@')[0]

                return (
                  <div
                    key={u.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                  >
                    {/* Row */}
                    <div
                      onClick={() => !isSelf && setExpandedId(isOpen ? null : u.id)}
                      className={`grid items-center px-6 py-3.5 transition-colors ${
                        isOpen ? 'bg-violet-50/60' : isPending ? 'bg-rose-50/30' : 'bg-white hover:bg-slate-50/80'
                      } ${!isSelf ? 'cursor-pointer' : ''}`}
                      style={{
                        gridTemplateColumns: '1fr 220px 160px 100px 20px',
                        borderLeft: isPending ? '3px solid #f43f5e' : isOpen ? '3px solid #7c3aed' : '3px solid transparent',
                      }}
                    >
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: isPending ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                        >
                          {getInitials(u.firstName, u.lastName, u.emailAddress)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                            {displayName}
                            {isSelf && <span className="text-xs text-violet-500">(you)</span>}
                          </div>
                          <div className="text-xs text-slate-400">
                            {isPending ? (
                              <span className="text-rose-500 font-medium">Requesting access</span>
                            ) : (
                              u.role ? ROLE_LABELS[u.role] : '—'
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="text-sm text-slate-500 truncate">{u.emailAddress}</div>

                      {/* Role badge */}
                      <div>
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-600 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Pending
                          </span>
                        ) : roleStyle ? (
                          <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                            {ROLE_LABELS[u.role!]}
                          </span>
                        ) : null}
                      </div>

                      {/* Last active */}
                      <div className="text-xs text-slate-400">{fmtRelative(u.lastSignInAt)}</div>

                      {/* Chevron */}
                      {!isSelf && (
                        <svg
                          className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>

                    {/* Expanded panel */}
                    {isOpen && (
                      <div
                        className="px-6 py-4 bg-slate-50/80"
                        style={{ borderTop: '1px solid #e2e8f0', paddingLeft: '4rem' }}
                      >
                        {/* Info row */}
                        <div className="flex gap-8 flex-wrap mb-4">
                          {[
                            { label: 'Clerk ID',    value: u.id,                        mono: true },
                            { label: 'Joined',      value: fmtDate(u.createdAt),        mono: false },
                            { label: 'Last active', value: fmtDate(u.lastSignInAt),     mono: false },
                          ].map(f => (
                            <div key={f.label}>
                              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{f.label}</div>
                              <div className={`text-xs text-slate-700 ${f.mono ? 'font-mono break-all' : ''}`}>{f.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Role assignment */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.875rem' }}>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Role Assignment</div>

                          {confirmStep === 'select' && (
                            <div className="flex items-center gap-3 flex-wrap">
                              <select
                                value={selectedRole}
                                onChange={e => setSelectedRole(e.target.value as UserRole)}
                                className="text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-violet-400"
                              >
                                {ROLE_OPTIONS.map(r => (
                                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleConfirm(u)}
                                className="px-4 py-1.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                              >
                                Confirm
                              </button>
                              {u.role && (
                                <span className="text-xs text-slate-400">
                                  Current:{' '}
                                  <strong style={{ color: '#7c3aed' }}>{ROLE_LABELS[u.role]}</strong>
                                </span>
                              )}
                            </div>
                          )}

                          {confirmStep === 'grant_needed' && (
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-sm text-slate-600">
                                Grant access as{' '}
                                <strong className="text-violet-700">{ROLE_LABELS[confirmedRole]}</strong>?
                              </span>
                              <button
                                onClick={() => handleGrantAccess(u.id)}
                                className="px-4 py-1.5 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
                              >
                                Grant Access
                              </button>
                              <button
                                onClick={() => setConfirmStep('select')}
                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 text-sm rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {confirmStep === 'updating' && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <div className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                              Updating…
                            </div>
                          )}

                          {confirmStep === 'success' && (
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Role set to <strong>{ROLE_LABELS[confirmedRole]}</strong>
                              </span>
                              <button
                                onClick={() => setConfirmStep('select')}
                                className="text-xs text-slate-400 underline hover:text-slate-600 transition-colors"
                              >
                                Change
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Role legend */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Role Access Guide</h3>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {ROLE_OPTIONS.map(r => {
                const s = ROLE_COLORS[r]
                return (
                  <div key={r} className="flex items-start gap-2.5">
                    <span className={`mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}>
                      {ROLE_LABELS[r]}
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed">{ROLE_DESCRIPTIONS[r]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
