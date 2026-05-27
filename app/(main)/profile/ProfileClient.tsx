'use client'

import { useState, useRef } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'

const SPORT_LABELS: Record<string, string> = {
 golf: '골프', soccer: '축구', baseball: '야구',
running: '러닝', cycling: '자전거', basketball: '농구',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: '초급자', amateur: '중급자', pro: '고수',
}

interface UserSport { sport: string; level: string }

interface Product {
  id: string
  name: string
  price: number
  grade: string | null
  score: number | null
  images: string
  likes: number
  status: string
  sport: string
}

interface PurchaseOrder {
  id: string
  status: string
  paidAt: Date
  chatId: string
  product: {
    id: string
    name: string
    price: number
    images: string
    grade: string | null
    sport: string
  }
}

interface ProfileClientProps {
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
    sports: UserSport[]
  }
  activeProducts: Product[]
  soldProducts: Product[]
  hiddenProducts: Product[]
  totalLikes: number
  trustScore: number
  purchaseOrders: PurchaseOrder[]
}

type MainTab = 'sell' | 'buy'
type SellTab = 'active' | 'sold' | 'hidden'

const SELL_TABS: { key: SellTab; label: string }[] = [
  { key: 'active', label: '판매중' },
  { key: 'sold',   label: '거래완료' },
  { key: 'hidden', label: '숨김' },
]

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  paid:      { label: '결제완료',   color: 'bg-[#E8F8F1] text-[#00A65A]' },
  preparing: { label: '배송준비',   color: 'bg-[#FFF8E8] text-[#B07800]' },
  shipped:   { label: '배송중',     color: 'bg-[#E8F0FF] text-[#2B5FD9]' },
  delivered: { label: '거래완료',   color: 'bg-[#F0F0F0] text-[#757575]' },
  cancelled: { label: '취소됨',     color: 'bg-[#FFF0F0] text-[#C03030]' },
}

const MENU_ITEMS = [
  { label: '선호 종목 및 숙련도 변경', href: '/onboarding/sports?from=profile' },
  { label: '알림 설정',                href: '/profile/notifications' },
  { label: '배송지 관리',              href: '/profile/account/shipping' },
  { label: '내 계좌 관리',             href: '/profile/account/bank' },
  { label: '간편결제 관리',            href: '/profile/account/payment' },
  { label: '정산 내역',                href: '/profile/account/settlement' },
  { label: '계정 관리',                href: '/profile/account' },
  { label: '고객센터',                 href: '/profile/support' },
  { label: '버전 1.0.0',               href: '#' },
]

export default function ProfileClient({
  user,
  activeProducts,
  soldProducts,
  hiddenProducts,
  totalLikes,
  trustScore,
  purchaseOrders,
}: ProfileClientProps) {
  const [mainTab, setMainTab] = useState<MainTab>('sell')
  const [sellTab, setSellTab] = useState<SellTab>('active')
  const [profileImage, setProfileImage] = useState<string | null>(
    user.image?.includes('cloudinary') ? user.image : null
  )
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 압축 (최대 512px)
    const bitmap = await createImageBitmap(file)
    const size = 512
    const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1]

    setImageUploading(true)
    try {
      const res = await fetch('/api/user/profile-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64, mediaType: 'image/jpeg' }),
      })
      const json = await res.json()
      if (json.url) setProfileImage(json.url)
    } finally {
      setImageUploading(false)
      e.target.value = ''
    }
  }

  const displayName = user.name || user.username || '플레이어'
  const topSport = user.sports[0]
  const sportLabel = topSport
    ? user.sports.slice(0, 2).map(s => SPORT_LABELS[s.sport] ?? s.sport).join(' · ')
    : null
  const levelLabel = topSport ? (LEVEL_LABELS[topSport.level] ?? topSport.level) : null
  const sellProducts: Record<SellTab, Product[]> = {
    active: activeProducts,
    sold:   soldProducts,
    hidden: hiddenProducts,
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── 헤더 ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-[24px] pb-[12px]">
        <span className="text-[20px] font-bold text-[#181818] tracking-[-0.5px]">마이페이지</span>
      </div>

      {/* ── 프로필 카드 ───────────────────────────────────── */}
      <div className="mx-[13px] bg-[#F8F8F8] rounded-[13px] px-[14px] pt-[14px] pb-[14px]">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileImageChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading}
            className="relative w-[49px] h-[49px] rounded-full bg-[#E8E8E8] flex items-center justify-center flex-shrink-0 overflow-hidden"
          >
            {profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.23767 19.5C4.56308 17.2892 7.46795 15.7762 11.9999 15.7762C16.5319 15.7762 19.4368 17.2892 20.7622 19.5M15.5999 8.1C15.5999 10.0882 13.9882 11.7 11.9999 11.7C10.0117 11.7 8.39995 10.0882 8.39995 8.1C8.39995 6.11177 10.0117 4.5 11.9999 4.5C13.9882 4.5 15.5999 6.11177 15.5999 8.1Z" stroke="#ADADAD" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
            {imageUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-[4px]">
              <span className="text-[13px] font-bold text-[#181818] truncate">{displayName}</span>
              {levelLabel && (
                <span className="px-[5px] py-[2px] bg-[#181818] rounded text-[8px] font-bold text-white leading-none">
                  {levelLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                <Icon name="star-02" size={12} className="text-[#757575]" />
                <span className="text-[10px] text-[#757575]">4.8</span>
              </div>
              {sportLabel && (
                <>
                  <span className="text-[10px] text-[#757575]">·</span>
                  <span className="text-[10px] text-[#757575]">{sportLabel}</span>
                </>
              )}
            </div>
          </div>
          <Link href="/profile/store">
            <Icon name="right" size={14} className="text-[#C8C8C8]" />
          </Link>
        </div>

        <div className="h-[1px] bg-[#EFEFEF] my-[14px]" />

        <div className="flex">
          <StatCol icon="box"          value={activeProducts.length} label="판매중" />
          <StatCol icon="heart"        value={totalLikes}            label="관심" href="/profile/wishlist" />
          <StatCol icon="shield-check" value={`${trustScore}%`}     label="신뢰도" />
        </div>
      </div>

      {/* ── 판매 / 구매 메인 탭 ──────────────────────────── */}
      <div className="mx-[13px] mt-[12px] flex border-b border-[#EFEFEF]">
        {(['sell', 'buy'] as MainTab[]).map((t) => {
          const active = mainTab === t
          const label = t === 'sell' ? '판매' : '구매'
          return (
            <button
              key={t}
              onClick={() => setMainTab(t)}
              className={`flex-1 py-[10px] text-[14px] font-bold transition-colors
                ${active ? 'text-[#181818] border-b-2 border-[#181818] -mb-[1px]' : 'text-[#9E9E9E]'}`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* ── 판매 탭 ───────────────────────────────────────── */}
      {mainTab === 'sell' && (
        <>
          {/* 판매 서브탭 */}
          <div className="mx-[13px] flex gap-2 pt-3 pb-1">
            {SELL_TABS.map((t) => {
              const active = sellTab === t.key
              const count = sellProducts[t.key].length
              return (
                <button
                  key={t.key}
                  onClick={() => setSellTab(t.key)}
                  className={`flex items-center gap-1 h-[34px] px-4 rounded-full text-[13px] font-semibold transition-colors
                    ${active ? 'bg-[#181818] text-white' : 'bg-[#F5F5F5] text-[#9E9E9E]'}`}
                >
                  {t.label}
                  <span className={`text-[12px] ${active ? 'text-white/60' : 'text-[#C8C8C8]'}`}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* 판매 상품 리스트 */}
          <div className="mx-[13px] mt-[8px] flex flex-col gap-[8px]">
            {sellProducts[sellTab].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-[13px] text-[#9E9E9E]">등록된 상품이 없어요</p>
              </div>
            ) : (
              sellProducts[sellTab].map((product) => (
                <ProductRow key={product.id} product={product} />
              ))
            )}
          </div>
        </>
      )}

      {/* ── 구매 탭 ───────────────────────────────────────── */}
      {mainTab === 'buy' && (
        <div className="mx-[13px] mt-[8px] flex flex-col gap-[8px]">
          {purchaseOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-[13px] text-[#9E9E9E]">구매한 상품이 없어요</p>
            </div>
          ) : (
            purchaseOrders.map((order) => (
              <PurchaseRow key={order.id} order={order} />
            ))
          )}
        </div>
      )}

      {/* ── 메뉴 ─────────────────────────────────────────── */}
      <div className="mx-[13px] mt-[20px]">
        {MENU_ITEMS.map((item) => (
          item.href === '#' ? (
            <div
              key={item.label}
              className="flex items-center justify-between h-[44px] border-b border-[#F5F5F5]"
            >
              <span className="text-[14px] font-medium text-[#282828]">{item.label}</span>
              <Icon name="right" size={18} className="text-[#C8C8C8]" />
            </div>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between h-[44px] border-b border-[#F5F5F5]"
            >
              <span className="text-[14px] font-medium text-[#282828]">{item.label}</span>
              <Icon name="right" size={18} className="text-[#C8C8C8]" />
            </Link>
          )
        ))}
      </div>

      {/* ── 로그아웃 ──────────────────────────────────────── */}
      <div className="mx-[13px] mt-[4px] pb-6">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center justify-between w-full h-[44px]"
        >
          <span className="text-[14px] font-medium text-[#9E9E9E]">로그아웃</span>
          <Icon name="right" size={18} className="text-[#C8C8C8]" />
        </button>
      </div>

    </div>
  )
}

/* ── 통계 열 ─────────────────────────────────────────────── */
function StatCol({ icon, value, label, href }: {
  icon: 'box' | 'heart' | 'shield-check'
  value: number | string
  label: string
  href?: string
}) {
  const inner = (
    <>
      <Icon name={icon} size={18} className="text-[#181818]" />
      <span className="text-[15px] font-bold text-[#181818] leading-[23px]">{value}</span>
      <span className="text-[9px] text-[#9E9E9E]">{label}</span>
    </>
  )
  if (href) {
    return (
      <Link href={href} className="flex-1 flex flex-col items-center gap-[4px]">
        {inner}
      </Link>
    )
  }
  return (
    <div className="flex-1 flex flex-col items-center gap-[4px]">
      {inner}
    </div>
  )
}

/* ── 판매 상품 행 ─────────────────────────────────────────── */
function ProductRow({ product }: { product: Product }) {
  const images: string[] = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
  const thumb = images[0] ?? null

  const GRADE_COLORS: Record<string, string> = {
    S: 'bg-[#00F5A0]', A: 'bg-[#00F5A0]', B: 'bg-[#FFD700]', C: 'bg-[#FF6B6B]',
  }
  const gradeColor = product.grade ? (GRADE_COLORS[product.grade] ?? 'bg-[#00F5A0]') : 'bg-[#00F5A0]'

  const STATUS_LABEL: Record<string, string> = {
    active: '판매중', sold: '거래완료', hidden: '숨김',
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div className="flex items-center gap-3 bg-white rounded-[12px] p-[14px] border border-[#F5F5F5]">
        <div className="w-[70px] h-[70px] rounded-[9px] bg-[#F5F5F5] flex-shrink-0 overflow-hidden">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="bag-04" size={24} className="text-[#D9D9D9]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-[4px]">
            {product.grade && (
              <span className={`inline-flex items-center gap-0.5 ${gradeColor} rounded px-[5px] py-[2px] text-[8px] font-bold text-[#181818] leading-none`}>
                <Icon name="stars" size={8} className="text-[#181818]" />
                {product.grade}
              </span>
            )}
            <span className={`inline-flex items-center ${gradeColor} rounded px-[5px] py-[2px] text-[8px] font-bold text-[#181818] leading-none`}>
              {STATUS_LABEL[product.status] ?? product.status}
            </span>
          </div>
          <p className="text-[12px] font-bold text-[#333333] leading-[20px] line-clamp-1 mb-[2px]">{product.name}</p>
          <p className="text-[12px] font-bold text-[#181818] leading-[20px]">{product.price.toLocaleString()}원</p>
          <div className="flex items-center gap-3 mt-[2px]">
            <span className="flex items-center gap-0.5 text-[10px] text-[#D9D9D9]">
              <Icon name="eye" size={12} className="text-[#D9D9D9]" />0
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-[#D9D9D9]">
              <Icon name="heart" size={12} className="text-[#D9D9D9]" />{product.likes}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-[#D9D9D9]">
              <Icon name="message-circle" size={12} className="text-[#D9D9D9]" />0
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── 구매 주문 행 ─────────────────────────────────────────── */
function PurchaseRow({ order }: { order: PurchaseOrder }) {
  const images: string[] = (() => { try { return JSON.parse(order.product.images) } catch { return [] } })()
  const thumb = images[0] ?? null
  const statusInfo = ORDER_STATUS[order.status] ?? { label: order.status, color: 'bg-[#F0F0F0] text-[#757575]' }

  return (
    <Link href={`/chat/${order.chatId}`}>
      <div className="flex items-center gap-3 bg-white rounded-[12px] p-[14px] border border-[#F5F5F5]">
        <div className="w-[70px] h-[70px] rounded-[9px] bg-[#F5F5F5] flex-shrink-0 overflow-hidden">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt={order.product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="bag-04" size={24} className="text-[#D9D9D9]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className={`inline-flex items-center rounded px-[5px] py-[2px] text-[8px] font-bold leading-none mb-[4px] ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <p className="text-[12px] font-bold text-[#333333] leading-[20px] line-clamp-1 mb-[2px]">{order.product.name}</p>
          <p className="text-[12px] font-bold text-[#181818] leading-[20px]">{order.product.price.toLocaleString()}원</p>
          <p className="text-[10px] text-[#9E9E9E] mt-[2px]">
            {new Date(order.paidAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 구매
          </p>
        </div>
      </div>
    </Link>
  )
}
