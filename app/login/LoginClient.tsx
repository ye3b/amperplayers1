'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [credError, setCredError] = useState(errorParam === 'CredentialsSignin' ? '아이디 또는 비밀번호가 올바르지 않습니다.' : '')
  const [loading, setLoading] = useState<string | null>(null)

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCredError('')
    setLoading('credentials')

    const result = await signIn('credentials', { username, password, redirect: false })
    setLoading(null)

    if (result?.error) {
      setCredError('아이디 또는 비밀번호가 올바르지 않습니다.')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleOAuth = async (provider: 'google' | 'apple' | 'kakao') => {
    setLoading(provider)
    await signIn(provider, { callbackUrl: '/auth/callback' })
  }

  return (
    <div className="min-h-screen max-w-[390px] mx-auto flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">

        {/* 로고 */}
        <div className="w-[88px] h-[88px] rounded-[24px] bg-[#181818] flex flex-col items-center justify-center gap-1 mb-8">
          <span className="text-[12px] leading-none font-bold text-[#00F5A0] tracking-[-0.5px] uppercase">Players</span>
          <div className="flex gap-[2px]">
            {['⚽', '🏀', '🎾', '⛷️'].map((e) => (
              <span key={e} className="text-[8px] leading-none">{e}</span>
            ))}
          </div>
        </div>

        <h1 className="text-[28px] font-bold tracking-[-0.5px] text-[#181818] text-center mb-1">
          시작해볼까요
        </h1>
        <p className="text-[14px] text-[#9E9E9E] text-center mb-8">
          계정으로 간편하게 로그인하세요
        </p>

        {/* 소셜 로그인 */}
        <div className="w-full flex flex-col gap-3">
          <SocialButton
            onClick={() => handleOAuth('google')}
            loading={loading === 'google'}
            disabled={loading !== null}
            bg="bg-white"
            border="border border-[#E8E8E8]"
            textColor="text-[#181818]"
            logo={<GoogleLogo />}
            label="Google로 계속하기"
          />
          <SocialButton
            onClick={() => handleOAuth('apple')}
            loading={loading === 'apple'}
            disabled={loading !== null}
            bg="bg-[#181818]"
            textColor="text-white"
            logo={<AppleLogo />}
            label="Apple로 계속하기"
          />
          <SocialButton
            onClick={() => handleOAuth('kakao')}
            loading={loading === 'kakao'}
            disabled={loading !== null}
            bg="bg-[#FEE500]"
            textColor="text-[#181818]"
            logo={<KakaoLogo />}
            label="카카오로 계속하기"
          />
        </div>

        {/* 구분선 */}
        <div className="w-full flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#F0F0F0]" />
          <span className="text-[11px] text-[#C8C8C8] font-medium flex-shrink-0">아이디로 로그인</span>
          <div className="flex-1 h-px bg-[#F0F0F0]" />
        </div>

        {/* 아이디 로그인 폼 */}
        <form onSubmit={handleCredentialsLogin} className="w-full flex flex-col gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디"
            autoComplete="username"
            required
            className="w-full h-[52px] rounded-xl border border-[#E8E8E8] px-4 text-[15px] text-[#181818] placeholder:text-[#C8C8C8] focus:outline-none focus:border-[#181818]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            required
            className="w-full h-[52px] rounded-xl border border-[#E8E8E8] px-4 text-[15px] text-[#181818] placeholder:text-[#C8C8C8] focus:outline-none focus:border-[#181818]"
          />
          {credError && (
            <p className="text-[13px] text-red-500 text-center">{credError}</p>
          )}
          <button
            type="submit"
            disabled={loading !== null}
            className="w-full h-[52px] rounded-xl bg-[#181818] text-white text-[15px] font-semibold tracking-[-0.25px] active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {loading === 'credentials' ? <Spinner color="white" /> : '로그인'}
          </button>
        </form>

        {/* 회원가입 */}
        <div className="flex items-center gap-2 mt-5">
          <span className="text-[13px] text-[#9E9E9E]">계정이 없으신가요?</span>
          <button
            onClick={() => router.push('/signup')}
            className="text-[13px] font-semibold text-[#181818] underline"
          >
            회원가입
          </button>
        </div>

        {/* 약관 */}
        <p className="text-[11px] leading-[18px] text-[#9E9E9E] text-center mt-6 px-4">
          계속 진행하면 Players의{' '}
          <span className="underline text-[#757575]">이용약관</span>과{' '}
          <span className="underline text-[#757575]">개인정보처리방침</span>에 동의하게 됩니다.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 pb-10">
        <div className="h-px w-16 bg-[#F0F0F0]" />
        <span className="text-[11px] text-[#C8C8C8] font-medium">스포츠 용품 중고거래</span>
        <div className="h-px w-16 bg-[#F0F0F0]" />
      </div>
    </div>
  )
}

/* ─── 소셜 버튼 공통 컴포넌트 ─── */
function SocialButton({
  onClick, loading, disabled, bg, border = '', textColor, logo, label,
}: {
  onClick: () => void
  loading: boolean
  disabled: boolean
  bg: string
  border?: string
  textColor: string
  logo: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-[52px] rounded-xl flex items-center px-5 gap-3 ${bg} ${border} ${textColor} active:scale-[0.98] transition-transform disabled:opacity-60`}
    >
      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        {loading ? <Spinner color={bg === 'bg-white' || bg === 'bg-[#FEE500]' ? '#181818' : 'white'} /> : logo}
      </span>
      <span className="flex-1 text-center text-[15px] font-semibold tracking-[-0.25px] pr-5">{label}</span>
    </button>
  )
}

/* ─── 로고 SVG ─── */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function AppleLogo() {
  return (
    <svg width="17" height="20" viewBox="0 0 814 1000" fill="white">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.3 135.3-316.9 269.2-316.9 70.1 0 128.4 46.4 172.5 46.4 42.8 0 110.1-49 191.1-49 30.8 0 133.6 2.6 198.3 99.6zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  )
}

function KakaoLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#181818">
      <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.74 1.56 5.15 3.93 6.63-.17.6-.62 2.18-.71 2.52-.11.42.15.41.32.3.13-.09 2.07-1.4 2.91-1.97.5.07 1.02.11 1.55.11 5.52 0 10-3.48 10-7.79C20 6.48 17.52 3 12 3z" />
    </svg>
  )
}

function Spinner({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="animate-spin">
      <circle cx="9" cy="9" r="7" stroke={color} strokeOpacity="0.25" strokeWidth="2" />
      <path d="M16 9a7 7 0 0 0-7-7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
