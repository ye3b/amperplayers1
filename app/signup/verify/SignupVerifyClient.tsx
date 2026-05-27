'use client'

import { TERMS_DATA } from './terms-data'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

type Step = 'info' | 'otp'
type ConsentMap = Record<string, boolean>

const CARRIERS = ['SKT', 'KT', 'LG U+', 'SKT 알뜰', 'KT 알뜰', 'LG 알뜰']

export default function SignupVerifyClient() {
  const router = useRouter()
  const [draft, setDraft] = useState<{ username: string; password: string } | null>(null)
  const [step, setStep] = useState<Step>('info')

  useEffect(() => {
    const raw = sessionStorage.getItem('signup_draft')
    if (!raw) { router.replace('/signup'); return }
    setDraft(JSON.parse(raw))
  }, [router])

  const [name, setName]               = useState('')
  const [birth, setBirth]             = useState('')
  const [genderDigit, setGenderDigit] = useState('')
  const [carrier, setCarrier]         = useState('')
  const [phone, setPhone]             = useState('')
  const [consents, setConsents] = useState<ConsentMap>(
    Object.fromEntries(TERMS_DATA.map((i) => [i.id, false]))
  )
  const [infoError, setInfoError] = useState('')
  const [sending, setSending]     = useState(false)

  const [otp, setOtp]             = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError]   = useState('')
  const [verifying, setVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const otpRefs  = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const rawPhone = phone.replace(/-/g, '')
  const rawBirth = birth.replace(/\./g, '')

  const requiredAll = TERMS_DATA.filter((i) => i.required).every((i) => consents[i.id])
  const allChecked  = TERMS_DATA.every((i) => consents[i.id])

  const formValid =
    name.trim().length >= 2 &&
    rawBirth.length === 6 &&
    ['1', '2', '3', '4'].includes(genderDigit) &&
    carrier !== '' &&
    rawPhone.length === 11 && rawPhone.startsWith('01') &&
    requiredAll

  const startTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCountdown(seconds)
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0 }
        return c - 1
      })
    }, 1000)
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const formatPhone = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
  }
  const formatBirth = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 6)
    if (d.length <= 2) return d
    if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`
    return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`
  }
  const formatCountdown = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ✅ CONSENT_ITEMS → TERMS_DATA 로 수정됨
  const toggleAll = () => {
    const next = !allChecked
    setConsents(Object.fromEntries(TERMS_DATA.map((i) => [i.id, next])))
  }
  const toggleOne = (id: string) => setConsents((p) => ({ ...p, [id]: !p[id] }))

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]; next[idx] = digit; setOtp(next)
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus()
  }
  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
  }
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (digits.length === 6) { setOtp(digits.split('')); otpRefs.current[5]?.focus() }
    e.preventDefault()
  }

  const handleSend = async () => {
    if (!formValid || sending) return
    setInfoError('')
    setSending(true)
    const res = await fetch('/api/auth/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), birth: rawBirth, genderDigit, carrier, phone: rawPhone }),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) { setInfoError(data.error || 'SMS 발송에 실패했습니다.'); return }
    setStep('otp')
    setOtp(['', '', '', '', '', ''])
    startTimer(180)
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }

  const handleResend = async () => {
    setOtpError('')
    setSending(true)
    const res = await fetch('/api/auth/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), birth: rawBirth, genderDigit, carrier, phone: rawPhone }),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) { setOtpError(data.error || '재발송에 실패했습니다.'); return }
    setOtp(['', '', '', '', '', ''])
    startTimer(180)
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }

  const handleVerify = async () => {
    if (!draft || otp.join('').length !== 6 || countdown === 0) return
    setOtpError('')
    setVerifying(true)
    try {
      const vRes = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: rawPhone, otp: otp.join('') }),
      })
      const vData = await vRes.json()
      if (!vRes.ok) { setOtpError(vData.error || '인증에 실패했습니다.'); return }

      const sRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: draft.username,
          password: draft.password,
          phone: vData.phone,
          verifiedToken: vData.verifiedToken,
        }),
      })
      const sData = await sRes.json()
      if (!sRes.ok) { setOtpError(sData.error || '회원가입에 실패했습니다. 처음부터 다시 시도해주세요.'); return }

      const loginResult = await signIn('credentials', {
        username: draft.username,
        password: draft.password,
        redirect: false,
      })
      sessionStorage.removeItem('signup_draft')

      if (loginResult?.error) { router.push('/login') }
      else { router.push('/'); router.refresh() }
    } catch {
      setOtpError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setVerifying(false)
    }
  }

  if (!draft) return null

  return (
    <div className="min-h-screen max-w-[390px] mx-auto flex flex-col bg-white">
      <div className="flex items-center px-4 pt-14 pb-2">
        <button
          onClick={() => step === 'otp' ? setStep('info') : router.back()}
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#181818" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex gap-2 ml-auto">
          <div className="h-1 w-8 rounded-full bg-neutral-900" />
          <div className="h-1 w-8 rounded-full bg-neutral-900" />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 overflow-y-auto">
        {step === 'info' ? (
          <InfoStep
            name={name} birth={birth} genderDigit={genderDigit}
            carrier={carrier} phone={phone} formValid={formValid}
            sending={sending} error={infoError}
            consents={consents} allChecked={allChecked}
            onNameChange={setName}
            onBirthChange={(v) => setBirth(formatBirth(v))}
            onGenderDigitChange={(v) => setGenderDigit(v.replace(/\D/g, '').slice(0, 1))}
            onCarrierChange={setCarrier}
            onPhoneChange={(v) => setPhone(formatPhone(v))}
            onToggleAll={toggleAll}
            onToggleOne={toggleOne}
            onSend={handleSend}
          />
        ) : (
          <OtpStep
            phone={phone} otp={otp} verifying={verifying || sending}
            countdown={countdown} error={otpError} otpRefs={otpRefs}
            onOtpChange={handleOtpChange}
            onOtpKeyDown={handleOtpKeyDown}
            onOtpPaste={handleOtpPaste}
            onResend={handleResend}
            onVerify={handleVerify}
            formatCountdown={formatCountdown}
          />
        )}
      </div>
    </div>
  )
}

/* ─── 정보 입력 단계 ─── */
function InfoStep({
  name, birth, genderDigit, carrier, phone, formValid, sending, error,
  consents, allChecked,
  onNameChange, onBirthChange, onGenderDigitChange, onCarrierChange, onPhoneChange,
  onToggleAll, onToggleOne, onSend,
}: {
  name: string; birth: string; genderDigit: string; carrier: string; phone: string
  formValid: boolean; sending: boolean; error: string
  consents: ConsentMap; allChecked: boolean
  onNameChange: (v: string) => void; onBirthChange: (v: string) => void
  onGenderDigitChange: (v: string) => void; onCarrierChange: (v: string) => void
  onPhoneChange: (v: string) => void; onToggleAll: () => void
  onToggleOne: (id: string) => void; onSend: () => void
}) {
  return (
    <>
      <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.5px] text-neutral-900 mt-2 mb-1">
        본인 인증
      </h1>
      <p className="text-[14px] leading-[22px] text-neutral-400 font-medium mb-8">
        실명 확인 후 인증번호를 문자로 발송합니다
      </p>

      <Field label="이름">
        <input
          type="text" value={name} onChange={(e) => onNameChange(e.target.value)}
          placeholder="홍길동" className={inputCls}
        />
      </Field>

      <Field label="생년월일 / 주민번호">
        <div className="flex items-center gap-3">
          <input
            type="tel" inputMode="numeric" value={birth}
            onChange={(e) => onBirthChange(e.target.value)} placeholder="생년월일(6자리)"
            className="w-0 flex-1 h-[48px] border-b border-[#E0E0E0] focus:border-[#181818] outline-none text-[15px] font-medium text-[#181818] placeholder:text-[#C8C8C8] bg-transparent transition-colors pb-1"
          />
          <span className="text-[15px] text-[#9E9E9E]">—</span>
          <div className="w-0 flex-1 flex items-center gap-[6px] h-[48px] border-b border-[#E0E0E0]">
            <input
              type="tel" inputMode="numeric" value={genderDigit}
              onChange={(e) => onGenderDigitChange(e.target.value)}
              maxLength={1} placeholder="0"
              className="w-[20px] h-full outline-none text-[15px] font-medium text-[#181818] placeholder:text-[#C8C8C8] bg-transparent text-center pb-1"
            />
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="w-[8px] h-[8px] rounded-full bg-[#C8C8C8]" />
            ))}
          </div>
        </div>
      </Field>

      <Field label="통신사">
        <div className="grid grid-cols-3 gap-2">
          {CARRIERS.map((c) => (
            <button
              key={c} onClick={() => onCarrierChange(c)}
              className={`h-[44px] rounded-xl text-[13px] font-semibold transition-colors
                ${carrier === c ? 'bg-neutral-900 text-primary' : 'bg-neutral-50 text-neutral-500'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </Field>

      <Field label="휴대폰 번호">
        <input
          type="tel" inputMode="numeric" value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="010-0000-0000" className={inputCls}
        />
      </Field>

      <ConsentSection
        consents={consents} allChecked={allChecked}
        onToggleAll={onToggleAll} onToggleOne={onToggleOne}
      />

      {error && (
        <p className="text-[13px] text-red-500 text-center mb-3">{error}</p>
      )}

      <button
        onClick={onSend} disabled={!formValid || sending}
        className={`w-full h-[56px] rounded-xl text-[15px] font-bold tracking-[-0.25px] mb-12 transition-all active:scale-[0.98]
          ${formValid && !sending ? 'bg-neutral-900 text-primary' : 'bg-neutral-100 text-neutral-300'}`}
      >
        {sending
          ? <span className="flex items-center justify-center gap-2"><SpinnerDark />발송 중...</span>
          : '인증번호 받기'}
      </button>
    </>
  )
}

/* ─── OTP 입력 단계 ─── */
function OtpStep({
  phone, otp, verifying, countdown, error,
  otpRefs, onOtpChange, onOtpKeyDown, onOtpPaste, onResend, onVerify, formatCountdown,
}: {
  phone: string; otp: string[]; verifying: boolean
  countdown: number; error: string
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  onOtpChange: (i: number, v: string) => void
  onOtpKeyDown: (i: number, e: React.KeyboardEvent) => void
  onOtpPaste: (e: React.ClipboardEvent) => void
  onResend: () => void; onVerify: () => void
  formatCountdown: (s: number) => string
}) {
  const otpFull = otp.join('').length === 6
  return (
    <>
      <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.5px] text-neutral-900 mb-2 mt-2">
        인증번호를<br />입력해주세요
      </h1>
      <p className="text-[14px] leading-[22px] text-neutral-400 font-medium mb-10">
        {phone}로 발송된 6자리 번호
      </p>

      <div className="grid grid-cols-6 gap-2 mb-4 w-full" onPaste={onOtpPaste}>
        {otp.map((digit, i) => (
          <input
            key={i} ref={(el) => { otpRefs.current[i] = el }}
            type="tel" inputMode="numeric" maxLength={1} value={digit}
            onChange={(e) => onOtpChange(i, e.target.value)}
            onKeyDown={(e) => onOtpKeyDown(i, e)}
            className={`w-full aspect-square rounded-xl border text-center text-[20px] font-bold text-neutral-900 outline-none transition-colors
              ${digit ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'} focus:border-neutral-900`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        {countdown > 0
          ? <span className={`text-[13px] font-medium tabular-nums ${countdown <= 30 ? 'text-red-500' : 'text-[#00C77A]'}`}>
              {formatCountdown(countdown)}
            </span>
          : <span className="text-[13px] text-neutral-400">시간 만료</span>}
        <button
          onClick={onResend} disabled={verifying}
          className="flex items-center gap-1 text-[13px] font-semibold text-neutral-500 disabled:opacity-50"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          인증번호 재전송
        </button>
      </div>

      {error && <p className="text-[13px] text-red-500 mt-1">{error}</p>}

      <div className="flex-1" />

      <button
        onClick={onVerify} disabled={!otpFull || verifying || countdown === 0}
        className={`w-full h-[56px] rounded-xl text-[15px] font-bold tracking-[-0.25px] mb-12 transition-all active:scale-[0.98]
          ${otpFull && !verifying && countdown > 0 ? 'bg-neutral-900 text-primary' : 'bg-neutral-100 text-neutral-300'}`}
      >
        {verifying
          ? <span className="flex items-center justify-center gap-2"><SpinnerDark />처리 중...</span>
          : '인증 완료'}
      </button>
    </>
  )
}

const PRIVACY_INFO_CONTENT = `수집 항목
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

/* ─── 약관 동의 섹션 ─── */
function ConsentSection({ consents, allChecked, onToggleAll, onToggleOne }: {
  consents: ConsentMap; allChecked: boolean
  onToggleAll: () => void; onToggleOne: (id: string) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="mb-6">
      <button
        onClick={onToggleAll}
        className="w-full flex items-center gap-3 border border-neutral-200 rounded-xl px-4 py-4 mb-4"
      >
        <CheckMark checked={allChecked} size="lg" />
        <span className="text-[16px] font-bold text-neutral-900">전체동의</span>
      </button>

      <div className="flex flex-col">
        {TERMS_DATA.map((item) => (
          <div key={item.id}>
            <div className="flex items-center py-3 border-b border-neutral-100">
              <button
                onClick={() => onToggleOne(item.id)}
                className="flex items-center gap-2.5 flex-1 text-left"
              >
                <CheckMark checked={consents[item.id]} />
                <span className="text-[14px] text-neutral-900 leading-[20px]">
                  {item.label}
                  <span className={`ml-1 text-[12px] ${item.required ? 'text-neutral-400' : 'text-[#B0B0B0]'}`}>
                    ({item.required ? '필수' : '선택'})
                  </span>
                </span>
              </button>
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-8 h-8 flex items-center justify-center text-[#B0B0B0] ml-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  className={`transition-transform duration-200 ${expandedId === item.id ? 'rotate-90' : ''}`}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {expandedId === item.id && (
              <div className="px-3 py-3 bg-[#FAFAFA] border-b border-[#F5F5F5]">
                <p className="text-[12px] leading-[20px] text-[#555555] whitespace-pre-line">
                  {item.content}
                </p>
              </div>
            )}

            {item.sub && consents[item.id] && (
              <div className="flex gap-4 px-2 py-2.5 border-b border-neutral-100">
                {item.sub.map((s) => (
                  <span key={s} className="flex items-center gap-1 text-[12px] text-neutral-500">
                    <CheckMark checked size="sm" />
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => toggleExpand('privacy_info')}
        className="w-full flex items-center justify-between py-4 border-t border-[#F0F0F0] mt-1"
      >
        <span className="text-[13px] text-neutral-400">개인정보 수집 및 이용 안내</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round"
          className={`transition-transform duration-200 ${expandedId === 'privacy_info' ? 'rotate-90' : ''}`}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {expandedId === 'privacy_info' && (
        <div className="px-3 py-3 bg-[#FAFAFA] border-t border-[#F5F5F5]">
          <p className="text-[12px] leading-[20px] text-[#555555] whitespace-pre-line">
            {PRIVACY_INFO_CONTENT}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── 공통 컴포넌트 ─── */
function CheckMark({ checked, size = 'md' }: { checked: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 22 : size === 'sm' ? 14 : 18
  return (
    <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M5 13l4 4L19 7" stroke={checked ? '#181818' : '#D0D0D0'} strokeWidth={size === 'lg' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const inputCls =
  'w-full h-[52px] rounded-xl border border-neutral-200 px-4 text-[15px] font-medium text-neutral-900 placeholder:text-neutral-300 outline-none focus:border-neutral-900 transition-colors bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.25px] mb-2">{label}</p>
      {children}
    </div>
  )
}

function SpinnerDark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="#9E9E9E" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="#181818" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}