import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserRole, ROLE_OPTIONS, UserRole } from '@/lib/roles'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId: callerId } = await auth()
  if (!callerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clerk = await clerkClient()

  // Verify caller is super_admin
  const caller = await clerk.users.getUser(callerId)
  const callerRole = getUserRole(caller.publicMetadata as Record<string, unknown>)
  if (callerRole !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Prevent self-demotion
  if (params.userId === callerId) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
  }

  const body = await request.json()
  const { role } = body as { role: UserRole }
  if (!ROLE_OPTIONS.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  await clerk.users.updateUserMetadata(params.userId, {
    publicMetadata: { role },
  })

  return NextResponse.json({ success: true, role })
}
