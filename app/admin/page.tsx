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
  role: UserRole
  imageUrl: string
  createdAt: number
}

function getInitials(first: string | null, last: string | null, email: string): string {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase()
  if (first) return first.slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

export default function AdminPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [users, setUsers]       = useState<ClerkUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState<string | null>(null)
  const [error, setError]       = useState<string | null>(null)

  const myRole = getUserRole(user?.publicMetadata as Record<string, unknown>)

  // Gate: only super_admin can access
  useEffect(() => {
    if (isLoaded && myRole !== 'super_admin') {
      router.replace('/dashboard')
    }
  }, [isLoaded, myRole, router])

  useEffect(() => {
    if (!isLoaded || myRole !== 'super_admin') return
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { setUsers(data.users ?? []); setLoading(false) })
      .catch(() => { setError('Failed to load users'); setLoading(false) })
  }, [isLoaded, myRole])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setSaving(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error('Failed')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch {
      setError('Failed to update role')
    } finally {
      setSaving(null)
    }
  }

  if (!isLoaded || myRole !== 'super_admin') return null

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
          {users.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {users.length} user{users.length !== 1 ? 's' : ''}
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Table header */}
              <div
                className="grid text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3"
                style={{ gridTemplateColumns: '1fr 200px 180px 120px', borderBottom: '1px solid #f1f5f9' }}
              >
                <div>Member</div>
                <div>Email</div>
                <div>Role</div>
                <div>Joined</div>
              </div>

              {/* Rows */}
              {users.map((u, idx) => {
                const roleStyle = ROLE_COLORS[u.role] ?? ROLE_COLORS['member']
                const isSelf = u.id === user?.id
                return (
                  <div
                    key={u.id}
                    className={`grid items-center px-6 py-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    style={{ gridTemplateColumns: '1fr 200px 180px 120px', borderBottom: '1px solid #f8fafc' }}
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                      >
                        {getInitials(u.firstName, u.lastName, u.emailAddress)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.emailAddress.split('@')[0]}
                          {isSelf && <span className="ml-1.5 text-xs text-violet-500">(you)</span>}
                        </div>
                        <div className="text-xs text-slate-400">{u.role === 'super_admin' ? 'Super Admin' : u.role}</div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="text-sm text-slate-500 truncate">{u.emailAddress}</div>

                    {/* Role selector */}
                    <div>
                      {isSelf ? (
                        <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          disabled={saving === u.id}
                          onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-400 bg-white disabled:opacity-60"
                        >
                          {ROLE_OPTIONS.map(r => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Joined */}
                    <div className="text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )
              })}

              {users.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">No users found.</div>
              )}
            </div>
          )}

          {/* Role legend */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Role Access Guide</h3>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {ROLE_OPTIONS.map(r => {
                const s = ROLE_COLORS[r]
                const descriptions: Record<UserRole, string> = {
                  super_admin:           'Full access + admin controls on all tools',
                  team_lead:             'Team Lead controls in Scheduler; full access to HR, Scheduler, Social Media (view)',
                  social_media_manager:  'Social Media edit + Video Editor access',
                  member:                'HR, Scheduler full; Social Media view only',
                  client:                'HR client portal only',
                }
                return (
                  <div key={r} className="flex items-start gap-2.5">
                    <span className={`mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}>
                      {ROLE_LABELS[r]}
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed">{descriptions[r]}</span>
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
