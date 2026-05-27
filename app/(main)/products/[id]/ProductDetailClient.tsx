'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import Badge from '@/components/ui/Badge'
import { SPORTS_TABS, type FieldDef } from '@/app/(sell)/sell/detail/formConfig'

type ToastType = 'success' | 'error'

function Toast({ message, type }: { message: string; type: ToastType }) {
  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold shadow-lg transition-all whitespace-nowrap ${
        type === 'error' ? 'bg-[#EF4444]' : 'bg-[#181818]'
      }`}
    >
      {message}
    </div>
  )
}

// ── 공유 바텀 시트 ──────────────────────────────────────
function ShareSheet({
  url,
  title,
  onClose,
  onToast,
}: {
  url: string
  title: string
  onClose: () => void
  onToast: (msg: string) => void
}) {
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      onToast('링크를 복사했어요')
    } catch {
      onToast('복사에 실패했어요')
    }
    onClose()
  }

  function shareInstagram() {
    // 모바일: Web Share API (네이티브 시트에 인스타그램 포함)
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {})
      onClose()
    } else {
      // 데스크탑: 링크 복사 후 안내
      navigator.clipboard.writeText(url).catch(() => {})
      onToast('링크를 복사했어요. 인스타그램 DM에 붙여넣으세요')
      onClose()
    }
  }

  function shareKakao() {
    const kakao = (window as any).Kakao
    if (kakao?.isInitialized?.()) {
      kakao.Share.sendDefault({
        objectType: 'text',
        text: `${title}\n${url}`,
        link: { mobileWebUrl: url, webUrl: url },
      })
      onClose()
    } else if (navigator.share) {
      // 모바일 네이티브 시트 (카카오톡 포함)
      navigator.share({ title, url }).catch(() => {})
      onClose()
    } else {
      // 데스크탑 fallback: KakaoTalk Web Share URL
      window.open(`https://sharer.kakaopage.com/share/common/?url=${encodeURIComponent(url)}`, '_blank')
      onClose()
    }
  }

  function shareSMS() {
    window.location.href = `sms:?&body=${encodeURIComponent(`${title}\n${url}`)}`
    onClose()
  }

  const items = [
    {
      label: '인스타그램',
      onClick: shareInstagram,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFDC80"/>
              <stop offset="25%" stopColor="#FCAF45"/>
              <stop offset="50%" stopColor="#F77737"/>
              <stop offset="75%" stopColor="#C13584"/>
              <stop offset="100%" stopColor="#833AB4"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
          <circle cx="12" cy="12" r="4" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
          <circle cx="17.5" cy="6.5" r="1" fill="url(#ig-grad)"/>
        </svg>
      ),
    },
    {
      label: '카카오톡',
      onClick: shareKakao,
      icon: (
        <div className="w-[52px] h-[52px] rounded-2xl bg-[#FEE500] flex items-center justify-center">
          <svg width="28" height="26" viewBox="0 0 40 37" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M20 0C8.954 0 0 6.716 0 15.005c0 5.116 3.127 9.614 7.878 12.345l-2.01 7.498a.5.5 0 0 0 .758.558L14.73 30.5A25.3 25.3 0 0 0 20 30.01c11.046 0 20-6.717 20-15.005C40 6.716 31.046 0 20 0z" fill="#3A1D1D"/>
          </svg>
        </div>
      ),
    },
    {
      label: '메시지',
      onClick: shareSMS,
      icon: (
        <div className="w-[52px] h-[52px] rounded-2xl bg-[#34C759] flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        </div>
      ),
    },
    {
      label: '링크 복사',
      onClick: copyLink,
      icon: (
        <div className="w-[52px] h-[52px] rounded-2xl bg-[#F3F3F3] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </div>
      ),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[390px] bg-white rounded-3xl px-6 pt-5 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-[15px] font-bold text-[#181818]">공유하기</p>
          <button onClick={onClose} className="p-1 rounded-full text-[#9E9E9E] hover:text-[#181818]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {items.map(({ label, onClick, icon }) => (
            <button key={label} onClick={onClick} className="flex flex-col items-center gap-2">
              <div className="w-[52px] h-[52px] rounded-2xl overflow-hidden flex items-center justify-center">
                {icon}
              </div>
              <span className="text-[11px] text-[#555] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const GRADE_CONFIG: Record<string, { color: string; bg: string; label: string; desc: string }> = {
  S: { color: '#00C471', bg: '#E8FAF2', label: 'S급', desc: '새것에 가까운 최상급 상태입니다.' },
  A: { color: '#3B82F6', bg: '#EFF6FF', label: 'A급', desc: '사용감이 거의 없는 상급 상태입니다.' },
  B: { color: '#F59E0B', bg: '#FFFBEB', label: 'B급', desc: '일반적인 사용감이 있는 양호한 상태입니다.' },
  C: { color: '#EF4444', bg: '#FEF2F2', label: 'C급', desc: '사용감이 있으며 부분적인 흠집이 있습니다.' },
  F: { color: '#7F1D1D', bg: '#FEE2E2', label: 'F급', desc: '마모나 손상이 상당하여 기능에 영향이 있을 수 있습니다.' },
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: '초보자',
  amateur:  '아마추어',
  pro:      '프로',
}

// metadata 필드 id → unit 매핑 (number 타입 필드에 단위 붙이기)
function getFieldUnit(fields: FieldDef[], id: string): string | null {
  const f = fields.find((f) => f.id === id)
  if (!f) return null
  if (f.type === 'number') return f.unit ?? null
  return null
}

// 멀티셀렉트 값은 JSON 배열일 수 있음
function parseMetaValue(value: string): string {
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.join(', ')
    return String(parsed)
  } catch {
    return value
  }
}

interface Seller {
  id: string
  name: string | null
  username: string | null
  image: string | null
  createdAt: Date
  _count: { products: number }
  rating?: number | null
  reviewCount?: number | null
  dealCount?: number | null
}

interface Review {
  id: string
  authorName: string | null
  authorImage: string | null
  rating: number
  content: string | null
  createdAt: Date
}


interface Product {
  id: string
  name: string
  price: number
  sport: string
  productType: string | null
  description: string | null
  metadata: string | null
  level: string | null
  grade: string | null
  score: number | null
  discount: number | null
  location: string | null
  images: string
  likes: number
  createdAt: Date
  status: string
}

function formatTime(date: Date) {
  const d = new Date(date)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

interface MiniProduct {
  id: string; name: string; price: number
  grade: string | null; score: number | null
  images: string; likes: number; discount: number | null
}

export default function ProductDetailClient({
  product,
  seller,
  initialLiked = false,
  initialInCart = false,
  similarProducts = [],
  popularProducts = [],
  sellerProducts = [],
  reviews = [],
}: {
  product: Product
  seller: Seller | null
  initialLiked?: boolean
  initialInCart?: boolean
  similarProducts?: MiniProduct[]
  popularProducts?: MiniProduct[]
  sellerProducts?: MiniProduct[]
  reviews?: Review[]
}) {
  const router = useRouter()
  const images: string[] = JSON.parse(product.images)
  const [currentImg, setCurrentImg] = useState(0)
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(product.likes)
  const [inCart, setInCart] = useState(initialInCart)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const wheelCooldown = useRef(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)
  const [buyOpen, setBuyOpen] = useState(false)
  const [shippingMethod, setShippingMethod] = useState<'prepaid' | 'cod' | null>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerLoading, setOfferLoading] = useState(false)

  function showToast(message: string, type: ToastType = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2000)
  }

  async function handleLike() {
    const next = !liked
    setLiked(next)
    setLikesCount((c) => c + (next ? 1 : -1))
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      if (!res.ok) throw new Error()
      showToast(next ? '관심 상품에 추가했어요' : '관심 상품에서 제거했어요')
    } catch {
      setLiked(!next)
      setLikesCount((c) => c + (next ? -1 : 1))
      showToast('오류가 발생했어요', 'error')
    }
  }

  async function handleCart() {
    if (inCart) {
      router.push('/cart')
      return
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      if (!res.ok) throw new Error()
      setInCart(true)
      showToast('장바구니에 추가했어요')
    } catch {
      showToast('오류가 발생했어요', 'error')
    }
  }

  async function handleChat() {
    setChatLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      if (!res.ok) throw new Error()
      const chat = await res.json()
      router.push(`/chat/${chat.id}`)
    } catch {
      showToast('채팅을 시작할 수 없어요', 'error')
      setChatLoading(false)
    }
  }

  const discountedPrice = product.discount && product.discount > 0
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price

  let metadata: Record<string, string> = {}
  try {
    if (product.metadata) metadata = JSON.parse(product.metadata)
  } catch {}

  // formConfig에서 이 상품 타입의 필드 정의 가져오기
  const tabFields: FieldDef[] = product.productType
    ? (SPORTS_TABS[product.sport]?.find((t) => t.id === product.productType)?.fields ?? [])
    : []

  // AI 분석 전용 키 (상품 정보 박스에서 제외)
  const SCORE_KEYS = new Set(['wearScore', 'appearanceScore', 'functionalScore', 'usage', 'damage', 'damageParts', 'functional', 'functionalReason', 'appearance', 'comment'])

  // metadata 키를 formConfig 필드 순서대로 정렬해서 표시
  const metaRows: { label: string; value: string }[] = tabFields
    .filter((f) => metadata[f.id] !== undefined && metadata[f.id] !== '' && !SCORE_KEYS.has(f.id))
    .map((f) => {
      const raw = metadata[f.id]
      const unit = getFieldUnit(tabFields, f.id)
      let value = parseMetaValue(raw) + (unit ? ` ${unit}` : '')
      // 슬라이더 타입은 점수/최대값 형식으로 표시 (예: 75/100)
      if (f.type === 'slider') {
        value = `${parseMetaValue(raw)}/${f.max}`
      }
      return { label: f.label, value }
    })

  // formConfig에 없는 추가 키도 표시 (미래 호환)
  const definedIds = new Set(tabFields.map((f) => f.id))
  Object.entries(metadata).forEach(([k, v]) => {
    if (!definedIds.has(k) && v && !SCORE_KEYS.has(k)) {
      metaRows.push({ label: k, value: parseMetaValue(v) })
    }
  })

  const gradeInfo = product.grade ? GRADE_CONFIG[product.grade] : null

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* 공유 바텀 시트 */}
      {shareOpen && (
        <ShareSheet
          url={typeof window !== 'undefined' ? window.location.href : ''}
          title={product.name}
          onClose={() => setShareOpen(false)}
          onToast={(msg) => showToast(msg)}
        />
      )}

      {/* 구매하기 - 거래 방법 선택 */}
      {buyOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setBuyOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-[390px] bg-white rounded-t-3xl px-5 pt-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-5" />
            <p className="text-[15px] font-bold text-[#181818] mb-1">거래 방법 선택</p>
            <p className="text-[12px] text-[#9E9E9E] mb-4">배송비 부담 방식을 선택해주세요</p>

            <div className="flex flex-col gap-3 mb-5">
              {/* 선불 */}
              <button
                onClick={() => setShippingMethod('prepaid')}
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-colors text-left ${
                  shippingMethod === 'prepaid' ? 'border-[#181818] bg-[#F7F7F7]' : 'border-[#E8E8E8]'
                }`}
              >
                <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  shippingMethod === 'prepaid' ? 'border-[#181818]' : 'border-[#BDBDBD]'
                }`}>
                  {shippingMethod === 'prepaid' && <div className="w-2.5 h-2.5 rounded-full bg-[#181818]" />}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#181818]">선불</p>
                  <p className="text-[12px] text-[#9E9E9E] mt-0.5">구매자가 배송비를 부담해요</p>
                </div>
              </button>

              {/* 착불 */}
              <button
                onClick={() => setShippingMethod('cod')}
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-colors text-left ${
                  shippingMethod === 'cod' ? 'border-[#181818] bg-[#F7F7F7]' : 'border-[#E8E8E8]'
                }`}
              >
                <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  shippingMethod === 'cod' ? 'border-[#181818]' : 'border-[#BDBDBD]'
                }`}>
                  {shippingMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-[#181818]" />}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#181818]">착불</p>
                  <p className="text-[12px] text-[#9E9E9E] mt-0.5">판매자가 배송비를 부담해요</p>
                </div>
              </button>
            </div>

            <button
              disabled={!shippingMethod}
              onClick={() => {
                setBuyOpen(false)
                router.push(`/checkout/${product.id}?shipping=${shippingMethod}`)
              }}
              className="w-full bg-[#181818] text-white rounded-2xl py-4 text-[15px] font-bold disabled:opacity-40 transition-opacity"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* 가격 제안 모달 */}
      {offerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setOfferOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-[390px] bg-white rounded-t-3xl px-5 pt-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 핸들 */}
            <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-4" />
            <p className="text-[15px] font-bold text-[#181818] mb-0.5">가격 제안하기</p>
            <p className="text-[12px] text-[#9E9E9E] mb-3">
              판매자에게 원하는 가격을 채팅으로 제안해요
            </p>

            {/* 판매가 참고 */}
            <div className="flex justify-between items-center mb-2.5 px-1">
              <span className="text-[12px] text-[#9E9E9E]">현재 판매가</span>
              <span className="text-[13px] font-bold text-[#181818]">{discountedPrice.toLocaleString()}원</span>
            </div>

            {/* 금액 입력 */}
            <div className="relative mb-4">
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="제안 금액 입력"
                className="w-full border border-[#E0E0E0] rounded-2xl px-4 py-3 text-[15px] font-bold text-[#181818] outline-none focus:border-[#181818] pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[#555]">원</span>
            </div>

            <button
              disabled={!offerPrice || offerLoading}
              onClick={async () => {
                if (!offerPrice) return
                setOfferLoading(true)
                try {
                  const res = await fetch('/api/offer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: product.id, offerPrice }),
                  })
                  if (!res.ok) throw new Error()
                  const { chatId } = await res.json()
                  router.push(`/chat/${chatId}`)
                } catch {
                  showToast('오류가 발생했어요', 'error')
                  setOfferLoading(false)
                }
              }}
              className="w-full bg-[#181818] text-white rounded-2xl py-3.5 text-[15px] font-bold disabled:opacity-40"
            >
              {offerLoading ? '이동 중...' : '제안 보내기'}
            </button>
          </div>
        </div>
      )}
      {/* 상단 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
      <div className="w-full max-w-[390px] flex items-center justify-between px-4 pt-safe-top py-3 bg-white/80 backdrop-blur-sm pointer-events-auto">
        <button onClick={() => router.push('/')} className="p-1">
          <Icon name="arrow-left" size={24} className="text-[#181818]" />
        </button>
        <button className="p-1" onClick={() => setShareOpen(true)}>
          <Icon name="share" size={22} className="text-[#181818]" />
        </button>
      </div>
      </div>

      {/* 이미지 슬라이더 */}
      <div
  className="relative w-full aspect-square bg-[#F7F7F7] mt-[52px] select-none"
  onPointerDown={(e) => {
    setDragStartX(e.clientX)
    setIsDragging(true)
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
  }}
  onPointerUp={(e) => {
    if (!isDragging || dragStartX === null) return
    const diff = dragStartX - e.clientX
    if (diff > 50) {
      setCurrentImg((i) => Math.min(images.length - 1, i + 1))
    } else if (diff < -50) {
      setCurrentImg((i) => Math.max(0, i - 1))
    }
    setDragStartX(null)
    setIsDragging(false)
  }}
  onPointerCancel={() => {
    setDragStartX(null)
    setIsDragging(false)
  }}
  onWheel={(e) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return
    if (wheelCooldown.current) return
    if (e.deltaX > 30) {
      setCurrentImg((i) => Math.min(images.length - 1, i + 1))
    } else if (e.deltaX < -30) {
      setCurrentImg((i) => Math.max(0, i - 1))
    }
    wheelCooldown.current = true
    setTimeout(() => { wheelCooldown.current = false }, 500)
  }}
>
        {images.length > 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[currentImg]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <div className="absolute inset-0 flex">
                  <button className="flex-1" onClick={() => setCurrentImg((i) => Math.max(0, i - 1))} />
                  <button className="flex-1" onClick={() => setCurrentImg((i) => Math.min(images.length - 1, i + 1))} />
                </div>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImg ? 'bg-white w-3' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#E8E8E8]" />
          </div>
        )}

        {product.status === 'sold' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-none z-10">
            <span className="px-5 py-2 rounded-full bg-white text-[14px] font-black text-[#181818] tracking-tight">
              판매완료
            </span>
          </div>
         )}

        {product.grade && product.score != null && (
          <div className="absolute top-3 left-3">
            <Badge grade={product.grade as 'S' | 'A' | 'B' | 'C'} score={product.score} />
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="flex-1 px-4 pt-5 pb-32">

        {/* 제목 & 가격 */}
        <div className="mb-4">
          <h1 className="text-[18px] font-bold text-[#181818] leading-snug mb-2">{product.name}</h1>
          <div className="flex items-baseline gap-2">
            {product.discount != null && product.discount > 0 && (
              <>
                <span className="text-[15px] font-bold text-[#FF4444]">{product.discount}%</span>
                <span className="text-[13px] text-[#9E9E9E] line-through">{product.price.toLocaleString()}원</span>
              </>
            )}
            <span className="text-[22px] font-bold text-[#181818]">{discountedPrice.toLocaleString()}원</span>
          </div>
        </div>

        {/* 레벨 태그 */}
        {product.level && (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.level.split(',').map((lvl) => (
              <span key={lvl} className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#F3F3F3] text-[#555]">
                {LEVEL_LABEL[lvl.trim()] ?? lvl.trim()}
              </span>
            ))}
          </div>
        )}

        {/* 가격 제안하기 */}
        <button
          onClick={() => setOfferOpen(true)}
          className="w-full mb-5 py-2 rounded-2xl border border-[#E0E0E0] text-[12px] font-semibold text-[#181818] flex items-center justify-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          가격 제안하기
        </button>

  

        {/* 상품 정보 (formConfig 기반) */}
        {metaRows.length > 0 && (
          <>
            <div className="mb-5 p-4 bg-[#F7F7F7] rounded-2xl">
              <p className="text-[13px] font-bold text-[#181818] mb-2">상품 정보</p>
              <div className="flex flex-col gap-2">
                {metaRows.map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[12px] text-[#9E9E9E]">{label}</span>
                    <span className="text-[12px] font-medium text-[#181818]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-px bg-[#F0F0F0] mb-5" />
          </>
        )}

        {/* AI 진단 결과 */}
        {gradeInfo && product.score != null && (
          <>
            <div className="mb-5">
              {/* 다크 대시보드 카드 */}
              <div className="rounded-2xl px-5 pt-4 pb-5" style={{ backgroundColor: '#2A2A2A' }}>
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    {/* Shield 아이콘 */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3D3D3D' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="#4ADE80" />
                        <path d="M9 12l2 2 4-4" stroke="#2A2A2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[15px] font-bold text-white">AI 상태 분석</span>
                  </div>
                  {/* 등급 뱃지 */}
                  <div className="px-3 py-1 rounded-lg" style={{ backgroundColor: '#4ADE80' }}>
                    <span className="text-[13px] font-black text-[#1A1A1A]">{product.grade}급</span>
                  </div>
                </div>

                {/* 메트릭 바 + 상세 분석 */}
                {(() => {
                  const meta = product.metadata ? (() => { try { return JSON.parse(product.metadata) } catch { return {} } })() : {}
                  const wearScore       = typeof meta.wearScore        === 'number' ? meta.wearScore        : product.score
                  const appearanceScore = typeof meta.appearanceScore   === 'number' ? meta.appearanceScore   : product.score
                  const functionalScore = typeof meta.functionalScore   === 'number' ? meta.functionalScore   : product.score
                  const metrics = [
                    { label: '마모도',    score: wearScore },
                    { label: '외관 상태', score: appearanceScore },
                    { label: '기능 상태', score: functionalScore },
                  ]
                  const scoreColor = (s: number) => s >= 80 ? '#4ADE80' : s >= 60 ? '#FACC15' : s >= 40 ? '#FB923C' : '#EF4444'
                  return (
                    <>
                      {/* 종합 점수 */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className="relative w-[56px] h-[56px]">
                          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3D3D3D" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor(product.score!)} strokeWidth="3"
                              strokeDasharray={`${product.score!} ${100 - product.score!}`} strokeLinecap="round" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[14px] font-black text-white">{product.score}</span>
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-white">종합 점수</p>
                          <p className="text-[12px] text-[#AAAAAA]">{gradeInfo?.desc}</p>
                        </div>
                      </div>

                      {/* 메트릭 바 */}
                      <div className="flex flex-col gap-3.5">
                        {metrics.map(({ label, score }) => (
                          <div key={label} className="flex items-center gap-3">
                            <span className="text-[13px] text-[#AAAAAA] w-[60px] flex-shrink-0">{label}</span>
                            <div className="flex-1 h-[7px] rounded-full overflow-hidden" style={{ backgroundColor: '#3D3D3D' }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${score}%`, backgroundColor: scoreColor(score) }}
                              />
                            </div>
                            <span className="text-[13px] font-bold text-white w-[28px] text-right flex-shrink-0">{score}</span>
                          </div>
                        ))}
                      </div>

                    </>
                  )
                })()}
              </div>

              {/* 상세 분석 카드 (라이트) */}
              {(() => {
                const meta = product.metadata ? (() => { try { return JSON.parse(product.metadata) } catch { return {} } })() : {}
                if (!meta.damageParts && !meta.appearance && !meta.comment) return null
                return (
                  <div className="mt-3 rounded-2xl border border-[#EBEBEB] bg-[#FAFAFA] px-5 py-4">
                    <div className="flex items-center gap-2 mb-4">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-[14px] font-bold text-[#333]">AI 상세 분석</span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* 주요 손상 부위 */}
                      {meta.damageParts && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: meta.damage === '없음' ? '#22C55E' : meta.damage === '경미' ? '#F59E0B' : '#EF4444' }} />
                            <p className="text-[12px] font-semibold text-[#888]">주요 손상 부위</p>
                          </div>
                          <p className="text-[13px] text-[#333] leading-relaxed pl-3">{meta.damageParts}</p>
                        </div>
                      )}

                      {/* 외관 상태 */}
                      {meta.appearance && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-[5px] h-[5px] rounded-full bg-[#3B82F6]" />
                            <p className="text-[12px] font-semibold text-[#888]">외관 상태</p>
                          </div>
                          <p className="text-[13px] text-[#333] leading-relaxed pl-3">{meta.appearance}</p>
                        </div>
                      )}

                      {/* AI 종합 코멘트 */}
                      {meta.comment && (
                        <div className="mt-1 p-3.5 rounded-xl bg-white border border-[#E8E8E8]">
                          <div className="flex items-center gap-1.5 mb-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" fill="#3B82F6" />
                            </svg>
                            <span className="text-[12px] font-bold text-[#3B82F6]">AI 종합 코멘트</span>
                          </div>
                          <p className="text-[13px] text-[#444] leading-relaxed whitespace-pre-line">{meta.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          </>
        )}

        {/* 상품 설명 */}
        {product.description && (
          <div className="mb-5">
            <p className="text-[14px] font-bold text-[#181818] mb-3">상품 설명</p>
            <p className="text-[13px] text-[#444] leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* 위치 & 시간 */}
        {product.location && (
          <p className="text-[12px] text-[#9E9E9E] mb-5">
            {product.location} · {formatTime(new Date(product.createdAt))}
          </p>
        )}

        {/* 후기 섹션 */}
        <ReviewSection reviews={reviews} />

        <div className="h-px bg-[#F0F0F0] my-5" />

        {/* 상점 정보 */}
        {seller && (
          <div className="mb-0">
            <p className="text-[14px] font-bold text-[#181818] mb-3">상점 정보</p>
            <div className="p-4 bg-[#F7F7F7] rounded-2xl">
              {/* 프로필 행 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {seller.image?.includes('cloudinary') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={seller.image} alt={seller.name ?? ''} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#E0E0E0] flex items-center justify-center">
                      <Icon name="user-profile-03" size={22} className="text-[#BDBDBD]" />
                    </div>
                  )}
                  <div>
                    <p className="text-[14px] font-bold text-[#181818]">{seller.name ?? seller.username ?? '익명'}</p>
                    <p className="text-[11px] text-[#9E9E9E]">{new Date(seller.createdAt).getFullYear()}년 가입</p>
                  </div>
                </div>
                <Link href={`/store/${seller.id}`} className="px-3.5 py-1.5 rounded-xl border border-[#E0E0E0] text-[12px] font-semibold text-[#555] bg-white">
                  상점 보기
                </Link>
              </div>

              {/* 통계 행 */}
              <div className="flex divide-x divide-[#E8E8E8]">
                <div className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#FBBF24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-[14px] font-black text-[#181818]">
                      {seller.rating != null ? seller.rating.toFixed(1) : '-'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9E9E9E]">별점</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[14px] font-black text-[#181818]">
                    {seller.reviewCount ?? 0}
                  </span>
                  <p className="text-[11px] text-[#9E9E9E]">후기</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[14px] font-black text-[#181818]">
                    {seller.dealCount ?? 0}
                  </span>
                  <p className="text-[11px] text-[#9E9E9E]">거래내역</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-px bg-[#F0F0F0] my-5" />

        {/* 추천 섹션 */}
        <div className="-mx-4">
          <MiniProductSection title="비슷한 상품" products={similarProducts} />
          <MiniProductSection title={`${SPORT_LABELS[product.sport] ?? product.sport} 인기 상품`} products={popularProducts} />
          <MiniProductSection title="이 상점의 다른 상품" products={sellerProducts} />
        </div>
      </div>

      {/* 하단 고정 바 */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
      <div className="w-full max-w-[390px] bg-white border-t border-[#F0F0F0] px-4 py-3 pb-safe-bottom pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* 좋아요 */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-0.5 w-[44px] shrink-0"
          >
            <Icon name={liked ? 'heart-filled' : 'heart'} size={22} className={liked ? 'text-[#FF4444]' : 'text-[#9E9E9E]'} />
            <span className="text-[10px] text-[#9E9E9E]">{likesCount}</span>
          </button>
   
          {/* 채팅 */}
          <button
            onClick={handleChat}
            disabled={chatLoading || product.status === 'sold'}
            className="w-[44px] h-[44px] shrink-0 rounded-xl border border-[#E0E0E0] flex items-center justify-center disabled:opacity-50"
          >
            <Icon name="message-circle" size={20} className="text-[#181818]" />
          </button>

          {/* 장바구니 */}
          <button
            onClick={handleCart}
            className={`w-[44px] h-[44px] shrink-0 rounded-xl border flex items-center justify-center transition-colors ${
              inCart ? 'border-[#181818] bg-[#181818]' : 'border-[#E0E0E0]'
            }`}
          >
            <Icon name="bag-04" size={20} className={inCart ? 'text-white' : 'text-[#181818]'} />
          </button>

        
          {/* 구매하기 */}
          <button
            onClick={() => setBuyOpen(true)}
            disabled={product.status === 'sold'}
            className="flex-1 bg-[#181818] text-white rounded-xl h-[44px] text-[14px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {product.status === 'sold' ? '판매완료' : '구매하기'}
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

const SPORT_LABELS: Record<string, string> = {
  soccer: '축구', basketball: '농구', baseball: '야구', tennis: '테니스',
  badminton: '배드민턴', volleyball: '배구', golf: '골프', swimming: '수영',
  cycling: '자전거', running: '러닝', fitness: '헬스', skiing: '스키',
  snowboard: '스노보드', tabletennis: '탁구', boxing: '복싱',
}

function MiniProductSection({ title, products }: { title: string; products: MiniProduct[] }) {
  return (
    <div className="mt-3">
      <div className="px-4 mb-2">
        <h3 className="text-[15px] font-bold text-[#181818]">{title}</h3>
      </div>
      {products.length === 0 ? (
        <div className="px-4 py-4">
          <p className="text-[12px] text-[#C8C8C8]">상품이 없어요</p>
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-3 px-4 pb-1">
        {products.map((p) => {
          const images: string[] = (() => { try { return JSON.parse(p.images) } catch { return [] } })()
          const thumb = images[0] ?? null
          return (
            <Link key={p.id} href={`/products/${p.id}`} className="flex flex-col">
              <div className="relative rounded-xl bg-[#F7F7F7] aspect-square mb-2 overflow-hidden">
                {p.grade && p.score != null && (
                  <div className="absolute top-1.5 left-1.5">
                    <Badge grade={p.grade as 'S' | 'A' | 'B' | 'C'} score={p.score} />
                  </div>
                )}
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#E8E8E8]" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 mb-0.5">
                {p.discount != null && p.discount > 0 && (
                  <span className="text-[12px] font-bold text-[#FF4444]">{p.discount}%</span>
                )}
                <span className="text-[13px] font-bold text-[#181818]">{p.price.toLocaleString()}원</span>
              </div>
              <p className="text-[11px] text-[#555] line-clamp-2 leading-[16px]">{p.name}</p>
            </Link>
          )
        })}
      </div>
      )}
    </div>
  )
}


function ReviewSection({ reviews }: { reviews: Review[] }) {
  const [expanded, setExpanded] = useState(false)

  // 평균 별점 계산
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  // 별점별 개수
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  // 펼치기 전엔 3개만 표시
  const visibleReviews = expanded ? reviews : reviews.slice(0, 3)

  return (
    <div className="mb-0">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] font-bold text-[#181818]">
          후기
          {reviews.length > 0 && (
            <span className="ml-1.5 text-[#9E9E9E] font-normal">{reviews.length}</span>
          )}
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="py-8 flex flex-col items-center gap-2">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-[13px] text-[#C0C0C0]">아직 후기가 없어요</p>
        </div>
      ) : (
        <>
          {/* 별점 요약 */}
          <div className="flex gap-5 p-4 bg-[#F7F7F7] rounded-2xl mb-4">
            {/* 평균 점수 */}
            <div className="flex flex-col items-center justify-center w-[70px] shrink-0">
              <span className="text-[32px] font-black text-[#181818] leading-none">
                {avgRating.toFixed(1)}
              </span>
              <div className="flex gap-0.5 mt-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width="10" height="10" viewBox="0 0 24 24"
                    fill={s <= Math.round(avgRating) ? '#FBBF24' : '#E0E0E0'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span className="text-[11px] text-[#9E9E9E] mt-1">{reviews.length}개 후기</span>
            </div>

            {/* 별점 바 */}
            <div className="flex-1 flex flex-col gap-1.5 justify-center">
              {ratingCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[11px] text-[#9E9E9E] w-[8px]">{star}</span>
                  <div className="flex-1 h-[5px] rounded-full bg-[#E8E8E8] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#FBBF24]"
                      style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-[11px] text-[#9E9E9E] w-[16px] text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 후기 목록 */}
          <div className="flex flex-col gap-5">
            {visibleReviews.map((review) => (
              <div key={review.id} className="flex flex-col gap-2">
                {/* 작성자 정보 */}
                <div className="flex items-center gap-2.5">
                  {review.authorImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.authorImage}
                      alt={review.authorName ?? ''}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E8E8E8] flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#BDBDBD" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-[13px] font-semibold text-[#181818]">
                      {review.authorName ?? '익명'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {/* 별점 */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg key={s} width="10" height="10" viewBox="0 0 24 24"
                            fill={s <= review.rating ? '#FBBF24' : '#E0E0E0'}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-[11px] text-[#B0B0B0]">
                        {new Date(review.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 후기 내용 */}
                {review.content && (
                  <p className="text-[13px] text-[#444] leading-relaxed pl-[42px]">
                    {review.content}
                  </p>
                )}

                <div className="h-px bg-[#F5F5F5] mt-1" />
              </div>
            ))}
          </div>

          {/* 더보기 버튼 */}
          {reviews.length > 3 && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="w-full mt-3 py-3 rounded-xl border border-[#E8E8E8] text-[13px] font-semibold text-[#555] flex items-center justify-center gap-1"
            >
              {expanded ? '접기' : `후기 ${reviews.length - 3}개 더 보기`}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  )
}
