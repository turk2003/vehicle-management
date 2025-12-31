import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const publicPaths = ['/api/auth/login']

  if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = req.cookies.get("token")?.value

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}