'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import SportIcon, { SportKey } from '@/components/ui/SportIcon'

const ALL_SPORTS: { key: SportKey; label: string }[] = [
  { key: 'all',         label: '전체' },
{ key: 'golf',       label: '골프' },
{ key: 'soccer',     label: '축구' },
{ key: 'baseball',   label: '야구' },
{ key: 'running',    label: '러닝' },
{ key: 'cycling',    label: '자전거' },
{ key: 'basketball', label: '농구' },
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
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <svg width="112" height="20" viewBox="0 0 201 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.1613 5.11501C21.5098 1.02755 28.2104 0.467579 31.0895 2.14191C32.6189 2.89538 35.0839 5.3232 33.8785 9.50902C32.3837 14.7001 26.0482 20.5595 17.5926 25.4151V13.8244C18.2241 13.5325 18.865 13.2126 19.5082 12.8654C24.9284 9.93962 28.4724 6.20426 27.4241 4.52229C26.3755 2.84038 21.1313 3.84869 15.711 6.77448C10.2907 9.7003 6.74675 13.4357 7.79526 15.1176C8.56198 16.3474 11.5717 16.1386 15.2534 14.7938L15.0085 15.0924C4.77276 27.6719 11.1851 32.5732 15.711 33.4522C-5.57143 39.1284 1.43411 24.6334 11.2543 17.2802C7.2681 19.1266 4.43858 18.4606 3.79197 17.0872C2.17022 14.5627 6.81273 9.20255 14.1613 5.11501Z" fill="#0E0E0E"/>
            <path d="M58.184 8.00093C61.676 8.00093 63.584 10.1609 63.584 14.0489C63.584 17.9729 61.676 20.1689 58.184 20.1689H47.636V28.0529H44.036V20.1689H44V8.00093H58.184ZM47.672 16.9289H56.42C58.724 16.9289 59.984 15.9209 59.984 14.0849C59.984 12.2489 58.724 11.2409 56.42 11.2409H47.672V16.9289Z" fill="#0E0E0E"/>
            <path d="M66.4564 8.00093H70.0564V24.7769H83.8398V28.0529H66.4564V8.00093Z" fill="#0E0E0E"/>
            <path d="M100.496 8.00093L108.776 28.0529H104.924L102.152 21.3569H92.6118L89.8398 28.0529H85.9878L94.2678 8.00093H100.496ZM93.9438 18.0809H100.82L98.0118 11.2769H96.7518L93.9438 18.0809Z" fill="#0E0E0E"/>
            <path d="M121.428 19.0169V28.0529H117.828V19.0169L109.332 8.03693H113.544L119.628 16.5329L125.748 8.03693H129.96L121.428 19.0169Z" fill="#0E0E0E"/>
            <path d="M132.49 8.00093H151.678V11.2769H136.09V16.6409H151.318V19.9169H136.09V24.7769H152.398V28.0529H132.49V8.00093Z" fill="#0E0E0E"/>
            <path d="M169.446 8.00093C172.938 8.00093 174.846 10.1609 174.846 14.0489C174.846 16.3169 174.198 17.9729 173.01 19.0169C174.486 20.8529 175.206 23.8769 175.206 28.0889H171.606C171.606 22.2209 170.383 20.2049 166.603 20.2049H158.934V28.0889H155.262V8.00093H169.446ZM158.934 16.9289H167.682C169.986 16.9289 171.246 15.9209 171.246 14.0849C171.246 12.2489 169.986 11.2409 167.682 11.2409H158.934V16.9289Z" fill="#0E0E0E"/>
            <path d="M182.724 21.8969C184.2 23.5889 185.82 24.8489 189.924 25.0289C193.236 25.1729 196.332 24.8849 196.62 22.9409C196.98 20.7809 195.108 19.5569 190.824 19.0169C185.496 18.3689 179.412 18.1169 179.412 13.2929C179.412 7.38893 188.304 7.56893 191.184 7.74893C195 8.00093 198.42 9.51293 199.86 13.7969H196.26C195.72 12.5369 194.532 11.1689 190.032 10.9529C187.656 10.8449 183.3 11.0609 183.012 12.8969C182.724 14.7689 185.136 15.0569 189.456 15.5969C194.748 16.2449 200.256 17.2889 200.256 22.6529C200.256 28.8089 191.868 28.4129 188.988 28.2329C182.868 27.8369 180.348 24.7409 179.16 21.8969H182.724Z" fill="#0E0E0E"/>
            <path d="M58.184 8.00093C61.676 8.00093 63.584 10.1609 63.584 14.0489C63.584 17.9729 61.676 20.1689 58.184 20.1689H47.636V28.0529H44.036V20.1689H44V8.00093H58.184ZM47.672 16.9289H56.42C58.724 16.9289 59.984 15.9209 59.984 14.0849C59.984 12.2489 58.724 11.2409 56.42 11.2409H47.672V16.9289Z" stroke="#0E0E0E" strokeWidth="1.1"/>
            <path d="M66.4564 8.00093H70.0564V24.7769H83.8398V28.0529H66.4564V8.00093Z" stroke="#0E0E0E" strokeWidth="1.1"/>
            <path d="M100.496 8.00093L108.776 28.0529H104.924L102.152 21.3569H92.6118L89.8398 28.0529H85.9878L94.2678 8.00093H100.496ZM93.9438 18.0809H100.82L98.0118 11.2769H96.7518L93.9438 18.0809Z" stroke="#0E0E0E" strokeWidth="1.1"/>
            <path d="M121.428 19.0169V28.0529H117.828V19.0169L109.332 8.03693H113.544L119.628 16.5329L125.748 8.03693H129.96L121.428 19.0169Z" stroke="#0E0E0E" strokeWidth="1.1"/>
            <path d="M132.49 8.00093H151.678V11.2769H136.09V16.6409H151.318V19.9169H136.09V24.7769H152.398V28.0529H132.49V8.00093Z" stroke="#0E0E0E" strokeWidth="1.1"/>
            <path d="M169.446 8.00093C172.938 8.00093 174.846 10.1609 174.846 14.0489C174.846 16.3169 174.198 17.9729 173.01 19.0169C174.486 20.8529 175.206 23.8769 175.206 28.0889H171.606C171.606 22.2209 170.383 20.2049 166.603 20.2049H158.934V28.0889H155.262V8.00093H169.446ZM158.934 16.9289H167.682C169.986 16.9289 171.246 15.9209 171.246 14.0849C171.246 12.2489 169.986 11.2409 167.682 11.2409H158.934V16.9289Z" stroke="#0E0E0E" strokeWidth="1.1"/>
            <path d="M182.724 21.8969C184.2 23.5889 185.82 24.8489 189.924 25.0289C193.236 25.1729 196.332 24.8849 196.62 22.9409C196.98 20.7809 195.108 19.5569 190.824 19.0169C185.496 18.3689 179.412 18.1169 179.412 13.2929C179.412 7.38893 188.304 7.56893 191.184 7.74893C195 8.00093 198.42 9.51293 199.86 13.7969H196.26C195.72 12.5369 194.532 11.1689 190.032 10.9529C187.656 10.8449 183.3 11.0609 183.012 12.8969C182.724 14.7689 185.136 15.0569 189.456 15.5969C194.748 16.2449 200.256 17.2889 200.256 22.6529C200.256 28.8089 191.868 28.4129 188.988 28.2329C182.868 27.8369 180.348 24.7409 179.16 21.8969H182.724Z" stroke="#0E0E0E" strokeWidth="1.1"/>
          </svg>
          <Link href="/notifications" className="p-1">
            <Icon name="bell" size={22} className="text-[#181818]" />
          </Link>
        </div>
      </div>

      {/* 검색바 */}
      <div className="px-4 pb-4">
        <button
          onClick={() => router.push('/search')}
          className="w-full flex items-center gap-2 bg-[#F7F7F7] rounded-xl px-4 h-[44px]"
        >
          <Icon name="search-01" size={18} className="text-[#9E9E9E] flex-shrink-0" />
          <span className="text-[14px] text-[#9E9E9E]">브랜드, 모델명, 종목 검색</span>
        </button>
      </div>

      {/* 종목 탭 */}
      <div className="pb-4 px-4">
        <div className="grid grid-cols-4 gap-4">
          {ALL_SPORTS.map(({ key, label }) => {
            const isSelected = activeTab === key
            return (
              <button
                key={key}
                onClick={() => handleSportClick(key)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center transition-colors mx-auto
                    ${isSelected ? 'bg-[#181818]' : 'bg-[#F5F5F5]'}`}
                >
                  <SportIcon
                    sport={key}
                    size={24}
                    className={isSelected ? 'text-white' : 'text-[#383838]'}
                  />
                </div>
                <span
                  className={`text-[11px] leading-[14px] tracking-[-0.2px] whitespace-nowrap
                    ${isSelected ? 'font-bold text-[#181818]' : 'font-medium text-[#9E9E9E]'}`}
                >
                  {label}
                </span>
              </button>
            )
          })}
          {/* 준비 중 */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center bg-[#F5F5F5] mx-auto">
              <span className="text-[16px] text-[#C8C8C8]">⋯</span>
            </div>
            <span className="text-[11px] leading-[14px] tracking-[-0.2px] whitespace-nowrap font-medium text-[#C8C8C8]">
              준비 중
            </span>
          </div>
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
          <div className="absolute top-2 left-2 z-10">
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
