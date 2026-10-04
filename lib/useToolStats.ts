'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { TOOLS } from '@/lib/tools'
import type { ToolStat } from '@/components/ToolCard'

interface HrSummary {
  actions: { open: number; urgent: number; overdue: number }
  signing: { pending: number }
  onboarding: { active: number }
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

// Live counts for the tool cards. The HR Tool API holds both the HR records and
// the studio actions the EA works from, so one call covers both cards. Tools the
// user can't open are skipped; failures just leave the cards without counts.
export function useToolStats(visibleToolIds: string[]): Record<string, ToolStat[]> {
  const { getToken, isSignedIn } = useAuth()
  const [stats, setStats] = useState<Record<string, ToolStat[]>>({})
  const wantsHr = visibleToolIds.includes('hr-tool') || visibleToolIds.includes('executive-assistant')

  useEffect(() => {
    if (!isSignedIn || !wantsHr) return
    const hrUrl = TOOLS.find(t => t.id === 'hr-tool')?.vercelUrl
    if (!hrUrl) return
    let cancelled = false

    async function load() {
      try {
        const token = await getToken()
        const res = await fetch(`${hrUrl}/api/summary`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const s: HrSummary = await res.json()
        if (cancelled) return
        setStats({
          'hr-tool': [
            ...(s.signing.pending ? [{ label: `${plural(s.signing.pending, 'signature')} pending`, warn: true }] : []),
            ...(s.onboarding.active ? [{ label: `${s.onboarding.active} onboarding` }] : []),
          ],
          'executive-assistant': [
            { label: `${plural(s.actions.open, 'open action')}` },
            ...(s.actions.urgent ? [{ label: `${s.actions.urgent} urgent`, warn: true }] : []),
            ...(s.actions.overdue ? [{ label: `${s.actions.overdue} overdue`, warn: true }] : []),
          ],
        })
      } catch {
        // leave cards as they are
      }
    }

    load()
    const timer = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [isSignedIn, wantsHr, getToken])

  return stats
}
