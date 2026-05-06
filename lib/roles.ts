export type UserRole =
  | 'super_admin'           // Terry — full access to everything + admin controls
  | 'team_lead'             // Extra control in Scheduler; regular elsewhere
  | 'social_media_manager'  // Video Editor + Social Media (edit); regular elsewhere
  | 'member'                // Standard team member
  | 'client'                // HR client portal only

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin:           'Super Admin',
  team_lead:             'Team Lead',
  social_media_manager:  'Social Media Manager',
  member:                'Member',
  client:                'Client',
}

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  super_admin:          { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300' },
  team_lead:            { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300'   },
  social_media_manager: { bg: 'bg-teal-100',   text: 'text-teal-800',   border: 'border-teal-300'   },
  member:               { bg: 'bg-slate-100',  text: 'text-slate-700',  border: 'border-slate-300'  },
  client:               { bg: 'bg-amber-100',  text: 'text-amber-800',  border: 'border-amber-300'  },
}

// Ordered list for the admin role selector
export const ROLE_OPTIONS: UserRole[] = [
  'super_admin', 'team_lead', 'social_media_manager', 'member', 'client',
]

export function getUserRole(publicMetadata: Record<string, unknown> | null | undefined): UserRole {
  const role = publicMetadata?.role as UserRole | undefined
  if (role && ROLE_LABELS[role]) return role
  return 'member'
}
