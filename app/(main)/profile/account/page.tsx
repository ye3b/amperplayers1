import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Icon from '@/components/ui/Icon'
import BackHeader from '@/components/ui/BackHeader'

const SNS_LOGOS: Record<string, { label: string; logo: React.ReactNode }> = {
  google: {
    label: '구글',
    logo: (
      // Google "G" 공식 로고
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  kakao: {
    label: '카카오',
    logo: (
      // KakaoTalk 공식 로고 (노란 배경 + 말풍선)
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="5.5" fill="#FEE500"/>
        <path fill="#191919" fillRule="evenodd" clipRule="evenodd"
          d="M12 4.8C7.582 4.8 4 7.46 4 10.72c0 2.05 1.306 3.858 3.298 4.965l-.84 3.12a.26.26 0 0 0 .396.287l3.464-2.29c.548.077 1.11.118 1.682.118 4.418 0 8-2.66 8-5.92S16.418 4.8 12 4.8z"/>
      </svg>
    ),
  },
  apple: {
    label: '애플',
    logo: (
      // Apple 공식 로고
      <svg width="18" height="22" viewBox="0 0 18 22" xmlns="http://www.w3.org/2000/svg">
        <path fill="#000" d="M15.769 11.548c-.02-2.118 1.732-3.143 1.81-3.196-.987-1.444-2.524-1.641-3.069-1.663-1.306-.133-2.56.77-3.224.77-.662 0-1.674-.753-2.757-.732-1.408.02-2.715.82-3.44 2.079-1.474 2.553-.377 6.32 1.053 8.39.705 1.014 1.538 2.147 2.63 2.106 1.06-.042 1.458-.678 2.739-.678 1.28 0 1.643.678 2.762.655 1.138-.019 1.856-1.03 2.553-2.048.806-1.169 1.137-2.302 1.156-2.361-.026-.01-2.21-.848-2.233-3.322zM13.66 4.993c.585-.71.981-1.695.873-2.676-.844.034-1.865.562-2.47 1.271-.543.626-1.017 1.63-.889 2.591.942.073 1.9-.48 2.486-1.186z"/>
      </svg>
    ),
  },
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as { id: string }).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      username: true,
      phone: true,
      email: true,
      password: true,
      accounts: { select: { provider: true } },
    },
  })

  const hasPassword = !!user?.password
  const linkedProviders = user?.accounts.map(a => a.provider) ?? []
  const SNS_PROVIDERS = ['google', 'kakao', 'apple']

  return (
    <div className="min-h-screen bg-white pb-[40px]">
      <BackHeader title="계정 관리" />

      {/* ── 로그인 정보 ── */}
      <Section title="로그인 정보">
        <Row label="아이디" value={user?.username ?? '-'} />
        <Row label="비밀번호" value={hasPassword ? '설정됨' : '미설정'} href="/profile/account/password" />
        {user?.email && <Row label="이메일" value={user.email} />}
      </Section>

      {/* ── 연락처 ── */}
      <Section title="연락처">
        <Row
          label="휴대폰 번호"
          value={user?.phone ?? '미등록'}
          href="/profile/account/phone"
        />
      </Section>

      {/* ── SNS 연동 ── */}
      <Section title="SNS 연동">
        {SNS_PROVIDERS.map((provider) => {
          const linked = linkedProviders.includes(provider)
          const info = SNS_LOGOS[provider]
          return (
            <div key={provider} className="flex items-center justify-between py-[14px] border-b border-[#F5F5F5]">
              <div className="flex items-center gap-2">
                <span className="w-[20px] h-[20px] flex items-center justify-center">{info.logo}</span>
                <span className="text-[14px] font-medium text-[#181818]">{info.label}</span>
              </div>
              <span className={`text-[12px] font-semibold ${linked ? 'text-[#00A65A]' : 'text-[#C8C8C8]'}`}>
                {linked ? '연동됨' : '미연동'}
              </span>
            </div>
          )
        })}
      </Section>

      {/* ── 탈퇴하기 ── */}
      <div className="mx-[14px] mt-[32px]">
        <Link
          href="/profile/account/delete"
          className="flex items-center justify-between py-[14px]"
        >
          <span className="text-[14px] font-medium text-[#FF4444]">탈퇴하기</span>
          <Icon name="right" size={18} className="text-[#FFAAAA]" />
        </Link>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-[14px] mt-[24px]">
      <p className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-[0.5px] mb-[4px]">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-center justify-between py-[14px] border-b border-[#F5F5F5]">
      <span className="text-[14px] font-medium text-[#181818]">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-[13px] text-[#9E9E9E]">{value}</span>
        {href && <Icon name="right" size={16} className="text-[#C8C8C8]" />}
      </div>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}
