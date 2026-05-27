'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TermsModal from '@/app/signup/verify/TermsModal'

const TERMS_CONTENT = `제1조 (목적)
이 약관은 Players(이하 "회사")가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.

제2조 (정의)
① "서비스"란 회사가 제공하는 스포츠 중고거래 플랫폼 및 관련 부가 서비스를 말합니다.
② "이용자"란 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.
③ "회원"이란 회사에 개인정보를 제공하여 회원 등록을 한 자로, 지속적으로 서비스를 이용할 수 있는 자를 말합니다.

제3조 (약관의 효력 및 변경)
① 이 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.
② 회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해 고지합니다.

제4조 (회원 가입)
① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사 표시를 함으로써 회원 가입을 신청합니다.
② 회사는 미성년자(만 14세 미만)의 회원 가입을 제한할 수 있습니다.

제5조 (서비스의 이용)
① 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.
② 회사는 서비스를 일정 범위로 분할하여 각 범위별로 이용 가능 시간을 별도로 정할 수 있습니다.`

const PRIVACY_CONTENT = `수집 항목
필수: 이름, 생년월일, 성별, 휴대폰번호, 아이디, 암호화된 비밀번호
선택: 프로필 사진, 관심 스포츠 종목, 실력 정보

수집 목적
- 회원 식별 및 서비스 제공
- 본인확인 및 부정이용 방지
- 거래 진행 및 정산 처리
- 고객 문의 응대

보유 기간
회원 탈퇴 시까지 보관 후 즉시 파기합니다.
단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보존합니다.

- 계약 또는 청약철회 기록: 5년
- 대금결제 및 재화 공급 기록: 5년
- 소비자 불만 및 분쟁처리 기록: 3년
- 접속 로그: 3개월`

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [credError, setCredError] = useState(errorParam === 'CredentialsSignin' ? '아이디 또는 비밀번호가 올바르지 않습니다.' : '')
  const [loading, setLoading] = useState<string | null>(null)
  const [modal, setModal] = useState<{ title: string; content: string } | null>(null)

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
      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-16 pb-4">

        {/* 로고 */}
        <div className="mb-8">
          <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="88" height="88" rx="24" fill="#0E0E0E"/>
            <path d="M36.8917 20.1393C50.5001 12.57 62.9086 11.533 68.2401 14.6336C71.0725 16.0289 75.6371 20.5249 73.405 28.2764C70.6368 37.8895 58.9044 48.7403 43.246 57.7322V36.2678C44.4154 35.7273 45.6022 35.1348 46.7933 34.4919C56.8306 29.0738 63.3938 22.1565 61.4524 19.0417C59.5106 15.9271 49.799 17.7943 39.7615 23.2124C29.7239 28.6306 23.161 35.5479 25.1027 38.6626C26.5225 40.9401 32.0962 40.5534 38.9141 38.0631L38.4605 38.616C19.5055 61.9113 31.3802 70.9879 39.7615 72.6155C0.349569 83.1271 13.3228 56.2845 31.5084 42.6674C24.1265 46.0866 18.8866 44.8534 17.6892 42.3101C14.686 37.6352 23.2832 27.7089 36.8917 20.1393Z" fill="#00F5A0"/>
          </svg>
        </div>

        <h1 className="text-[28px] font-bold tracking-[-0.5px] text-neutral-900 text-center mb-1">
          시작해볼까요
        </h1>
        <p className="text-[14px] text-neutral-400 text-center mb-8">
          계정으로 간편하게 로그인하세요
        </p>

        {/* 소셜 로그인 */}
        <div className="w-full flex flex-col gap-3">
          <SocialButton
            onClick={() => handleOAuth('google')}
            loading={loading === 'google'}
            disabled={loading !== null}
            bg="bg-white"
            border="border border-neutral-200"
            textColor="text-neutral-900"
            logo={<GoogleLogo />}
            label="Google로 계속하기"
          />
          <SocialButton
            onClick={() => handleOAuth('apple')}
            loading={loading === 'apple'}
            disabled={loading !== null}
            bg="bg-neutral-900"
            textColor="text-white"
            logo={<AppleLogo />}
            label="Apple로 계속하기"
          />
          <SocialButton
            onClick={() => handleOAuth('kakao')}
            loading={loading === 'kakao'}
            disabled={loading !== null}
            bg="bg-[#FEE500]"
            textColor="text-neutral-900"
            logo={<KakaoLogo />}
            label="카카오로 계속하기"
          />
        </div>

        {/* 구분선 */}
        <div className="w-full flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-neutral-100" />
          <span className="text-[11px] text-neutral-300 font-medium flex-shrink-0">아이디로 로그인</span>
          <div className="flex-1 h-px bg-neutral-100" />
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
            className="w-full h-[52px] rounded-xl border border-neutral-200 px-4 text-[15px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            required
            className="w-full h-[52px] rounded-xl border border-neutral-200 px-4 text-[15px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900"
          />
          {credError && (
            <p className="text-[13px] text-red-500 text-center">{credError}</p>
          )}
          <button
            type="submit"
            disabled={loading !== null}
            className="w-full h-[52px] rounded-xl bg-neutral-900 text-white text-[15px] font-semibold tracking-[-0.25px] active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {loading === 'credentials' ? <Spinner color="white" /> : '로그인'}
          </button>
        </form>

        {/* 회원가입 */}
        <div className="flex items-center gap-2 mt-5">
          <span className="text-[13px] text-neutral-400">계정이 없으신가요?</span>
          <button
            onClick={() => router.push('/signup')}
            className="text-[13px] font-semibold text-neutral-900 underline"
          >
            회원가입
          </button>
        </div>

        {/* 약관 */}
        <p className="text-[11px] leading-[18px] text-neutral-400 text-center mt-6 px-4">
          계속 진행하면 Players의{' '}
          <button
            onClick={() => setModal({ title: 'Players 이용약관', content: TERMS_CONTENT })}
            className="underline text-[#757575]"
          >이용약관</button>과{' '}
          <button
            onClick={() => setModal({ title: '개인정보처리방침', content: PRIVACY_CONTENT })}
            className="underline text-[#757575]"
          >개인정보처리방침</button>에 동의하게 됩니다.
        </p>
      </div>

      {modal && (
        <TermsModal
          title={modal.title}
          content={modal.content}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-center gap-2 pb-5">
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
