import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserRole } from '@/lib/roles'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify caller is super_admin
  const clerk = await clerkClient()
  const caller = await clerk.users.getUser(userId)
  const callerRole = getUserRole(caller.publicMetadata as Record<string, unknown>)
  if (callerRole !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const response = await clerk.users.getUserList({ limit: 200, orderBy: '-created_at' })
  const users = response.data.map(u => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    emailAddress: u.emailAddresses[0]?.emailAddress ?? '',
    role: getUserRole(u.publicMetadata as Record<string, unknown>),
    imageUrl: u.imageUrl,
    createdAt: u.createdAt,
  }))

  return NextResponse.json({ users })
}
