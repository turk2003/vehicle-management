import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const publicPaths = ['/api/auth/login', '/api/auth/logout']
  const pathname = req.nextUrl.pathname

  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = req.cookies.get("token")?.value

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    } else {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/user/:path*',
    '/admin/:path*',
    '/approver/:path*'
  ]
}