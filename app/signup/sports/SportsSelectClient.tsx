'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SPORTS = [
  { id: 'soccer',      label: '축구',      emoji: '⚽' },
  { id: 'futsal',      label: '풋살',      emoji: '🥅' },
  { id: 'basketball',  label: '농구',      emoji: '🏀' },
  { id: 'baseball',    label: '야구',      emoji: '⚾' },
  { id: 'tennis',      label: '테니스',    emoji: '🎾' },
  { id: 'badminton',   label: '배드민턴',  emoji: '🏸' },
  { id: 'volleyball',  label: '배구',      emoji: '🏐' },
  { id: 'golf',        label: '골프',      emoji: '⛳' },
  { id: 'swimming',    label: '수영',      emoji: '🏊' },
  { id: 'cycling',     label: '자전거',    emoji: '🚴' },
  { id: 'running',     label: '러닝',      emoji: '🏃' },
  { id: 'fitness',     label: '헬스',      emoji: '💪' },
  { id: 'climbing',    label: '클라이밍',  emoji: '🧗' },
  { id: 'skiing',      label: '스키',      emoji: '⛷️' },
  { id: 'snowboard',   label: '스노보드',  emoji: '🏂' },
  { id: 'surfing',     label: '서핑',      emoji: '🏄' },
  { id: 'tabletennis', label: '탁구',      emoji: '🏓' },
  { id: 'boxing',      label: '복싱',      emoji: '🥊' },
]

const MIN_SELECT = 1

export default function SportsSelectClient() {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDone = () => {
    if (selected.size < MIN_SELECT || saving) return
    const ids = Array.from(selected).join(',')
    router.push(`/signup/level?sports=${ids}`)
  }

  const handleSkip = async () => {
    await fetch('/api/user/preferences', { method: 'DELETE' })
    router.replace('/')
  }

  return (
    <div className="min-h-screen max-w-[390px] mx-auto flex flex-col bg-white">
      {/* 헤더 */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-6">
          {/* 스텝 인디케이터 */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-[3px] rounded-full transition-all ${s === 2 ? 'w-6 bg-[#181818]' : 'w-3 bg-[#E0E0E0]'}`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-[13px] font-medium text-[#9E9E9E]"
          >
            건너뛰기
          </button>
        </div>

        <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.5px] text-[#181818] mb-2">
          관심 종목을<br />선택해주세요
        </h1>
        <p className="text-[14px] leading-[22px] text-[#9E9E9E] font-medium">
          맞춤 상품을 추천해드릴게요
          {selected.size > 0 && (
            <span className="ml-2 text-[#00C77A] font-semibold">{selected.size}개 선택됨</span>
          )}
        </p>
      </div>

      {/* 종목 그리드 */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {SPORTS.map((sport) => {
            const isSelected = selected.has(sport.id)
            return (
              <button
                key={sport.id}
                onClick={() => toggle(sport.id)}
                className={`
                  relative flex flex-col items-center justify-center gap-2
                  h-[100px] rounded-2xl border-2 transition-all active:scale-[0.96]
                  ${isSelected
                    ? 'border-[#181818] bg-[#181818]'
                    : 'border-[#F0F0F0] bg-[#FAFAFA]'}
                `}
              >
                {/* 선택 체크 */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#00F5A0" />
                      <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#181818" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                <span className="text-[28px] leading-none">{sport.emoji}</span>
                <span className={`text-[13px] font-semibold leading-none ${isSelected ? 'text-white' : 'text-[#757575]'}`}>
                  {sport.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-5 pb-12 pt-4 border-t border-[#F5F5F5]">
        <button
          onClick={handleDone}
          disabled={selected.size < MIN_SELECT || saving}
          className={`
            w-full h-[56px] rounded-xl text-[15px] font-bold tracking-[-0.25px] transition-all active:scale-[0.98]
            ${selected.size >= MIN_SELECT && !saving
              ? 'bg-[#181818] text-[#00F5A0]'
              : 'bg-[#F0F0F0] text-[#C8C8C8]'}
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
            : selected.size >= MIN_SELECT
              ? `${selected.size}개 종목으로 시작하기`
              : '1개 이상 선택해주세요'}
        </button>
      </div>
    </div>
  )
}
