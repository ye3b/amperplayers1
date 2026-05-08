'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import SportIcon, { SportKey } from '@/components/ui/SportIcon'

const ALL_SPORTS: { key: SportKey; label: string }[] = [
  { key: 'all',         label: '전체' },
  { key: 'soccer',      label: '축구' },
  { key: 'basketball',  label: '농구' },
  { key: 'baseball',    label: '야구' },
  { key: 'tennis',      label: '테니스' },
  { key: 'badminton',   label: '배드민턴' },
  { key: 'volleyball',  label: '배구' },
  { key: 'golf',        label: '골프' },
  { key: 'swimming',    label: '수영' },
  { key: 'cycling',     label: '자전거' },
  { key: 'running',     label: '러닝' },
  { key: 'fitness',     label: '헬스' },
  { key: 'skiing',      label: '스키' },
  { key: 'snowboard',   label: '스노보드' },
  { key: 'tabletennis', label: '탁구' },
  { key: 'boxing',      label: '복싱' },
]

interface UserSport {
  sport: string
  level: string
}

interface Product {
  id: string
  name: string
  price: number
  sport: string
  level: string | null
  grade: string | null
  score: number | null
  discount: number | null
  location: string | null
  images: string
  likes: number
  createdAt: Date
}

interface HomeClientProps {
  userSports: UserSport[]
  recommendedProducts: Product[]
}

export default function HomeClient({ userSports, recommendedProducts }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState('all')
  const router = useRouter()

  const filteredProducts =
    activeTab === 'all'
      ? recommendedProducts
      : recommendedProducts.filter((p) => p.sport === activeTab)

  const handleSportClick = (key: string) => {
    if (key === 'all') {
      router.push('/products/all')
    } else {
      router.push(`/products/category/${key}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-4 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-[-0.5px] text-[#181818]">Players</h1>
          <Link href="/notifications" className="p-1">
            <Icon name="bell" size={22} className="text-[#181818]" />
          </Link>
        </div>
      </div>

      {/* 검색바 */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 bg-[#F7F7F7] rounded-xl px-4 h-[44px]">
          <Icon name="search-01" size={18} className="text-[#9E9E9E] flex-shrink-0" />
          <span className="text-[14px] text-[#9E9E9E]">브랜드, 모델명, 종목 검색</span>
        </div>
      </div>

      {/* 종목 탭 */}
      <div className="pb-4">
        <div className="grid grid-rows-2 grid-flow-col overflow-x-auto scrollbar-hide px-4 gap-y-3 gap-x-1 pb-1">
          {ALL_SPORTS.map(({ key, label }) => {
            const isSelected = activeTab === key
            return (
              <button
                key={key}
                onClick={() => handleSportClick(key)}
                className="flex flex-col items-center gap-1.5 px-1 py-1"
              >
                <div
                  className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-[#181818]' : 'bg-[#F5F5F5]'}`}
                >
                  <SportIcon
                    sport={key}
                    size={26}
                    className={isSelected ? 'text-white' : 'text-[#383838]'}
                  />
                </div>
                <span
                  className={`text-[10px] leading-[14px] tracking-[-0.2px] whitespace-nowrap
                    ${isSelected ? 'font-bold text-[#181818]' : 'font-medium text-[#9E9E9E]'}`}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* AI 맞춤 추천 배너 */}
      <div className="mx-4 mb-5 rounded-2xl bg-gradient-to-r from-[#181818] to-[#2a2a2a] px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-[#00F5A0] tracking-wider uppercase">AI 맞춤 추천</span>
        </div>
        <p className="text-[14px] font-semibold text-white leading-[20px]">
          숙련도와 플레이 스타일에 맞는<br />장비를 추천해드려요
        </p>
        <button className="mt-3 text-[12px] font-medium text-[#00F5A0]">
          추천 보기 →
        </button>
      </div>

      {/* 상품 그리드 — 사용자 선호 종목 기반 */}
      <div className="px-4 pb-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-3">
              <SportIcon sport={activeTab as SportKey} size={32} className="text-[#C8C8C8]" />
            </div>
            <p className="text-[14px] font-medium text-[#9E9E9E]">
              {userSports.length === 0
                ? '관심 종목을 설정하면 맞춤 상품을 보여드려요'
                : '아직 등록된 상품이 없어요'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const images: string[] = JSON.parse(product.images)
  const thumbUrl = images[0] ?? null

  return (
    <Link href={`/products/${product.id}`} className="flex flex-col">
      {/* 상품 이미지 영역 */}
      <div className="relative rounded-2xl bg-[#F7F7F7] aspect-square mb-2 overflow-hidden">
        {product.grade && product.score != null && (
          <div className="absolute top-2 left-2">
            <Badge grade={product.grade as 'S' | 'A' | 'B' | 'C'} score={product.score} />
          </div>
        )}
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#E8E8E8]" />
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="flex flex-col gap-0.5">
        {/* 할인율 + 가격 */}
        <div className="flex items-center gap-1.5">
          {product.discount != null && product.discount > 0 && (
            <span className="text-[13px] font-bold text-[#FF4444]">{product.discount}%</span>
          )}
          <span className="text-[14px] font-bold text-[#181818]">
            {product.price.toLocaleString()}원
          </span>
        </div>

        {/* 상품명 */}
        <p className="text-[12px] font-medium text-[#181818] leading-[18px] line-clamp-2">
          {product.name}
        </p>

        {/* 위치·시간 */}
        {product.location && (
          <p className="text-[11px] text-[#9E9E9E]">
            {product.location} · {formatTime(product.createdAt)}
          </p>
        )}

        {/* 좋아요 */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5 text-[11px] text-[#9E9E9E]">
            <Icon name="heart" size={12} className="text-[#9E9E9E]" />
            {product.likes}
          </span>
        </div>
      </div>
    </Link>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}
