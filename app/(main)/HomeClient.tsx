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
          <svg width="102" height="24" viewBox="0 0 204 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.1613 11.115C21.5098 7.02755 28.2104 6.46758 31.0895 8.14191C32.6189 8.89538 35.0839 11.3232 33.8785 15.509C32.3837 20.7001 26.0482 26.5595 17.5926 31.4151V19.8244C18.2241 19.5325 18.865 19.2126 19.5082 18.8654C24.9284 15.9396 28.4724 12.2043 27.4241 10.5223C26.3755 8.84038 21.1313 9.84869 15.711 12.7745C10.2907 15.7003 6.74675 19.4357 7.79526 21.1176C8.56198 22.3474 11.5717 22.1386 15.2534 20.7938L15.0085 21.0924C4.77276 33.6719 11.1851 38.5732 15.711 39.4522C-5.57143 45.1284 1.43411 30.6334 11.2543 23.2802C7.2681 25.1266 4.43858 24.4606 3.79197 23.0872C2.17022 20.5627 6.81273 15.2026 14.1613 11.115Z" fill="#0E0E0E"/>
            <path d="M60.344 12.02C63.836 12.02 65.744 14.18 65.744 18.068C65.744 21.992 63.836 24.188 60.344 24.188H49.796V32.072H46.196V24.188H46.16V12.02H60.344ZM49.832 20.948H58.58C60.884 20.948 62.144 19.94 62.144 18.104C62.144 16.268 60.884 15.26 58.58 15.26H49.832V20.948ZM68.6164 12.02H72.2164V28.796H87.8044V32.072H68.6164V12.02ZM102.656 12.02L110.936 32.072H107.084L104.312 25.376H94.7718L91.9998 32.072H88.1478L96.4278 12.02H102.656ZM96.1038 22.1H102.98L100.172 15.296H98.9118L96.1038 22.1ZM123.588 23.036V32.072H119.988V23.036L111.492 12.056H115.704L121.788 20.552L127.908 12.056H132.12L123.588 23.036ZM134.65 12.02H153.838V15.296H138.25V20.66H153.478V23.936H138.25V28.796H154.558V32.072H134.65V12.02ZM171.606 12.02C175.098 12.02 177.006 14.18 177.006 18.068C177.006 20.336 176.358 21.992 175.17 23.036C176.646 24.872 177.366 27.896 177.366 32.108H173.766C173.766 26.24 172.542 24.224 168.762 24.224H161.094V32.108H157.422V12.02H171.606ZM161.094 20.948H169.842C172.146 20.948 173.406 19.94 173.406 18.104C173.406 16.268 172.146 15.26 169.842 15.26H161.094V20.948ZM184.884 25.916C186.36 27.608 187.98 28.868 192.084 29.048C195.396 29.192 198.492 28.904 198.78 26.96C199.14 24.8 197.268 23.576 192.984 23.036C187.656 22.388 181.572 22.136 181.572 17.312C181.572 11.408 190.464 11.588 193.344 11.768C197.16 12.02 200.58 13.532 202.02 17.816H198.42C197.88 16.556 196.692 15.188 192.192 14.972C189.816 14.864 185.46 15.08 185.172 16.916C184.884 18.788 187.296 19.076 191.616 19.616C196.908 20.264 202.416 21.308 202.416 26.672C202.416 32.828 194.028 32.432 191.148 32.252C185.028 31.856 182.508 28.76 181.32 25.916H184.884Z" fill="#0E0E0E"/>
          </svg>
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
                  className={`w-[56px] h-[56px] rounded-2xl flex items-center justify-center transition-colors
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
