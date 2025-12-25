import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Handle localhost port strip
  const domain = hostname.split(':')[0]
  
  console.log(`[Middleware] Incoming Host: ${hostname}, Path: ${url.pathname}, Domain: ${domain}`);

  // Subdomain Routing: forum.tengra.studio
  if (domain === 'forum.tengra.studio') {
    // If path is API or internal Next.js paths, skip rewrite
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
        return NextResponse.next();
    }

    // Prevent infinite loops if path already starts with /forum
    if (!url.pathname.startsWith('/forum')) {
      // Rewrite map: / -> /forum, /foo -> /forum/foo
      url.pathname = `/forum${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
