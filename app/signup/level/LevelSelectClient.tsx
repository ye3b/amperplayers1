'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'


const ALL_SPORTS: Record<string, { label: string; emoji: string }> = {
  golf:       { label: '골프',   emoji: '⛳' },
  soccer:     { label: '축구',   emoji: '⚽' },
  baseball:   { label: '야구',   emoji: '⚾' },
  running:    { label: '러닝',   emoji: '🏃' },
  cycling:    { label: '자전거', emoji: '🚴' },
  basketball: { label: '농구',   emoji: '🏀' },
}


const LEVELS = [
  {
    id: 'beginner',
    label: '입문',
    desc: '이제 막 시작했어요',
    emoji: '🌱',
    activeBg: 'bg-[#E8F8F1]',
    activeText: 'text-[#00A65A]',
    activeBorder: 'border-[#00C77A]',
  },
  {
    id: 'amateur',
    label: '아마추어',
    desc: '취미로 즐겨요',
    emoji: '⚡',
    activeBg: 'bg-[#FFF8E8]',
    activeText: 'text-[#B07800]',
    activeBorder: 'border-[#FFB800]',
  },
  {
    id: 'pro',
    label: '고수',
    desc: '실력이 뛰어나요',
    emoji: '🔥',
    activeBg: 'bg-[#FFF0F0]',
    activeText: 'text-[#C03030]',
    activeBorder: 'border-error',
  },
]

export default function LevelSelectClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sportIds = (searchParams.get('sports') ?? '').split(',').filter(Boolean)

  const [levels, setLevels] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const setLevel = (sportId: string, levelId: string) =>
    setLevels((prev) => ({ ...prev, [sportId]: levelId }))

  const allSelected = sportIds.length > 0 && sportIds.every((id) => levels[id])

  const handleSkip = async () => {
    await fetch('/api/user/preferences', { method: 'DELETE' })
    router.replace('/')
  }

  const handleDone = async () => {
    if (!allSelected || saving) return
    setSaving(true)
    const sports = sportIds.map((id) => ({ sport: id, level: levels[id] }))
    await fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sports }),
    })
    setSaving(false)
    router.replace('/')
  }

  return (
    <div className="min-h-screen max-w-[390px] mx-auto flex flex-col bg-white">
      {/* 헤더 */}
      <div className="px-4 pt-14 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-[3px] rounded-full transition-all ${s === 3 ? 'w-6 bg-neutral-900' : 'w-3 bg-neutral-200'}`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-[13px] font-medium text-neutral-400"
          >
            건너뛰기
          </button>
        </div>

        <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.5px] text-neutral-900 mb-2">
          각 종목의<br />숙련도를 알려주세요
        </h1>
        <p className="text-[14px] leading-[22px] text-neutral-400 font-medium">
          딱 맞는 상품을 추천해드려요
        </p>
      </div>

      {/* 종목 목록 */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-3">
        {sportIds.map((id) => {
          const sport = ALL_SPORTS[id]
          if (!sport) return null
          const selected = levels[id]
          return (
            <div key={id} className="border border-neutral-100 rounded-2xl px-4 py-4">
              {/* 종목 이름 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[20px] leading-none">{sport.emoji}</span>
                <span className="text-[15px] font-bold text-neutral-900">{sport.label}</span>
              </div>

              {/* 숙련도 버튼 */}
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((lv) => {
                  const isActive = selected === lv.id
                  return (
                    <button
                      key={lv.id}
                      onClick={() => setLevel(id, lv.id)}
                      className={`
                        flex flex-col items-center justify-center gap-1
                        py-3 rounded-xl border-2 transition-all active:scale-[0.96]
                        ${isActive
                          ? `${lv.activeBg} ${lv.activeBorder}`
                          : 'bg-neutral-50 border-neutral-100'}
                      `}
                    >
                      <span className="text-[20px] leading-none">{lv.emoji}</span>
                      <span className={`text-[12px] font-bold leading-none ${isActive ? lv.activeText : 'text-neutral-400'}`}>
                        {lv.label}
                      </span>
                      <span className={`text-[10px] leading-none ${isActive ? lv.activeText : 'text-neutral-300'}`}>
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

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pb-12 pt-4 border-t border-neutral-100 bg-white z-20">
        <button
          onClick={handleDone}
          disabled={!allSelected || saving}
          className={`
            w-full h-[56px] rounded-xl text-[15px] font-bold tracking-[-0.25px] transition-all active:scale-[0.98]
            ${allSelected && !saving
              ? 'bg-neutral-900 text-primary'
              : 'bg-neutral-100 text-neutral-300'}
          `}
        >
          {saving
            ? (
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
                  <circle cx="8" cy="8" r="6" stroke="#9E9E9E" strokeWidth="2" />
                  <path d="M14 8a6 6 0 0 0-6-6" stroke="#181818" strokeWidth="2" strokeLinecap="round" />
                </svg>
                저장 중...
              </span>
            )
            : allSelected
              ? 'Players 시작하기'
              : '모든 종목의 숙련도를 선택해주세요'}
        </button>
      </div>
    </div>
  )
}
