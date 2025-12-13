import { NextResponse, NextRequest } from 'next/server'
import { getDemoSession } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /demos and its sub-routes
  if (pathname.startsWith('/demos')) {
    try {
      const session = await getDemoSession()

      // If no valid session, redirect to home page
      if (!session || !session.demoAccess) {
        const passwordUrl = new URL('/', request.url)
        passwordUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(passwordUrl)
      }
    } catch (error) {
      // If session validation fails, redirect to home page
      const passwordUrl = new URL('/', request.url)
      passwordUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(passwordUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}