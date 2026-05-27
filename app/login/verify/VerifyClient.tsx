'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'info' | 'otp'

const CARRIERS = ['SKT', 'KT', 'LG U+', 'SKT 알뜰', 'KT 알뜰', 'LG 알뜰']

const CONSENT_ITEMS = [
  { id: 'terms',     label: 'Players 이용약관',                              required: true },
  { id: 'identity',  label: '휴대폰 본인확인서비스',                          required: true },
  { id: 'location',  label: '위치정보 이용약관 동의',                         required: true },
  { id: 'marketing', label: '마케팅 목적 개인정보 수집 및 이용 동의',          required: false },
  { id: 'ad',        label: '광고성 정보 수신 동의',                           required: false,
    sub: ['앱 푸시', 'Players 채팅', '카카오톡', 'SMS'] },
  { id: 'custom',    label: '맞춤형 광고 노출을 위한 개인정보 활용 동의',      required: false },
]

type ConsentMap = Record<string, boolean>

export default function VerifyClient() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('info')

  // 입력 필드
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')
  const [genderDigit, setGenderDigit] = useState('')
  const [carrier, setCarrier] = useState('')
  const [phone, setPhone] = useState('')

  // 동의
  const [consents, setConsents] = useState<ConsentMap>(
    Object.fromEntries(CONSENT_ITEMS.map((i) => [i.id, false]))
  )
  const requiredAll = CONSENT_ITEMS.filter((i) => i.required).every((i) => consents[i.id])
  const allChecked  = CONSENT_ITEMS.every((i) => consents[i.id])

  const toggleAll = () => {
    const next = !allChecked
    setConsents(Object.fromEntries(CONSENT_ITEMS.map((i) => [i.id, next])))
  }
  const toggleOne = (id: string) =>
    setConsents((prev) => ({ ...prev, [id]: !prev[id] }))

  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

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

  const rawPhone = phone.replace(/-/g, '')
  const rawBirth = birth.replace(/\./g, '')

  const formValid =
    name.trim().length >= 2 &&
    rawBirth.length === 6 &&
    ['1', '2', '3', '4'].includes(genderDigit) &&
    carrier !== '' &&
    rawPhone.length === 11 && rawPhone.startsWith('01') &&
    requiredAll

  const otpFull = otp.join('').length === 6

  const handleSend = async () => {
    if (!formValid) return
    setError('')
    setSending(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSending(false)
    setStep('otp')
    setCountdown(180)
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (digits.length === 6) {
      setOtp(digits.split(''))
      otpRefs.current[5]?.focus()
    }
    e.preventDefault()
  }

  const handleVerify = async () => {
    if (!otpFull || countdown === 0) return
    setError('')
    setVerifying(true)
    await new Promise((r) => setTimeout(r, 1200))
    setVerifying(false)
    // 신규 가입자: 관심 종목 선택 페이지로 이동
    // TODO: API 응답에서 isNewUser 여부 확인 후 분기
    router.push('/signup/sports')
  }

  const formatCountdown = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="min-h-screen max-w-[390px] mx-auto flex flex-col bg-white">
      {/* 상단 바 */}
      <div className="flex items-center px-4 pt-14 pb-2">
        <button
          onClick={() => (step === 'otp' ? setStep('info') : router.back())}
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#181818" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col px-4 overflow-y-auto">
        {step === 'info' ? (
          <InfoStep
            name={name} birth={birth} genderDigit={genderDigit}
            carrier={carrier} phone={phone} formValid={formValid} sending={sending}
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
            phone={phone} otp={otp} otpFull={otpFull}
            verifying={verifying} countdown={countdown} error={error}
            otpRefs={otpRefs}
            onOtpChange={handleOtpChange}
            onOtpKeyDown={handleOtpKeyDown}
            onOtpPaste={handleOtpPaste}
            onResend={() => { setCountdown(180); setOtp(['', '', '', '', '', '']) }}
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
  name, birth, genderDigit, carrier, phone, formValid, sending,
  consents, allChecked,
  onNameChange, onBirthChange, onGenderDigitChange, onCarrierChange, onPhoneChange,
  onToggleAll, onToggleOne, onSend,
}: {
  name: string; birth: string; genderDigit: string; carrier: string; phone: string
  formValid: boolean; sending: boolean
  consents: ConsentMap; allChecked: boolean
  onNameChange: (v: string) => void; onBirthChange: (v: string) => void
  onGenderDigitChange: (v: string) => void; onCarrierChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onToggleAll: () => void; onToggleOne: (id: string) => void; onSend: () => void
}) {
  return (
    <>
      <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.5px] text-[#181818] mt-2 mb-1">
        본인 인증
      </h1>
      <p className="text-[14px] leading-[22px] text-[#9E9E9E] font-medium mb-8">
        실명 확인 후 인증번호를 발송합니다
      </p>

      {/* 이름 */}
      <Field label="이름">
        <input
          type="text" value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="홍길동"
          className={inputCls}
        />
      </Field>

      {/* 생년월일 + 주민번호 뒤 첫자리 */}
      <Field label="생년월일 / 주민번호">
        <div className="flex items-center">
          {/* 생년월일 */}
          <input
            type="tel" inputMode="numeric" value={birth}
            onChange={(e) => onBirthChange(e.target.value)}
            placeholder="생년월일"
            className="flex-1 h-[48px] border-b border-[#E0E0E0] focus:border-[#181818] outline-none text-[15px] font-medium text-[#181818] placeholder:text-[#C8C8C8] bg-transparent transition-colors pb-1"
          />

          {/* 구분자 */}
          <span className="text-[15px] text-[#9E9E9E] mx-3">—</span>

          {/* 주민번호 뒤 첫자리 */}
          <input
            type="tel" inputMode="numeric" value={genderDigit}
            onChange={(e) => onGenderDigitChange(e.target.value)}
            maxLength={1} placeholder="0"
            className="w-[18px] h-[48px] border-b border-[#E0E0E0] focus:border-[#181818] outline-none text-[15px] font-medium text-[#181818] placeholder:text-[#C8C8C8] bg-transparent text-center transition-colors pb-1"
          />

          {/* 마스킹 원 6개 */}
          <div className="flex items-center gap-[6px] ml-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="w-[9px] h-[9px] rounded-full bg-[#9E9E9E]" />
            ))}
          </div>
        </div>
      </Field>

      {/* 통신사 */}
      <Field label="통신사">
        <div className="grid grid-cols-3 gap-2">
          {CARRIERS.map((c) => (
            <button
              key={c} onClick={() => onCarrierChange(c)}
              className={`h-[44px] rounded-xl text-[13px] font-semibold transition-colors
                ${carrier === c ? 'bg-[#181818] text-[#00F5A0]' : 'bg-[#F8F8F8] text-[#757575]'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </Field>

      {/* 휴대폰 번호 */}
      <Field label="휴대폰 번호">
        <input
          type="tel" inputMode="numeric" value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="010-0000-0000"
          className={inputCls}
        />
      </Field>

      {/* 약관 동의 */}
      <ConsentSection consents={consents} allChecked={allChecked} onToggleAll={onToggleAll} onToggleOne={onToggleOne} />

      {/* 인증번호 받기 */}
      <button
        onClick={onSend} disabled={!formValid || sending}
        className={`w-full h-[56px] rounded-xl text-[15px] font-bold tracking-[-0.25px] mb-12 transition-all active:scale-[0.98]
          ${formValid && !sending ? 'bg-[#181818] text-[#00F5A0]' : 'bg-[#F0F0F0] text-[#C8C8C8]'}`}
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
  phone, otp, otpFull, verifying, countdown, error,
  otpRefs, onOtpChange, onOtpKeyDown, onOtpPaste, onResend, onVerify, formatCountdown,
}: {
  phone: string; otp: string[]; otpFull: boolean; verifying: boolean
  countdown: number; error: string
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  onOtpChange: (i: number, v: string) => void
  onOtpKeyDown: (i: number, e: React.KeyboardEvent) => void
  onOtpPaste: (e: React.ClipboardEvent) => void
  onResend: () => void; onVerify: () => void
  formatCountdown: (s: number) => string
}) {
  return (
    <>
      <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.5px] text-[#181818] mb-2 mt-2">
        인증번호를<br />입력해주세요
      </h1>
      <p className="text-[14px] leading-[22px] text-[#9E9E9E] font-medium mb-10">
        {phone}로 발송된 6자리 번호
      </p>

      <div className="grid grid-cols-6 gap-2 mb-4 w-full" onPaste={onOtpPaste}>
        {otp.map((digit, i) => (
          <input
            key={i} ref={(el) => { otpRefs.current[i] = el }}
            type="tel" inputMode="numeric" maxLength={1} value={digit}
            onChange={(e) => onOtpChange(i, e.target.value)}
            onKeyDown={(e) => onOtpKeyDown(i, e)}
            className={`w-full aspect-square rounded-xl border text-center text-[20px] font-bold text-[#181818] outline-none transition-colors
              ${digit ? 'border-[#181818] bg-[#F8F8F8]' : 'border-[#E8E8E8]'} focus:border-[#181818]`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        {countdown > 0
          ? <span className="text-[13px] font-medium text-[#00C77A]">{formatCountdown(countdown)}</span>
          : <span className="text-[13px] text-[#9E9E9E]">시간 만료</span>}
        <button
          onClick={onResend}
          className="flex items-center gap-1 text-[13px] font-semibold text-[#757575]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          인증번호 재전송
        </button>
      </div>

      {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}

      <div className="flex-1" />

      <button
        onClick={onVerify} disabled={!otpFull || verifying || countdown === 0}
        className={`w-full h-[56px] rounded-xl text-[15px] font-bold tracking-[-0.25px] mb-12 transition-all active:scale-[0.98]
          ${otpFull && !verifying && countdown > 0 ? 'bg-[#181818] text-[#00F5A0]' : 'bg-[#F0F0F0] text-[#C8C8C8]'}`}
      >
        {verifying
          ? <span className="flex items-center justify-center gap-2"><SpinnerDark />인증 중...</span>
          : '확인'}
      </button>
    </>
  )
}

/* ─── 약관 동의 섹션 ─── */
function ConsentSection({ consents, allChecked, onToggleAll, onToggleOne }: {
  consents: ConsentMap; allChecked: boolean
  onToggleAll: () => void; onToggleOne: (id: string) => void
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div className="mb-6">
      {/* 전체동의 */}
      <button
        onClick={onToggleAll}
        className="w-full flex items-center gap-3 border border-[#E8E8E8] rounded-xl px-4 py-4 mb-4"
      >
        <CheckIcon checked={allChecked} size="lg" />
        <span className="text-[16px] font-bold text-[#181818]">전체동의</span>
      </button>

      {/* 개별 항목 */}
      <div className="flex flex-col">
        {CONSENT_ITEMS.map((item) => (
          <div key={item.id}>
            {/* 항목 행 */}
            <div className="flex items-center py-3 border-b border-[#F5F5F5]">
              <button onClick={() => onToggleOne(item.id)} className="flex items-center gap-2.5 flex-1 text-left">
                <CheckIcon checked={consents[item.id]} />
                <span className="text-[14px] text-[#181818] leading-[20px]">
                  {item.label}
                  <span className={`ml-1 text-[12px] ${item.required ? 'text-[#9E9E9E]' : 'text-[#B0B0B0]'}`}>
                    ({item.required ? '필수' : '선택'})
                  </span>
                </span>
              </button>
              {/* 펼치기 버튼 */}
              <button
                onClick={() => toggle(item.id)}
                className="w-8 h-8 flex items-center justify-center text-[#B0B0B0] ml-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{ transform: expanded[item.id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* 광고성 정보 수신 하위 항목 */}
            {item.sub && consents[item.id] && (
              <div className="flex gap-4 px-2 py-2.5 border-b border-[#F5F5F5]">
                {item.sub.map((s) => (
                  <span key={s} className="flex items-center gap-1 text-[12px] text-[#757575]">
                    <CheckIcon checked={consents[item.id]} size="sm" />
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 개인정보 수집 및 이용 안내 */}
      <button className="w-full flex items-center justify-between py-4 border-t border-[#F0F0F0] mt-1">
        <span className="text-[13px] text-[#9E9E9E]">개인정보 수집 및 이용 안내</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  )
}

function CheckIcon({ checked, size = 'md' }: { checked: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 22 : size === 'sm' ? 14 : 18
  return (
    <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M5 13l4 4L19 7" stroke={checked ? '#181818' : '#D0D0D0'} strokeWidth={size === 'lg' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── 공통 ─── */
const inputCls =
  'w-full h-[52px] rounded-xl border border-[#E8E8E8] px-4 text-[15px] font-medium text-[#181818] placeholder:text-[#C8C8C8] outline-none focus:border-[#181818] transition-colors bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold text-[#9E9E9E] uppercase tracking-[0.25px] mb-2">{label}</p>
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
