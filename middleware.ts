import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/onboarding', '/api/auth', '/api/payment/payapp-callback', '/api/products/reanalyze']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  
  if (!token) {
    const onboardingUrl = new URL('/onboarding', req.url)
    onboardingUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(onboardingUrl)
  }

// 로그인 했지만 온보딩 미완료 → 종목 선택으로
  if (
    !token.onboardingCompleted &&
    !pathname.startsWith('/onboarding') &&
    !pathname.startsWith('/api/')
  ) {
    return NextResponse.redirect(new URL('/onboarding/sports', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|public|api/auth).*)',
  ],
}
