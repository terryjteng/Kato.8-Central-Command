import { NextRequest, NextResponse } from 'next/server'

const CLERK_FAPI = process.env.CLERK_FAPI_URL ?? ''

async function proxy(req: NextRequest) {
  if (!CLERK_FAPI) {
    return NextResponse.json({ error: 'CLERK_FAPI_URL not set' }, { status: 500 })
  }

  const path = req.nextUrl.pathname.replace('/api/clerk-proxy', '')
  const target = new URL(`${CLERK_FAPI}${path}${req.nextUrl.search}`)

  const headers = new Headers(req.headers)
  headers.delete('host')
  headers.set('x-forwarded-host', req.nextUrl.host)

  const body = req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined

  const upstream = await fetch(target.toString(), {
    method: req.method,
    headers,
    body,
    redirect: 'manual',
    // @ts-expect-error Node 18 duplex
    duplex: body ? 'half' : undefined,
  })

  const resHeaders = new Headers(upstream.headers)
  resHeaders.set('Access-Control-Allow-Origin', req.headers.get('origin') ?? '*')
  resHeaders.set('Access-Control-Allow-Credentials', 'true')

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  })
}

export const GET     = proxy
export const POST    = proxy
export const PUT     = proxy
export const PATCH   = proxy
export const DELETE  = proxy
export const OPTIONS = proxy
