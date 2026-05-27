import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import KakaoProvider from 'next-auth/providers/kakao'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// 키가 설정된 OAuth 프로바이더만 등록
const oauthProviders: ReturnType<typeof GoogleProvider | typeof AppleProvider | typeof KakaoProvider>[] = [
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null,
  process.env.APPLE_ID && process.env.APPLE_SECRET
    ? AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: process.env.APPLE_SECRET,
      })
    : null,
  process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET
    ? KakaoProvider({
        clientId: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
      })
    : null,
].filter(Boolean) as NonNullable<(typeof oauthProviders)[number]>[]

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...oauthProviders,
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return { id: user.id, email: user.email ?? '', name: user.name ?? user.username }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // user는 최초 로그인 시에만 전달됨 (credentials + OAuth 모두)
      if (user?.id) token.id = user.id
      // 로그인 시 또는 세션 업데이트 시 onboardingCompleted 조회
      if (user?.id || trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: (token.id as string) },
          select: { onboardingCompleted: true },
        })
        token.onboardingCompleted = dbUser?.onboardingCompleted ?? false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as typeof session.user & { id: string }).id = token.id as string
      }
      return session
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
