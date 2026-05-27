'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export default function SignupClient() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [checkMessage, setCheckMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    setCheckState('idle')
    setCheckMessage('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value) return
    debounceRef.current = setTimeout(() => checkUsername(value), 500)
  }

  const checkUsername = async (value: string) => {
    setCheckState('checking')
    const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`)
    const data = await res.json()
    setCheckMessage(data.message)
    if (!res.ok) { setCheckState('invalid'); return }
    setCheckState(data.available ? 'available' : 'taken')
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (checkState !== 'available') { setError('아이디 중복 확인을 완료해주세요.'); return }
    if (password !== confirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }

    // 최종 중복 체크 (디바운스 사이에 다른 사람이 가입했을 수 있으므로)
    setLoading(true)
    const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
    const data = await res.json()
    setLoading(false)

    if (!res.ok || !data.available) {
      setCheckState('taken')
      setCheckMessage(data.message)
      setError('아이디를 다시 확인해주세요.')
      return
    }

    // UT용: SMS 인증 없이 바로 계정 생성 후 온보딩으로 이동
    setLoading(true)
    const signupRes = await fetch('/api/auth/signup-ut', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const signupData = await signupRes.json()
    if (!signupRes.ok) {
      setLoading(false)
      setError(signupData.error || '회원가입에 실패했습니다.')
      return
    }

    const loginResult = await signIn('credentials', { username, password, redirect: false })
    setLoading(false)
    if (loginResult?.error) { setError('로그인에 실패했습니다. 다시 시도해주세요.'); return }

router.push('/signup/sports')
  }

  const inputBorder = (state: CheckState) => {
    if (state === 'available') return 'border-[#00C77A] focus:border-[#00C77A]'
    if (state === 'taken' || state === 'invalid') return 'border-red-400 focus:border-red-400'
    return 'border-neutral-200 focus:border-neutral-900'
  }

  return (
    <div className="h-dvh max-w-[390px] mx-auto flex flex-col bg-white">
      <div className="flex flex-col px-4 pt-12 pb-8 flex-1">

        <button
          onClick={() => router.push('/login')}
          className="self-start mb-8 flex items-center gap-1 text-neutral-900"
        >
          <ChevronLeft />
          <span className="text-[14px] font-semibold">로그인으로 돌아가기</span>
        </button>

        {/* 진행 표시 */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 rounded-full bg-neutral-900" />
          <div className="h-1 flex-1 rounded-full bg-neutral-200" />
        </div>

        <h1 className="text-[26px] font-bold tracking-[-0.5px] text-neutral-900 mb-1">아이디 설정</h1>
        <p className="text-[14px] text-neutral-400 mb-8">사용할 아이디와 비밀번호를 설정해주세요</p>

        <form onSubmit={handleNext} className="flex flex-col gap-4 flex-1">

          {/* 아이디 */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-neutral-500">아이디</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="영문, 숫자, 밑줄(_) / 3~20자"
                autoComplete="username"
                className={`w-full h-[52px] rounded-xl border px-4 pr-10 text-[15px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none transition-colors ${inputBorder(checkState)}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkState === 'checking' && <SpinnerIcon />}
                {checkState === 'available' && <CheckIcon />}
                {(checkState === 'taken' || checkState === 'invalid') && <XIcon />}
              </span>
            </div>
            {checkMessage && (
              <p className={`text-[12px] px-1 ${checkState === 'available' ? 'text-[#00A65A]' : 'text-red-500'}`}>
                {checkMessage}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-neutral-500">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력하세요"
              autoComplete="new-password"
              className="w-full h-[52px] rounded-xl border border-neutral-200 px-4 text-[15px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-neutral-500">비밀번호 확인</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              autoComplete="new-password"
              className={`w-full h-[52px] rounded-xl border px-4 text-[15px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none transition-colors ${
                confirm && password !== confirm
                  ? 'border-red-400 focus:border-red-400'
                  : confirm && password === confirm
                  ? 'border-[#00C77A] focus:border-[#00C77A]'
                  : 'border-neutral-200 focus:border-neutral-900'
              }`}
            />
            {confirm && password !== confirm && (
              <p className="text-[12px] text-red-500 px-1">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}

          <div className="flex-1" />

          <button
            type="submit"
            disabled={loading || checkState !== 'available'}
            className="w-full h-[54px] rounded-xl bg-neutral-900 text-white text-[15px] font-bold active:scale-[0.98] transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <Spinner /> : (
              <>
                다음
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C77A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="#C8C8C8" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="#181818" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="animate-spin">
      <circle cx="9" cy="9" r="7" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M16 9a7 7 0 0 0-7-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
