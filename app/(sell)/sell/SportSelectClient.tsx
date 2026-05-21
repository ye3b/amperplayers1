'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SPORTS = [
  { id: 'soccer',      label: '축구',     emoji: '⚽' },
  { id: 'basketball',  label: '농구',     emoji: '🏀' },
  { id: 'baseball',    label: '야구',     emoji: '⚾' },
  { id: 'tennis',      label: '테니스',   emoji: '🎾' },
  { id: 'badminton',   label: '배드민턴', emoji: '🏸' },
  { id: 'volleyball',  label: '배구',     emoji: '🏐' },
  { id: 'golf',        label: '골프',     emoji: '⛳' },
  { id: 'cycling',     label: '자전거',   emoji: '🚴' },
  { id: 'swimming',    label: '수영',     emoji: '🏊' },
  { id: 'running',     label: '러닝',     emoji: '🏃' },
  { id: 'fitness',     label: '헬스',     emoji: '💪' },
  { id: 'skiing',      label: '스키',     emoji: '⛷️' },
  { id: 'snowboard',   label: '스노보드', emoji: '🏂' },
  { id: 'tabletennis', label: '탁구',     emoji: '🏓' },
  { id: 'boxing',      label: '복싱',     emoji: '🥊' },
]

export default function SportSelectClient() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  const handleNext = () => {
    if (!selected) return
    router.push(`/sell/detail?sport=${selected}`)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex-shrink-0 px-5 pt-6 pb-4">
        <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.5px] text-neutral-900 mb-2">
          어떤 종목의 용품인가요?
        </h1>
        <p className="text-[14px] leading-[22px] text-neutral-400 font-medium">
          종목에 맞는 구매자에게 추천돼요
        </p>
      </div>

      {/* 종목 그리드 */}
      <div className="flex-1 overflow-y-auto px-5">
        <div className="grid grid-cols-3 gap-3 pb-4">
          {SPORTS.map((sport) => {
            const isSelected = selected === sport.id
            return (
              <button
                key={sport.id}
                onClick={() => setSelected(sport.id)}
                className={`relative flex flex-col items-center justify-center gap-2 h-[100px] rounded-2xl border-2 transition-all active:scale-[0.96]
                  ${isSelected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-100 bg-neutral-50'}`}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#00F5A0" />
                      <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#181818" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                <span className="text-[28px] leading-none">{sport.emoji}</span>
                <span className={`text-[13px] font-semibold leading-none ${isSelected ? 'text-white' : 'text-neutral-500'}`}>
                  {sport.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 다음 버튼 */}
      <div className="flex-shrink-0 px-5 pb-6 pt-3 border-t border-neutral-100">
        <button
          onClick={handleNext}
          disabled={!selected}
          className={`w-full h-[56px] rounded-xl text-[15px] font-bold tracking-[-0.25px] transition-all active:scale-[0.98]
            ${selected ? 'bg-neutral-900 text-primary' : 'bg-neutral-100 text-neutral-300'}`}
        >
          {selected
            ? `${SPORTS.find((s) => s.id === selected)?.label} 선택 완료`
            : '종목을 선택해주세요'}
        </button>
      </div>
    </div>
  )
}
