'use client'

import { usePathname, useRouter } from 'next/navigation'

const STEPS = [
  { label: '종목 선택', path: '/sell' },
  { label: '상세 입력', path: '/sell/detail' },
  { label: '사진 등록', path: '/sell/price' },
  { label: 'AI 인증',  path: '/sell/ai' },
]

function stepIndex(pathname: string) {
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (pathname === STEPS[i].path || pathname.startsWith(STEPS[i].path + '/')) {
      return i
    }
  }
  return 0
}

export default function SellProgress() {
  const pathname = usePathname()
  const router = useRouter()
  const current = stepIndex(pathname)

  return (
    <div className="px-5 pt-12 pb-2 bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="-ml-1 p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#181818" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-[20px] font-bold tracking-[-0.5px] text-[#181818]">상품 등록</span>
      </div>

      {/* 단계 바 */}
      <div className="flex gap-1.5 mb-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-[3px] rounded-full transition-colors
              ${i <= current ? 'bg-[#181818]' : 'bg-[#E8E8E8]'}`}
          />
        ))}
      </div>

      {/* 단계 레이블 */}
      <div className="flex">
        {STEPS.map((step, i) => (
          <span
            key={step.path}
            className={`flex-1 text-[11px] text-center
              ${i === current ? 'font-bold text-[#181818]' : 'font-medium text-[#C8C8C8]'}`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}
