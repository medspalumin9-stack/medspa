import { handlers } from '@/lib/auth'
import type { NextRequest } from 'next/server'

function authActionFromPath(pathname: string) {
  const parts = pathname.replace(/^\/api\/auth\/?/, '').split('/').filter(Boolean)
  return parts[0] ?? ''
}

/**
 * When the handler returns HTML (Next error page, 404 document, proxy fallback),
 * next-auth/react throws ClientFetchError parsing JSON. Normalize known JSON actions.
 */
function withJsonGuard(
  handler: (req: NextRequest) => Promise<Response> | Response
) {
  return async (req: NextRequest) => {
    try {
      const res = await handler(req)
      const ct = res.headers.get('content-type') ?? ''
      if (ct.includes('application/json')) return res

      const action = authActionFromPath(req.nextUrl.pathname)
      const jsonActions = new Set(['session', 'csrf', 'providers'])
      if (!jsonActions.has(action)) return res

      const body = await res.clone().text()
      const looksHtml = /^\s*</.test(body)
      if (!looksHtml) return res

      console.error(
        `[auth] ${action} returned non-JSON (likely HTML). status=${res.status} — check dev Turbopack root (next.config.ts), NEXTAUTH_URL / AUTH_URL, and that /api/auth routes deploy correctly.`
      )

      if (action === 'session')
        return Response.json(null, { status: 200, headers: { 'content-type': 'application/json' } })
      if (action === 'csrf')
        return Response.json(
          { csrfToken: '' },
          { status: 200, headers: { 'content-type': 'application/json' } }
        )
      return Response.json({}, { status: 200, headers: { 'content-type': 'application/json' } })
    } catch (err) {
      console.error('[auth] route handler error', err)
      const action = authActionFromPath(req.nextUrl.pathname)
      if (action === 'session')
        return Response.json(null, { status: 200, headers: { 'content-type': 'application/json' } })
      return Response.json({ error: 'AuthError' }, { status: 500 })
    }
  }
}

export const GET = withJsonGuard(handlers.GET as (req: NextRequest) => Promise<Response>)
export const POST = withJsonGuard(handlers.POST as (req: NextRequest) => Promise<Response>)
