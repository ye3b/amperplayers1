'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sellStore } from '@/lib/sellStore'
import type { AnalysisResult } from '@/app/api/analyze/route'

// ─────────────────────────────────────────────
// 등급 설정
// ─────────────────────────────────────────────
const GRADE_CONFIG = {
  S: { label: 'S급', color: '#00C471', bg: '#E8FAF2', desc: '새상품 수준' },
  A: { label: 'A급', color: '#3B82F6', bg: '#EFF6FF', desc: '상태 양호' },
  B: { label: 'B급', color: '#F59E0B', bg: '#FFFBEB', desc: '일반 중고' },
  C: { label: 'C급', color: '#EF4444', bg: '#FEF2F2', desc: '손상 있음' },
  F: { label: 'F급', color: '#7F1D1D', bg: '#FEE2E2', desc: '거래 비추천' },
}

// ─────────────────────────────────────────────
// 이미지 압축 (Canvas, max 1024px, JPEG 80%)
// ─────────────────────────────────────────────
async function compressImage(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const MAX = 1024
      let { width, height } = img

      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width)
          width = MAX
        } else {
          width = Math.round((width * MAX) / height)
          height = MAX
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      URL.revokeObjectURL(url)

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('압축 실패')); return }
          const reader = new FileReader()
          reader.onloadend = () => {
            const dataUrl = reader.result as string
            // "data:image/jpeg;base64,XXXX" → base64 부분만 추출
            const base64 = dataUrl.split(',')[1]
            resolve({ data: base64, mediaType: 'image/jpeg' })
          }
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        0.8,
      )
    }

    img.onerror = () => reject(new Error('이미지를 불러올 수 없어요'))
    img.src = url
  })
}

// ─────────────────────────────────────────────
// 분석 항목 행
// ─────────────────────────────────────────────
function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <span className="text-[13px] text-neutral-400 flex-shrink-0">{label}</span>
      <span
        className={`text-[13px] text-right leading-[20px] break-keep ${
          highlight ? 'font-bold text-neutral-900' : 'font-medium text-neutral-700'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────
// 로딩 애니메이션
// ─────────────────────────────────────────────
function AnalyzingView({ thumbs }: { thumbs: string[] }) {
  const [step, setStep] = useState(0)
  const steps = ['이미지 전처리 중', '외관 손상 감지 중', '기능 상태 분석 중', '등급 산정 중']

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 1200)
    return () => clearInterval(id)
  }, [steps.length])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
      {/* 사진 썸네일 미리보기 */}
      {thumbs.length > 0 && (
        <div className="flex gap-2 justify-center">
          {thumbs.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* 스캔 아이콘 */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-neutral-100" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-neutral-900 animate-spin"
          style={{ animationDuration: '1s' }}
        />
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5L12 2Z"
            stroke="#181818"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div>
        <p className="text-[17px] font-bold text-neutral-900 mb-1">AI 상태 분석 중</p>
        <p className="text-[13px] text-neutral-400 min-h-[20px] transition-all">{steps[step]}…</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function AiClient() {
  const router = useRouter()
  const params = useSearchParams()
  // sellStore.sport은 detail 단계에서 설정되지만, 페이지 리로드 시를 대비해 URL 파라미터를 fallback으로 사용
  const sport = sellStore.sport || params.get('sport') || ''
  const productType = sellStore.productType || params.get('tab') || ''

  const [status, setStatus] = useState<'analyzing' | 'done' | 'error'>('analyzing')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [thumbs, setThumbs] = useState<string[]>([])
  const hasFetched = useRef(false)
  const compressedRef = useRef<{ data: string; mediaType: string }[]>([])

  const handleNext = () => {
    if (!result) return
    sellStore.analysisResult = result as unknown as Record<string, unknown>
    sellStore.compressedImages = compressedRef.current
    router.push(`/sell/register?sport=${sport}&tab=${productType}`)
  }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const files = sellStore.files

    if (files.length === 0) {
      // 파일 없이 직접 접근한 경우 이전 페이지로
      router.replace('/sell/price')
      return
    }

    // 미리보기 생성
    const urls = files.map((f) => URL.createObjectURL(f))
    setThumbs(urls)

    const run = async () => {
      try {
        // 이미지 압축 및 base64 변환
        const compressed = await Promise.all(files.map(compressImage))
        compressedRef.current = compressed  // 등록 시 재사용

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: compressed }),
        })

        if (!res.ok) {
          let msg = '서버 오류'
          try { msg = (await res.json()).error ?? msg } catch {}
          throw new Error(msg)
        }

        let data: AnalysisResult
        try {
          data = await res.json()
        } catch {
          throw new Error('분석 결과를 파싱할 수 없어요')
        }
        setResult(data)
        setStatus('done')
      } catch (e) {
        console.error('[AI 분석 오류]', e)
        setErrorMsg(e instanceof Error ? e.message : String(e))
        setStatus('error')
      } finally {
        urls.forEach((u) => URL.revokeObjectURL(u))
      }
    }

    run()
  }, [router])

  // ─── 로딩 ───
  if (status === 'analyzing') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnalyzingView thumbs={thumbs} />
      </div>
    )
  }

  // ─── 오류 ───
  if (status === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-error-light flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-[16px] font-bold text-neutral-900 mb-1">분석에 실패했어요</p>
          <p className="text-[13px] text-neutral-400">{errorMsg}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="mt-2 h-[44px] px-8 rounded-[9px] bg-neutral-900 text-white text-[14px] font-bold"
        >
          다시 시도
        </button>
      </div>
    )
  }

  // ─── 결과 ───
  if (!result) return null
  const grade = GRADE_CONFIG[result.grade]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">

        {/* 등급 카드 */}
        <div
          className="rounded-2xl p-5 mb-5 flex items-center gap-4"
          style={{ backgroundColor: grade.bg }}
        >
          {/* 등급 뱃지 */}
          <div
            className="w-[72px] h-[72px] rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
            style={{ backgroundColor: grade.color }}
          >
            <span className="text-[28px] font-black text-white leading-none">{result.grade}</span>
            <span className="text-[9px] font-bold text-white/80 mt-0.5">GRADE</span>
          </div>

          <div className="flex-1">
            <p className="text-[18px] font-black text-neutral-900">{grade.label}</p>
            <p className="text-[13px] font-medium" style={{ color: grade.color }}>{grade.desc}</p>

            {/* 점수 바 */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-neutral-400">상태 점수</span>
                <span className="text-[13px] font-black text-neutral-900">{result.score}점</span>
              </div>
              <div className="h-[5px] rounded-full bg-white/70">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${result.score}%`, backgroundColor: grade.color }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 분석 상세 */}
        <div className="bg-neutral-50 rounded-2xl px-4 py-1 mb-5">
          <InfoRow label="사용감 정도" value={result.usage} highlight />
          <InfoRow label="손상 여부" value={result.damage} highlight />
          <InfoRow label="주요 손상 부위" value={result.damageParts} />
          <InfoRow
            label="기능적 문제"
            value={result.functional === '있음' ? `있음 — ${result.functionalReason}` : '없음'}
            highlight={result.functional === '있음'}
          />
          <InfoRow label="외관 상태" value={result.appearance} />
        </div>

        {/* 종합 코멘트 */}
        <div className="rounded-2xl border border-neutral-200 px-4 py-4 mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5L12 2Z"
                stroke="#181818"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[12px] font-bold text-neutral-900">AI 종합 코멘트</span>
          </div>
          <p className="text-[13px] text-neutral-700 leading-[20px] whitespace-pre-line break-keep">
            {result.comment}
          </p>
        </div>

        {/* 주의 안내 */}
        <div className="flex items-start gap-2 px-1">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-[1px]">
            <circle cx="7" cy="7" r="5.5" stroke="#C8C8C8" strokeWidth="1" />
            <line x1="7" y1="6.5" x2="7" y2="10" stroke="#C8C8C8" strokeWidth="1" strokeLinecap="round" />
            <circle cx="7" cy="4.5" r="0.5" fill="#C8C8C8" />
          </svg>
          <p className="text-[11px] text-neutral-300 leading-[16px]">
            AI 분석은 사진을 기반으로 하며 실제 상태와 다를 수 있습니다.
            등급은 상품 설명에 참고용으로 표시됩니다.
          </p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex-shrink-0 px-4 pb-6 pt-3 flex flex-col gap-3">
        <button
          onClick={handleNext}
          className="w-full h-[44px] rounded-[9px] bg-neutral-900 text-white text-[14px] font-bold active:scale-[0.98] transition-transform"
        >
          다음
        </button>
        <button
          onClick={() => router.back()}
          className="w-full h-[38px] text-[13px] font-medium text-neutral-400"
        >
          사진 다시 찍기
        </button>
      </div>
    </div>
  )
}
