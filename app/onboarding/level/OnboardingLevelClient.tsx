'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

const SPORT_META: Record<string, { label: string; emoji: string }> = {
  soccer:      { label: '축구',      emoji: '⚽' },
  futsal:      { label: '풋살',      emoji: '🥅' },
  basketball:  { label: '농구',      emoji: '🏀' },
  baseball:    { label: '야구',      emoji: '⚾' },
  tennis:      { label: '테니스',    emoji: '🎾' },
  badminton:   { label: '배드민턴',  emoji: '🏸' },
  volleyball:  { label: '배구',      emoji: '🏐' },
  golf:        { label: '골프',      emoji: '⛳' },
  swimming:    { label: '수영',      emoji: '🏊' },
  cycling:     { label: '자전거',    emoji: '🚴' },
  running:     { label: '러닝',      emoji: '🏃' },
  fitness:     { label: '헬스',      emoji: '💪' },
  climbing:    { label: '클라이밍',  emoji: '🧗' },
  skiing:      { label: '스키',      emoji: '⛷️' },
  snowboard:   { label: '스노보드',  emoji: '🏂' },
  surfing:     { label: '서핑',      emoji: '🏄' },
  tabletennis: { label: '탁구',      emoji: '🏓' },
  boxing:      { label: '복싱',      emoji: '🥊' },
}

const LEVELS = [
  { id: 'beginner', label: '입문',      desc: '이제 막 시작했어요', activeBg: 'bg-[#E8F8F1]', activeText: 'text-[#00A65A]', activeBorder: 'border-[#00C77A]' },
  { id: 'amateur',  label: '아마추어',  desc: '취미로 즐겨요',      activeBg: 'bg-[#FFF8E8]', activeText: 'text-[#B07800]', activeBorder: 'border-[#FFB800]' },
  { id: 'pro',      label: '고수',      desc: '실력이 뛰어나요',    activeBg: 'bg-[#FFF0F0]', activeText: 'text-[#C03030]', activeBorder: 'border-[#FF4444]' },
]

export default function OnboardingLevelClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { update: updateSession } = useSession()
  const sportIds = (searchParams.get('sports') ?? '').split(',').filter(Boolean)
  const from = searchParams.get('from') ?? ''

  const [levels, setLevels] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const allSelected = sportIds.length > 0 && sportIds.every((id) => levels[id])

  const handleSave = async () => {
    if (!allSelected || saving) return
    setSaving(true)
    setError('')

    const res = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sports: sportIds.map((sport) => ({ sport, level: levels[sport] })),
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || '저장에 실패했습니다.')
      setSaving(false)
      return
    }

    // JWT 토큰 갱신 (onboardingCompleted 반영)
    await updateSession()
    router.replace(from === 'profile' ? '/profile' : '/')
  }

  return (
    <div className="min-h-screen max-w-[390px] mx-auto flex flex-col bg-white">
      <div className="relative flex items-center justify-center px-4 pt-14 pb-2">
        {/* 뒤로가기 */}
        <button onClick={() => router.back()} className="absolute left-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#181818" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        {/* 진행 표시 점 */}
        <div className="flex gap-1.5">
          {[1, 2].map((s) => (
            <button key={s} className="rounded-full transition-all duration-300 w-6 h-1.5 bg-[#181818]" />
          ))}
        </div>
        {/* 건너뛰기 */}
        <button
          onClick={async () => {
            await fetch('/api/user/preferences', { method: 'DELETE' })
            await updateSession()
            router.replace(from === 'profile' ? '/profile' : '/')
          }}
          className="absolute right-4 text-[12px] leading-[16px] font-medium text-[#9E9E9E] tracking-[0.25px]"
        >
          건너뛰기
        </button>
      </div>

      <div className="px-4 pt-6 pb-4">

        <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.5px] text-[#181818] mb-2">
          각 종목의<br />숙련도를 알려주세요
        </h1>
        <p className="text-[14px] leading-[22px] text-[#9E9E9E] font-medium">
          딱 맞는 상품을 추천해드려요
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-3">
        {sportIds.map((id) => {
          const sport = SPORT_META[id]
          if (!sport) return null
          const selected = levels[id]
          return (
            <div key={id} className="border border-[#F0F0F0] rounded-2xl px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[20px] leading-none">{sport.emoji}</span>
                <span className="text-[15px] font-bold text-[#181818]">{sport.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((lv) => {
                  const isActive = selected === lv.id
                  return (
                    <button
                      key={lv.id}
                      onClick={() => setLevels((p) => ({ ...p, [id]: lv.id }))}
                      className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 transition-all active:scale-[0.96]
                        ${isActive ? `${lv.activeBg} ${lv.activeBorder}` : 'bg-[#FAFAFA] border-[#F0F0F0]'}`}
                    >
                      <span className={`text-[12px] font-bold leading-none ${isActive ? lv.activeText : 'text-[#9E9E9E]'}`}>
                        {lv.label}
                      </span>
                      <span className={`text-[10px] leading-none ${isActive ? lv.activeText : 'text-[#C8C8C8]'}`}>
                        {lv.desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pb-12 pt-4 bg-white z-20">
        {error && <p className="text-[13px] text-red-500 text-center mb-3">{error}</p>}
        <button
          onClick={handleSave}
          disabled={!allSelected || saving}
          className={`w-full h-[56px] rounded-xl text-[15px] font-bold tracking-[-0.25px] transition-all active:scale-[0.98]
            ${allSelected && !saving ? 'bg-[#181818] text-[#00F5A0]' : 'bg-[#F0F0F0] text-[#C8C8C8]'}`}
        >
          {saving
            ? <span className="flex items-center justify-center gap-2">
                <Spinner />저장 중...
              </span>
            : allSelected ? 'Players 시작하기' : '모든 종목의 숙련도를 선택해주세요'}
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="#9E9E9E" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="#181818" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
