import { UserRole } from './roles'

export type AccessLevel = 'super_admin' | 'full' | 'edit' | 'view' | 'client_portal' | 'none'

export interface Tool {
  id: string
  name: string
  tagline: string
  description: string
  color: string
  iconPath: string
  vercelUrl: string
  comingSoon?: boolean
  access: Record<UserRole, AccessLevel>
  accessLabel: Record<UserRole, string>
}

export const TOOLS: Tool[] = [
  {
    id: 'scheduler',
    name: 'Scheduler',
    tagline: 'Project & calendar management',
    description: 'Week view calendar, kanban task boards, and team availability across all active game projects.',
    color: '#7c3aed',
    iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    vercelUrl: 'https://calendar-scheduler-orcin.vercel.app',
    access: {
      super_admin:          'super_admin',
      team_lead:            'full',
      social_media_manager: 'full',
      member:               'full',
      client:               'none',
    },
    accessLabel: {
      super_admin:          'Super Admin',
      team_lead:            'Team Lead access',
      social_media_manager: 'Full access',
      member:               'Full access',
      client:               'No access',
    },
  },
  {
    id: 'hr-tool',
    name: 'HR Tool',
    tagline: 'People ops & compliance',
    description: 'Onboarding, compliance tracking, org chart, and hiring pipeline for Kato.8 Studios.',
    color: '#0d9488',
    iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    vercelUrl: 'https://hr-tool-blush.vercel.app',
    access: {
      super_admin:          'super_admin',
      team_lead:            'full',
      social_media_manager: 'full',
      member:               'full',
      client:               'client_portal',
    },
    accessLabel: {
      super_admin:          'Super Admin',
      team_lead:            'Full access',
      social_media_manager: 'Full access',
      member:               'Full access',
      client:               'Client portal',
    },
  },
  {
    id: 'social-media',
    name: 'Social Media Dash',
    tagline: 'Analytics & content management',
    description: 'Cross-platform analytics, scheduling, and content performance tracking for all studio channels.',
    color: '#2563eb',
    iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    vercelUrl: 'https://social-media-dash-three.vercel.app',
    access: {
      super_admin:          'super_admin',
      team_lead:            'view',
      social_media_manager: 'edit',
      member:               'view',
      client:               'none',
    },
    accessLabel: {
      super_admin:          'Super Admin',
      team_lead:            'View only',
      social_media_manager: 'Editor access',
      member:               'View only',
      client:               'No access',
    },
  },
  {
    id: 'video-editor',
    name: 'Video Editor',
    tagline: 'Video production pipeline',
    description: 'Internal video editing, review, and publishing pipeline for studio content.',
    color: '#e11d48',
    iconPath: 'M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.899L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    vercelUrl: '',
    comingSoon: true,
    access: {
      super_admin:          'super_admin',
      team_lead:            'none',
      social_media_manager: 'full',
      member:               'none',
      client:               'none',
    },
    accessLabel: {
      super_admin:          'Full access',
      team_lead:            'No access',
      social_media_manager: 'Full access',
      member:               'No access',
      client:               'No access',
    },
  },
  {
    id: 'executive-assistant',
    name: 'Executive Assistant',
    tagline: 'AI-powered CEO dashboard',
    description: 'Private AI assistant for studio operations, strategy, and executive decision-making.',
    color: '#d97706',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
    vercelUrl: 'https://executive-assistant-eight.vercel.app',
    access: {
      super_admin:          'super_admin',
      team_lead:            'none',
      social_media_manager: 'none',
      member:               'none',
      client:               'none',
    },
    accessLabel: {
      super_admin:          'Private access',
      team_lead:            'No access',
      social_media_manager: 'No access',
      member:               'No access',
      client:               'No access',
    },
  },
  {
    id: 'legal-agent',
    name: 'Legal Agent',
    tagline: 'AI legal analysis & contracts',
    description: 'AI-assisted legal document review, contract analysis, and compliance tooling.',
    color: '#475569',
    iconPath: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    vercelUrl: 'https://legal-agent.vercel.app',
    access: {
      super_admin:          'super_admin',
      team_lead:            'none',
      social_media_manager: 'none',
      member:               'none',
      client:               'none',
    },
    accessLabel: {
      super_admin:          'Private access',
      team_lead:            'No access',
      social_media_manager: 'No access',
      member:               'No access',
      client:               'No access',
    },
  },
]
