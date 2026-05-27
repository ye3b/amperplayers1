'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'

const SLIDES = [
  {
    id: 0,
    badge: null,
    label: null,
    title: 'Players',
    subtitle: '스포츠 용품\n중고거래 플랫폼',
    description: '내가 쓰던 장비, 다음 선수에게.\n종목별 전문 거래 플랫폼.',
    icon: null,
    accent: false,
    isIntro: true,
  },
  {
    id: 1,
    badge: '기능 01',
    label: '카테고리 & 템플릿',
    title: '종목별\n전문 정보',
    description: '축구공부터 스키 장비까지,\n종목 특성에 맞는 스펙 정보로\n정확한 비교와 빠른 탐색.',
    highlights: ['종목별 상세 스펙 분류', '조건 필터로 즉시 탐색'],
    icon: 'grid-01' as const,
    accent: true,
    isIntro: false,
  },
  {
    id: 2,
    badge: '기능 02',
    label: 'AI 상태 인증',
    title: 'AI가 검증하는\n용품 상태',
    description: '사진 한 장으로 AI가\n마모·손상·기능 위험 요소를 분석.\n믿고 사고, 안심하고 팔고.',
    highlights: ['S~C 등급 상태 점수', '이미지·설명 불일치 탐지'],
    icon: 'shield-check' as const,
    accent: true,
    isIntro: false,
  },
  {
    id: 3,
    badge: '기능 03',
    label: '맞춤 추천',
    title: '나만을 위한\n장비 추천',
    description: '종목, 숙련도, 포지션,\n플레이 스타일까지 반영해\n딱 맞는 용품을 바로 발견.',
    highlights: ['프로필 기반 맞춤 추천', '숙련도·포지션 필터'],
    icon: 'stars' as const,
    accent: true,
    isIntro: false,
  },
]

export default function OnboardingFlow() {
  const [current, setCurrent] = useState(0)
  const [exiting, setExiting] = useState(false)
  const router = useRouter()
  const startX = useRef<number | null>(null)

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      setExiting(true)
      setTimeout(() => {
        setCurrent((c) => c + 1)
        setExiting(false)
      }, 150)
    } else {
      router.push('/login')
    }
  }

  const goTo = (idx: number) => {
    if (idx !== current) {
      setExiting(true)
      setTimeout(() => {
        setCurrent(idx)
        setExiting(false)
      }, 150)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (dx < -50 && current < SLIDES.length - 1) goNext()
    if (dx > 50 && current > 0) goTo(current - 1)
    startX.current = null
  }

  const slide = SLIDES[current]
  const isLast = current === SLIDES.length - 1

  const isIntro = slide.isIntro

  return (
    <div
      className={`relative flex flex-col min-h-screen max-w-[390px] mx-auto overflow-hidden select-none transition-colors duration-300 ${
        isIntro ? 'bg-[#0E0E0E]' : 'bg-white'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 인트로일 때 페이지 전체 배경을 다크로 */}
      {isIntro && <div className="fixed inset-0 bg-[#0E0E0E] -z-10" />}
      {/* 상단 영역 (인트로에서는 숨김) */}
      {!isIntro && (
        <div className="relative flex items-center justify-center px-4 pt-14 pb-2">
          {/* 뒤로가기 */}
          <button
            onClick={() => current > 0 ? goTo(current - 1) : undefined}
            className={`absolute left-4 ${current === 0 ? 'invisible' : ''}`}
          >
            <Icon name="arrow-left" size={20} className="text-[#181818]" />
          </button>

          {/* 진행 표시 점 */}
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-1.5 bg-[#181818]'
                    : 'w-1.5 h-1.5 bg-[#E0E0E0]'
                }`}
              />
            ))}
          </div>

          {/* 건너뛰기 */}
          {!isLast && (
            <button
              onClick={() => router.push('/login')}
              className="absolute right-4 text-[12px] leading-[16px] font-medium text-[#9E9E9E] tracking-[0.25px]"
            >
              건너뛰기
            </button>
          )}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div
        className={`flex-1 flex flex-col px-4 pb-24 ${isIntro ? 'pt-0' : 'pt-8'} transition-opacity duration-150 ${
          exiting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {isIntro ? (
          <IntroSlide />
        ) : (
          <FeatureSlide slide={slide as FeatureSlideData} />
        )}
      </div>

      {/* 하단 버튼 (화면 하단 고정) */}
      <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pb-10 pt-4 z-10 ${
        isIntro ? 'bg-[#0E0E0E]' : 'bg-white'
      }`}>
        <button
          onClick={goNext}
          className={`w-full h-14 text-[14px] leading-[16px] font-bold tracking-[1.5px] uppercase rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${
            isIntro
              ? 'bg-[#00F5A0] text-[#0E0E0E]'
              : 'bg-[#181818] text-[#00F5A0]'
          }`}
        >
          {isLast ? '시작하기' : '다음'}
        </button>
      </div>
    </div>
  )
}

/* ─── 인트로 슬라이드 ─── */
function IntroSlide() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center mt-4">
      {/* 타이틀 텍스트 */}
      <div className="text-center mb-14">
        <p className="text-[34px] leading-[46px] font-bold tracking-[-0.5px] text-white">
          스포츠 용품<br />중고거래 플랫폼
        </p>
        <p className="text-[34px] leading-[46px] font-bold tracking-[-0.5px] text-[#00F5A0] mt-2">
          Players
        </p>
      </div>

      {/* 로고 마크 */}
      <div className="mb-16">
        <svg width="220" height="220" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M83.8878 47.6605C114.733 31.0567 142.859 28.782 154.944 35.5834C161.364 38.6441 171.711 48.5062 166.651 65.5095C160.377 86.5963 133.783 110.398 98.2909 130.122V83.0391C100.942 81.8534 103.632 80.5538 106.331 79.1436C129.083 67.2587 143.959 52.0852 139.559 45.2528C135.157 38.4207 113.144 42.5165 90.3927 54.4015C67.6409 66.2865 52.7649 81.46 57.1661 88.2922C60.3844 93.2879 73.018 92.4397 88.472 86.9771L87.4438 88.1899C44.4791 139.289 71.395 159.199 90.3927 162.77C1.05902 185.827 30.465 126.947 71.6857 97.0769C54.9533 104.577 43.0763 101.872 40.3622 96.2932C33.5548 86.0384 53.0419 64.2646 83.8878 47.6605Z" fill="#00F5A0"/>
        </svg>
      </div>

      {/* 설명 */}
      <p className="text-[16px] leading-[26px] font-medium text-[#757575] text-center">
        내가 쓰던 장비, 다음 선수에게.<br />
        종목별 전문 거래 플랫폼
      </p>
    </div>
  )
}

/* ─── 기능 슬라이드 ─── */
interface FeatureSlideData {
  id: number
  badge: string | null
  label: string | null
  title: string
  description: string
  highlights: string[]
  icon: 'grid-01' | 'shield-check' | 'stars'
}

function FeatureSlide({ slide }: { slide: FeatureSlideData }) {
  const ICON_BG: Record<number, string> = {
    1: 'bg-[#E8FFF6]',
    2: 'bg-[#181818]',
    3: 'bg-[#00F5A0]',
  }
  const ICON_COLOR: Record<number, string> = {
    1: 'text-[#00F5A0]',
    2: 'text-[#00F5A0]',
    3: 'text-[#181818]',
  }
  const VISUAL_BG: Record<number, string> = {
    1: 'bg-[#F8F8F8]',
    2: 'bg-[#181818]',
    3: 'bg-[#00F5A0]',
  }

  return (
    <div className="flex flex-col flex-1">
      {/* 번호 뱃지 */}
      <div className="inline-flex items-center gap-1.5 mb-6">
        <span className="text-[14px] font-bold uppercase tracking-[0.25px] text-[#9E9E9E]">
          {slide.badge}
        </span>
      </div>

      {/* 타이틀 */}
      <h2 className="text-[32px] leading-[40px] font-bold tracking-[-0.5px] text-[#181818] mb-4 whitespace-pre-line">
        {slide.title}
      </h2>

      {/* 비주얼 카드 */}
      <div className={`w-full rounded-2xl ${VISUAL_BG[slide.id]} flex items-center justify-center mb-6 overflow-hidden`}
        style={{ height: '220px' }}
      >
        <FeatureVisual id={slide.id} iconBg={ICON_BG[slide.id]} iconColor={ICON_COLOR[slide.id]} icon={slide.icon} />
      </div>

      {/* 설명 */}
      <p className="text-[15px] leading-[24px] font-medium text-[#757575] mb-6 whitespace-pre-line">
        {slide.description}
      </p>

      {/* 하이라이트 칩 */}
      <div className="flex gap-2 flex-wrap">
        {slide.highlights.map((h) => (
          <div key={h} className="flex items-center gap-1.5 bg-[#F8F8F8] rounded-lg px-3 py-2">
            <Icon name="check-01" size={12} className="text-[#00F5A0]" />
            <span className="text-[12px] leading-[16px] font-medium text-[#181818]">{h}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── 기능별 비주얼 ─── */
function FeatureVisual({ id, iconBg, iconColor, icon }: {
  id: number
  iconBg: string
  iconColor: string
  icon: 'grid-01' | 'shield-check' | 'stars'
}) {
  if (id === 1) {
    return (
      <div className="w-full h-full p-5 flex flex-col justify-center gap-2">
        {/* 카테고리 태그들 */}
        <div className="flex gap-2 flex-wrap">
          {[{ e: '⛳', l: '골프' }, { e: '⚽', l: '축구' }, { e: '🏀', l: '농구' }].map(({ e, l }) => (
            <div key={l} className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-2 shadow-sm">
              <span className="text-base">{e}</span>
              <span className="text-[12px] font-medium text-[#181818]">{l}</span>
            </div>
          ))}
        </div>
        {/* 필터 바 */}
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="filter" size={14} className="text-[#757575]" />
            <span className="text-[11px] font-medium text-[#757575]">조건 필터</span>
          </div>
          <div className="flex gap-1.5">
            {['사이즈 5', '거의새것', '5만원 이하'].map((f) => (
              <span key={f} className="text-[10px] font-bold bg-[#181818] text-[#00F5A0] px-2 py-1 rounded uppercase tracking-[0.25px]">{f}</span>
            ))}
          </div>
        </div>
        {/* 상품 미리보기 */}
        <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E8FFF6] flex items-center justify-center text-xl">⚽</div>
          <div className="flex-1">
            <div className="text-[12px] font-bold text-[#181818]">나이키 프리미어 3</div>
            <div className="text-[10px] text-[#757575] mt-0.5">사이즈 5 · 거의새것</div>
          </div>
          <div className="text-[12px] font-bold text-[#181818]">38,000원</div>
        </div>
      </div>
    )
  }

  if (id === 2) {
    return (
      <div className="w-full h-full p-5 flex flex-col justify-center gap-3">
        {/* AI 분석 카드 */}
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-[#00F5A0] flex items-center justify-center">
                <Icon name="shield-check" size={12} className="text-[#181818]" />
              </div>
              <span className="text-[11px] font-bold text-white uppercase tracking-[0.25px]">AI 상태 분석</span>
            </div>
            {/* S등급 뱃지 */}
            <div className="flex items-center gap-1 bg-[#00F5A0] rounded px-1.5 py-0.5">
              <span className="text-[10px] font-bold text-[#181818] uppercase">S급</span>
            </div>
          </div>
          {/* 분석 항목들 */}
          {[
            { label: '마모도', score: 95 },
            { label: '외관 상태', score: 88 },
            { label: '기능 위험', score: 100 },
          ].map(({ label, score }) => (
            <div key={label} className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] text-white/60 w-16">{label}</span>
              <div className="flex-1 h-1.5 bg-white/20 rounded-full">
                <div
                  className="h-full bg-[#00F5A0] rounded-full"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#00F5A0] w-6 text-right">{score}</span>
            </div>
          ))}
        </div>
        <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
          <Icon name="check-01" size={12} className="text-[#00F5A0]" />
          <span className="text-[11px] text-white/80">설명과 이미지 일치 확인 완료</span>
        </div>
      </div>
    )
  }

  // id === 3
  return (
    <div className="w-full h-full p-5 flex flex-col justify-center gap-3">
      {/* 프로필 */}
      <div className="flex items-center gap-2 bg-white/60 rounded-xl p-3">
        <div className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center text-sm">🏃</div>
        <div>
          <div className="text-[11px] font-bold text-[#181818]">축구 · 미드필더 · 중급</div>
          <div className="text-[10px] text-[#757575]">플레이 스타일: 패스 중심</div>
        </div>
      </div>
      {/* 추천 상품들 */}
      <div className="flex flex-col gap-1.5">
        {[
          { emoji: '👟', name: '아디다스 프레데터', tag: '미드필더 추천', price: '65,000원' },
          { emoji: '⚽', name: '몰텐 공인구', tag: '중급자 최적', price: '28,000원' },
        ].map((item) => (
          <div key={item.name} className="bg-white/60 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm">
              {item.emoji}
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold text-[#181818]">{item.name}</div>
              <div className="text-[10px] text-[#181818] font-bold mt-0.5 bg-[#181818] text-[#00F5A0] px-1.5 py-0.5 rounded inline-block uppercase tracking-[0.25px]">
                {item.tag}
              </div>
            </div>
            <div className="text-[12px] font-bold text-[#181818]">{item.price}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
