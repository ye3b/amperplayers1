'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import Badge from '@/components/ui/Badge'

const SPORT_LABELS: Record<string, string> = {
  soccer: '축구', basketball: '농구', baseball: '야구', tennis: '테니스',
  badminton: '배드민턴', volleyball: '배구', golf: '골프', swimming: '수영',
  cycling: '자전거', running: '러닝', fitness: '헬스', skiing: '스키',
  snowboard: '스노보드', tabletennis: '탁구', boxing: '복싱',
}
const LEVEL_LABELS: Record<string, string> = {
  beginner: '초급자', amateur: '중급자', pro: '고수',
}

interface UserSport { sport: string; level: string }
interface Product {
  id: string; name: string; price: number; grade: string | null
  score: number | null; images: string; likes: number
  discount: number | null; location: string | null; createdAt: Date; status: string
}

interface Props {
  user: {
    id: string; name: string | null; username: string | null
    image: string | null; createdAt: Date; sports: UserSport[]
  }
  activeProducts: Product[]
  soldProducts: Product[]
  hiddenProducts: Product[]
  soldCount: number
  trustScore: number
}

type Tab = 'products' | 'reviews' | 'info'
type ProductFilter = 'active' | 'sold' | 'hidden'

export default function StoreClient({ user, activeProducts, soldProducts, hiddenProducts, soldCount, trustScore }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('products')
  const [productFilter, setProductFilter] = useState<ProductFilter>('active')

  const displayName = user.name ?? user.username ?? '플레이어'
  const topSport = user.sports[0]
  const levelLabel = topSport ? (LEVEL_LABELS[topSport.level] ?? topSport.level) : null
  const sportLabels = user.sports.slice(0, 3).map((s) => SPORT_LABELS[s.sport] ?? s.sport).join(' · ')
  const profileImage = user.image?.includes('cloudinary') ? user.image : null
  const joinedYear = new Date(user.createdAt).getFullYear()
  const joinedMonth = new Date(user.createdAt).getMonth() + 1

  const TABS: { key: Tab; label: string }[] = [
    { key: 'products', label: '판매상품' },
    { key: 'reviews',  label: '상점후기' },
    { key: 'info',     label: '상점정보' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 pt-[52px] pb-[12px]">
        <button onClick={() => router.back()} className="w-[40px] h-[40px] flex items-center justify-center -ml-2">
          <Icon name="arrow-left" size={24} className="text-[#181818]" />
        </button>
        <span className="text-[20px] font-bold text-[#181818] tracking-[-0.5px]">내 상점</span>
      </div>

      {/* 프로필 */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-[64px] h-[64px] rounded-full bg-[#E8E8E8] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M3.23767 19.5C4.56308 17.2892 7.46795 15.7762 11.9999 15.7762C16.5319 15.7762 19.4368 17.2892 20.7622 19.5M15.5999 8.1C15.5999 10.0882 13.9882 11.7 11.9999 11.7C10.0117 11.7 8.39995 10.0882 8.39995 8.1C8.39995 6.11177 10.0117 4.5 11.9999 4.5C13.9882 4.5 15.5999 6.11177 15.5999 8.1Z" stroke="#ADADAD" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[17px] font-bold text-[#181818]">{displayName}</span>
              {levelLabel && (
                <span className="px-[6px] py-[2px] bg-[#181818] rounded text-[9px] font-bold text-white leading-none">
                  {levelLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Icon name="star-02" size={13} className="text-[#757575]" />
              <span className="text-[12px] text-[#757575]">4.8</span>
              {sportLabels && (
                <>
                  <span className="text-[12px] text-[#C8C8C8]">·</span>
                  <span className="text-[12px] text-[#757575]">{sportLabels}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 스탯 */}
        <div className="flex mt-5 bg-[#F8F8F8] rounded-[13px] py-4">
          <StatCol label="판매중" value={activeProducts.length} />
          <div className="w-[1px] bg-[#EFEFEF]" />
          <StatCol label="거래완료" value={soldCount} />
          <div className="w-[1px] bg-[#EFEFEF]" />
          <StatCol label="신뢰도" value={`${trustScore}%`} />
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-[#EFEFEF] px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-[10px] text-[14px] font-bold transition-colors
              ${tab === t.key ? 'text-[#181818] border-b-2 border-[#181818] -mb-[1px]' : 'text-[#9E9E9E]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 판매상품 */}
      {tab === 'products' && (
        <div className="pb-24">
          {/* 상태 필터 탭 */}
          <div className="flex gap-2 px-4 pt-4 pb-3">
            {([
              { key: 'active', label: '판매중', count: activeProducts.length },
              { key: 'sold',   label: '거래완료', count: soldProducts.length },
              { key: 'hidden', label: '숨김',   count: hiddenProducts.length },
            ] as { key: ProductFilter; label: string; count: number }[]).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setProductFilter(key)}
                className={`flex items-center gap-1 h-[34px] px-4 rounded-full text-[13px] font-semibold transition-colors
                  ${productFilter === key
                    ? 'bg-[#181818] text-white'
                    : 'bg-[#F5F5F5] text-[#9E9E9E]'}`}
              >
                {label}
                <span className={`text-[12px] ${productFilter === key ? 'text-white/70' : 'text-[#C8C8C8]'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* 상품 목록 */}
          {(() => {
            const products = productFilter === 'active' ? activeProducts : productFilter === 'sold' ? soldProducts : hiddenProducts
            const emptyMsg = productFilter === 'active' ? '판매 중인 상품이 없어요' : productFilter === 'sold' ? '거래완료 상품이 없어요' : '숨긴 상품이 없어요'
            return products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Icon name="box" size={36} className="text-[#E8E8E8] mb-3" />
                <p className="text-[13px] text-[#9E9E9E]">{emptyMsg}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )
          })()}
        </div>
      )}

      {/* 상점후기 */}
      {tab === 'reviews' && (
        <div className="px-4 pt-6 pb-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[28px] font-bold text-[#181818]">4.8</span>
              <span className="text-[14px] text-[#9E9E9E] ml-1">/ 5.0</span>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((i) => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i <= 4 ? '#181818' : 'none'} xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.495 2.7139C11.7015 2.29536 12.2984 2.29536 12.5049 2.7139L15.1789 8.13203C15.261 8.29823 15.4195 8.41343 15.6029 8.44008L21.5822 9.30892C22.0441 9.37604 22.2285 9.94366 21.8943 10.2695L17.5677 14.4869C17.4349 14.6162 17.3744 14.8026 17.4057 14.9853L18.4271 20.9404C18.506 21.4004 18.0231 21.7513 17.61 21.5341L12.262 18.7224C12.0979 18.6362 11.902 18.6362 11.7379 18.7224L6.38989 21.5341C5.97676 21.7513 5.49392 21.4004 5.57282 20.9404L6.5942 14.9853C6.62553 14.8026 6.56496 14.6162 6.43224 14.4869L2.10561 10.2695C1.77138 9.94366 1.95581 9.37604 2.41771 9.30892L8.39696 8.44008C8.58038 8.41343 8.73894 8.29823 8.82097 8.13203L11.495 2.7139Z" stroke="#181818" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <Icon name="star-02" size={36} className="text-[#E8E8E8] mb-3" />
            <p className="text-[13px] text-[#9E9E9E]">아직 받은 후기가 없어요</p>
          </div>
        </div>
      )}

      {/* 상점정보 */}
      {tab === 'info' && (
        <div className="px-4 pt-5 pb-24 space-y-5">
          <InfoRow label="가입일" value={`${joinedYear}년 ${joinedMonth}월`} />
          <InfoRow label="신뢰도" value={`${trustScore}%`} />
          <InfoRow label="거래완료" value={`${soldCount}건`} />
          {user.sports.length > 0 && (
            <div>
              <p className="text-[12px] text-[#9E9E9E] mb-2">관심 종목</p>
              <div className="flex flex-wrap gap-2">
                {user.sports.map((s) => (
                  <span key={s.sport} className="h-[30px] px-3 rounded-full bg-[#F5F5F5] text-[12px] font-medium text-[#383838] flex items-center">
                    {SPORT_LABELS[s.sport] ?? s.sport} · {LEVEL_LABELS[s.level] ?? s.level}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="pt-2">
            <Link
              href="/onboarding/sports?from=profile"
              className="text-[13px] text-[#9E9E9E] underline underline-offset-2"
            >
              종목 및 숙련도 변경
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCol({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <span className="text-[16px] font-bold text-[#181818]">{value}</span>
      <span className="text-[10px] text-[#9E9E9E]">{label}</span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F5F5F5]">
      <span className="text-[13px] text-[#9E9E9E]">{label}</span>
      <span className="text-[13px] font-medium text-[#181818]">{value}</span>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const images: string[] = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
  const thumb = images[0] ?? null

  return (
    <Link href={`/products/${product.id}`} className="flex flex-col">
      <div className="relative rounded-2xl bg-[#F7F7F7] aspect-square mb-2 overflow-hidden">
        {product.grade && product.score != null && (
          <div className="absolute top-2 left-2">
            <Badge grade={product.grade as 'S' | 'A' | 'B' | 'C'} score={product.score} />
          </div>
        )}
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#E8E8E8]" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          {product.discount != null && product.discount > 0 && (
            <span className="text-[13px] font-bold text-[#FF4444]">{product.discount}%</span>
          )}
          <span className="text-[14px] font-bold text-[#181818]">{product.price.toLocaleString()}원</span>
        </div>
        <p className="text-[12px] font-medium text-[#181818] leading-[18px] line-clamp-2">{product.name}</p>
        <span className="flex items-center gap-0.5 text-[11px] text-[#9E9E9E] mt-0.5">
          <Icon name="heart" size={12} className="text-[#9E9E9E]" />{product.likes}
        </span>
      </div>
    </Link>
  )
}
