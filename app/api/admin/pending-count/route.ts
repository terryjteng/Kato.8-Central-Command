import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserRole } from '@/lib/roles'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clerk = await clerkClient()
  const caller = await clerk.users.getUser(userId)
  if (getUserRole(caller.publicMetadata as Record<string, unknown>) !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: users } = await clerk.users.getUserList({ limit: 200 })
  const count = users.filter(u => !getUserRole(u.publicMetadata as Record<string, unknown>)).length

  return NextResponse.json({ count })
}
