'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sellStore } from '@/lib/sellStore'
import type { AnalysisResult } from '@/app/api/analyze/route'

const LEVEL_OPTIONS = [
  { value: 'beginner', label: '초보자' },
  { value: 'amateur',  label: '아마추어' },
  { value: 'pro',      label: '프로' },
]

export default function RegisterClient() {
  const router = useRouter()
  const params = useSearchParams()
  const sport = sellStore.sport || params.get('sport') || ''
  const productType = sellStore.productType || params.get('tab') || ''
  const result = sellStore.analysisResult as AnalysisResult | null

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [levels, setLevels] = useState<string[]>([])
  const [registering, setRegistering] = useState(false)
  const [allowOffer, setAllowOffer] = useState(true)
  const [shippingType, setShippingType] = useState<'included' | 'separate' | ''>('')
  const [shippingFeeType, setShippingFeeType] = useState<'prepaid' | 'cod' | ''>('')
  const [shippingFee, setShippingFee] = useState('')
  const [allowMeetup, setAllowMeetup] = useState(true)

  const handleRegister = async () => {
    const shippingValid = shippingType === 'included' ||
      (shippingType === 'separate' && !!shippingFeeType && !!shippingFee)
    if (!name || !price || !result || !sport || !shippingType || !shippingValid) return
    setRegistering(true)
    try {
      // 1. Cloudinary 업로드
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: sellStore.compressedImages }),
      })
      if (!uploadRes.ok) throw new Error((await uploadRes.json()).error ?? '업로드 실패')
      const { urls } = await uploadRes.json()

      // 2. 상품 DB 저장
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: Number(price.replace(/,/g, '')),
          sport,
          productType,
          level: levels.length > 0 ? levels.join(',') : null,
          allowOffer,
          shippingType:    shippingType    || null,
          shippingFeeType: shippingFeeType || null,
          shippingFee:     shippingFee ? Number(shippingFee) : null,
          allowMeetup,
          metadata: {
            ...sellStore.formData,
            wearScore: result.wearScore,
            appearanceScore: result.appearanceScore,
            functionalScore: result.functionalScore,
            usage: result.usage,
            damage: result.damage,
            damageParts: result.damageParts,
            functional: result.functional,
            functionalReason: result.functionalReason,
            appearance: result.appearance,
            comment: result.comment,
          },
          images: urls,
          grade: result.grade,
          score: result.score,
        }),
      })
      if (!productRes.ok) throw new Error((await productRes.json()).error ?? '등록 실패')
      const product = await productRes.json()

      // 스토어 초기화
      sellStore.files = []
      sellStore.formData = {}
      sellStore.analysisResult = null
      sellStore.compressedImages = []

      router.push(`/products/${product.id}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : '등록 중 오류가 발생했어요')
      setRegistering(false)
    }
  }

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[14px] text-neutral-400">AI 인증을 먼저 완료해주세요</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 pt-6 pb-4">
        <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.5px] text-neutral-900 mb-2">
          상품 정보를 입력해주세요
        </h1>
        <p className="text-[14px] leading-[22px] text-neutral-400 font-medium">
          구매자에게 보여질 정보예요
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          {/* 상품명 */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="상품명 *"
            className="w-full h-[44px] px-4 rounded-[9px] border border-neutral-200 text-[14px] text-neutral-900 placeholder:text-[#BDBDBD] outline-none focus:border-neutral-900"
          />

          {/* 가격 */}
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="판매 가격 *"
              className="w-full h-[44px] px-4 pr-8 rounded-[9px] border border-neutral-200 text-[14px] text-neutral-900 placeholder:text-[#BDBDBD] outline-none focus:border-neutral-900"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">원</span>
          </div>

          {/* 대상 레벨 */}
          <div className="flex gap-2">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLevels((prev) =>
                  prev.includes(opt.value) ? prev.filter((v) => v !== opt.value) : [...prev, opt.value]
                )}
                className={`flex-1 h-[36px] rounded-[9px] text-[12px] font-semibold border transition-colors ${
                  levels.includes(opt.value)
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-500 border-neutral-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 상품 설명 */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상품 설명 (선택)"
            rows={3}
            className="w-full px-4 py-3 rounded-[9px] border border-neutral-200 text-[14px] text-neutral-900 placeholder:text-[#BDBDBD] outline-none focus:border-neutral-900 resize-none"
          />

          {/* 거래 설정 */}
          <div className="flex flex-col gap-3 pt-1">
            {/* 가격 제안 */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-neutral-900">가격 제안 받기</span>
              <div className="flex gap-1.5">
                {(['허용', '불가'] as const).map((label) => {
                  const val = label === '허용'
                  return (
                    <button
                      key={label}
                      onClick={() => setAllowOffer(val)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
                        allowOffer === val ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 직거래 */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-neutral-900">직거래</span>
              <div className="flex gap-1.5">
                {(['가능', '불가'] as const).map((label) => {
                  const val = label === '가능'
                  return (
                    <button
                      key={label}
                      onClick={() => setAllowMeetup(val)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
                        allowMeetup === val ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 택배비 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-neutral-900">택배비</span>
                <div className="flex gap-1.5">
                  {([['included', '배송비 포함'], ['separate', '배송비 별도']] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => { setShippingType(val); setShippingFeeType(''); setShippingFee('') }}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
                        shippingType === val ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {shippingType === 'separate' && (
                <div className="flex flex-col gap-2 pl-1">
                  <div className="flex gap-1.5">
                    {([['prepaid', '선불'], ['cod', '착불']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setShippingFeeType(val)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
                          shippingFeeType === val ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(e.target.value)}
                      placeholder="배송비 금액"
                      className="w-full h-[40px] px-4 pr-8 rounded-[9px] border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-[#BDBDBD] outline-none focus:border-neutral-900"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">원</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex-shrink-0 px-4 pb-6 pt-3">
        <button
          onClick={handleRegister}
          disabled={
            !name || !price || !sport || registering ||
            !shippingType ||
            (shippingType === 'separate' && (!shippingFeeType || !shippingFee))
          }
          className="w-full h-[44px] rounded-[9px] bg-neutral-900 text-white text-[14px] font-bold active:scale-[0.98] transition-transform disabled:opacity-40"
        >
          {registering ? '등록 중...' : '상품 등록 완료'}
        </button>
      </div>
    </div>
  )
}
