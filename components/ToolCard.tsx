'use client'

import { Tool, AccessLevel } from '@/lib/tools'

const ACCESS_BADGE: Record<AccessLevel, { label: string; bg: string; text: string }> = {
  super_admin:   { label: 'Super Admin', bg: 'bg-violet-100', text: 'text-violet-800' },
  full:          { label: 'Full Access', bg: 'bg-green-100',  text: 'text-green-800'  },
  edit:          { label: 'Editor',      bg: 'bg-blue-100',   text: 'text-blue-800'   },
  view:          { label: 'View Only',   bg: 'bg-slate-100',  text: 'text-slate-600'  },
  client_portal: { label: 'Client Portal', bg: 'bg-amber-100', text: 'text-amber-800' },
  none:          { label: 'No Access',   bg: 'bg-slate-100',  text: 'text-slate-400'  },
}

interface ToolCardProps {
  tool: Tool
  accessLevel: AccessLevel
  accessLabel: string
  locked?: boolean
  comingSoon?: boolean
}

export default function ToolCard({ tool, accessLevel, accessLabel, locked, comingSoon }: ToolCardProps) {
  const badge = ACCESS_BADGE[accessLevel]
  const canOpen = !locked && !comingSoon && accessLevel !== 'none'

  return (
    <div
      className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        locked
          ? 'border-slate-100 opacity-50'
          : 'border-slate-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5'
      }`}
    >
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: locked ? '#e2e8f0' : tool.color }} />

      <div className="p-5">
        {/* Icon + badge row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: locked ? '#f1f5f9' : `${tool.color}18` }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke={locked ? '#94a3b8' : tool.color}
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={tool.iconPath} />
            </svg>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
            {accessLabel}
          </span>
        </div>

        {/* Name + tagline */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{tool.name}</h3>
          <p className="text-xs text-slate-400 font-medium">{tool.tagline}</p>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed mb-5">{tool.description}</p>

        {/* Open button */}
        {canOpen ? (
          <a
            href={tool.vercelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-white rounded-xl transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${tool.color}, ${tool.color}cc)` }}
          >
            Open {tool.name}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : comingSoon ? (
          <div className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-medium text-slate-400 rounded-xl bg-slate-50 border border-slate-100">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Coming Soon
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-medium text-slate-400 rounded-xl bg-slate-50 border border-slate-100 cursor-not-allowed">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Restricted
          </div>
        )}
      </div>
    </div>
  )
}
