import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(request: NextRequestWithAuth) {
  // Allow Socket.IO polling and WebSocket upgrade requests
  if (request.nextUrl.pathname.startsWith('/api/socket')) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // List of public paths that don't require authentication
  const publicPaths = ['/', '/auth/signin', '/auth/signup', '/api/auth']
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // List of auth paths that should redirect to /posts if authenticated
  const authPaths = ['/auth/signin', '/auth/signup']
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthenticated && isAuthPath) {
    // Redirect authenticated users to posts page
    return NextResponse.redirect(new URL('/posts', request.url))
  }

  if (!isAuthenticated && !isPublicPath) {
    // Redirect unauthenticated users to sign in page
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

// Configure which routes to protect
export const config = {
  matcher: [
    '/posts/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/api/((?!auth|socket).*)/:path*',
    '/auth/signin',
    '/auth/signup'
  ]
}
