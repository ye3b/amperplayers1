'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

const SPORTS = [
  { id: 'golf',       label: '골프',   emoji: '⛳' },
{ id: 'soccer',     label: '축구',   emoji: '⚽' },
{ id: 'baseball',   label: '야구',   emoji: '⚾' },
{ id: 'running',    label: '러닝',   emoji: '🏃' },
{ id: 'cycling',    label: '자전거', emoji: '🚴' },
{ id: 'basketball', label: '농구',   emoji: '🏀' },
]

export default function OnboardingSportsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { update: updateSession } = useSession()
  const from = searchParams.get('from') ?? ''
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [skipping, setSkipping] = useState(false)

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleNext = () => {
    if (selected.size === 0) return
    const params = new URLSearchParams({ sports: Array.from(selected).join(',') })
    if (from) params.set('from', from)
    router.push(`/onboarding/level?${params.toString()}`)
  }

  const handleSkip = async () => {
    setSkipping(true)
    await fetch('/api/user/preferences', { method: 'DELETE' })
    await updateSession()
    router.replace(from === 'profile' ? '/profile' : '/')
  }

  return (
    <div className="min-h-screen max-w-[390px] mx-auto flex flex-col bg-white">
      <div className="relative flex items-center justify-center px-4 pt-14 pb-2">
        {/* 진행 표시 점 */}
        <div className="flex gap-1.5">
          {[1, 2].map((s) => (
            <button key={s} className={`rounded-full transition-all duration-300 ${s === 1 ? 'w-6 h-1.5 bg-[#181818]' : 'w-1.5 h-1.5 bg-[#E0E0E0]'}`} />
          ))}
        </div>
        {/* 건너뛰기 */}
        <button
          onClick={handleSkip} disabled={skipping}
          className="absolute right-4 text-[12px] leading-[16px] font-medium text-[#9E9E9E] tracking-[0.25px] disabled:opacity-50"
        >
          {from === 'profile' ? '뒤로' : '건너뛰기'}
        </button>
      </div>

      <div className="px-4 pt-6 pb-4">

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

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="grid grid-cols-3 gap-3">
          {SPORTS.map((sport) => {
            const isSelected = selected.has(sport.id)
            return (
              <button
                key={sport.id}
                onClick={() => toggle(sport.id)}
                className={`relative flex flex-col items-center justify-center gap-2 h-[100px] rounded-2xl border-2 transition-all active:scale-[0.96]
                  ${isSelected ? 'border-[#181818] bg-[#181818]' : 'border-[#F0F0F0] bg-[#FAFAFA]'}`}
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
                <span className={`text-[13px] font-semibold leading-none ${isSelected ? 'text-white' : 'text-[#757575]'}`}>
                  {sport.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pb-12 pt-4 bg-white z-20">
        <button
          onClick={handleNext}
          disabled={selected.size === 0}
          className={`w-full h-[56px] rounded-xl text-[15px] font-bold tracking-[-0.25px] transition-all active:scale-[0.98]
            ${selected.size > 0 ? 'bg-[#181818] text-[#00F5A0]' : 'bg-[#F0F0F0] text-[#C8C8C8]'}`}
        >
          {selected.size > 0 ? `${selected.size}개 종목 선택 완료` : '1개 이상 선택해주세요'}
        </button>
      </div>
    </div>
  )
}
