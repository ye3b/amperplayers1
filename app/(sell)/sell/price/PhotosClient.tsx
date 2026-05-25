'use client'

import { useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sellStore } from '@/lib/sellStore'

const MAX_PHOTOS = 6

export default function PhotosClient() {
  const router = useRouter()
  const params = useSearchParams()
  const sport = params.get('sport') ?? ''
  const tab   = params.get('tab') ?? ''

  // 미리보기 URL과 실제 File 객체를 함께 관리
  const [photos, setPhotos] = useState<{ url: string; file: File }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const readAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('파일을 읽을 수 없어요'))
      reader.readAsDataURL(file)
    })

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const remaining = MAX_PHOTOS - photos.length
    const sliced = Array.from(files).slice(0, remaining)
    const entries = await Promise.all(
      sliced.map(async (f) => ({ url: await readAsDataURL(f), file: f }))
    )
    setPhotos((prev) => [...prev, ...entries])
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const moveToFront = (index: number) => {
    if (index === 0) return
    setPhotos((prev) => {
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.unshift(item)
      return next
    })
  }

  const handleNext = () => {
    // AI 분석 페이지에서 읽을 수 있도록 파일 목록을 스토어에 저장
    sellStore.files = photos.map((p) => p.file)
    router.push(`/sell/ai?sport=${sport}&tab=${tab}`)
  }

  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i]?.url ?? null)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex-shrink-0 px-5 pt-6 pb-5">
        <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.5px] text-neutral-900 mb-1">
          사진을 등록해주세요
        </h1>
        <p className="text-[14px] text-neutral-400">
          첫 번째 사진이 대표 이미지로 사용돼요
        </p>
      </div>

      {/* 사진 영역 */}
      <div className="flex-1 overflow-y-auto px-[14px]">

        {/* 3×2 사진 그리드 */}
        <div className="grid grid-cols-3 gap-[9px] mb-3">
          {slots.map((url, i) => {
            const isFirst = i === 0

            if (url) {
              return (
                <div key={i} className="relative aspect-square rounded-[9px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`사진 ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                  {isFirst && (
                    <div className="absolute top-1.5 left-1.5 bg-neutral-900/70 rounded px-1.5 py-0.5">
                      <span className="text-[8px] font-bold text-white">대표</span>
                    </div>
                  )}
                  {!isFirst && (
                    <button
                      onClick={() => moveToFront(i)}
                      className="absolute bottom-1 left-1 bg-neutral-900/60 rounded px-1.5 py-0.5"
                    >
                      <span className="text-[8px] text-white font-medium">대표로</span>
                    </button>
                  )}
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-neutral-900/60 rounded-full flex items-center justify-center"
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )
            }

            return (
              <button
                key={i}
                onClick={() => inputRef.current?.click()}
                style={{
                  aspectRatio: '1',
                  borderRadius: '9px',
                  border: `2px dashed ${isFirst ? '#181818' : '#EEEEEE'}`,
                  backgroundColor: isFirst ? '#F8F8F8' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isFirst ? '4px' : '0px',
                }}
              >
                {isFirst ? (
                  <>
                    {/* 카메라 아이콘 (21×21) */}
                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                      <path
                        d="M7.5 4.5H13.5L15 6.5H18C18.55 6.5 19 6.95 19 7.5V16C19 16.55 18.55 17 18 17H3C2.45 17 2 16.55 2 16V7.5C2 6.95 2.45 6.5 3 6.5H6L7.5 4.5Z"
                        stroke="#181818"
                        strokeWidth="1"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      <circle cx="10.5" cy="11.5" r="2.5" stroke="#181818" strokeWidth="1" />
                    </svg>
                    <span className="text-[8px] font-bold text-neutral-900 leading-[13px]">대표</span>
                  </>
                ) : (
                  /* 이미지 아이콘 (18×18) */
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M6.5 3.5H11.5L13 5.5H15.5C16.05 5.5 16.5 5.95 16.5 6.5V14C16.5 14.55 16.05 15 15.5 15H2.5C1.95 15 1.5 14.55 1.5 14V6.5C1.5 5.95 1.95 5.5 2.5 5.5H5L6.5 3.5Z"
                      stroke="#D9D9D9"
                      strokeWidth="1"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <circle cx="9" cy="10" r="2" stroke="#D9D9D9" strokeWidth="1" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        {/* AI 촬영 가이드 */}
        <div
          className="flex items-center gap-[10px] mb-4"
          style={{
            backgroundColor: '#F8F8F8',
            borderRadius: '9px',
            height: '62px',
            paddingLeft: '13px',
            paddingRight: '13px',
          }}
        >
          {/* Info 아이콘 (14×14) */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
            <circle cx="7" cy="7" r="5.5" stroke="#757575" strokeWidth="1" />
            <line x1="7" y1="6.5" x2="7" y2="10" stroke="#757575" strokeWidth="1" strokeLinecap="round" />
            <circle cx="7" cy="4.5" r="0.5" fill="#757575" />
          </svg>
          <div className="flex flex-col gap-[2px]">
            <span className="text-[10px] font-bold text-neutral-700 leading-[15px] tracking-[-0.1px]">
              AI 촬영 가이드
            </span>
            <span className="text-[9px] text-neutral-500 leading-[13px]">
              밑창, 로고, 전체 모습을 포함하면 정확한 상태 인증이 가능해요
            </span>
          </div>
        </div>

      </div>

      {/* 숨김 파일 입력 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />

      {/* AI 상태 인증 시작 버튼 */}
      <div className="flex-shrink-0 px-[17px] pb-6 pt-3 border-t border-neutral-100">
        <button
          onClick={handleNext}
          disabled={photos.length === 0}
          className="w-full transition-all active:scale-[0.98]"
          style={{
            height: '44px',
            borderRadius: '9px',
            backgroundColor: photos.length > 0 ? '#181818' : '#F0F0F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {photos.length > 0 ? (
            <>
              <span className="text-[14px] font-bold text-white tracking-[-0.1px]">
                AI 상태 인증 시작
              </span>
              {/* Stars 아이콘 (19.2×19.2) */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5L12 2Z"
                  stroke="#F8F8F8"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </>
          ) : (
            <span className="text-[14px] font-bold text-neutral-300 tracking-[-0.1px]">
              사진을 1장 이상 등록해주세요
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
