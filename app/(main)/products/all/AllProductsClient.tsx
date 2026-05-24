'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import Badge from '@/components/ui/Badge'

const SORT_OPTIONS = [
  { value: 'newest',     label: '최신순' },
  { value: 'price_asc',  label: '낮은 가격순' },
  { value: 'price_desc', label: '높은 가격순' },
  { value: 'likes',      label: '좋아요순' },
]

interface Review {
  id: string
  authorName: string | null
  authorImage: string | null
  rating: number
  content: string | null
  createdAt: Date
}


interface Product {
  id: string; name: string; price: number; sport: string
  grade: string | null; score: number | null; discount: number | null
  location: string | null; images: string; likes: number; createdAt: Date
}

export default function AllProductsClient({ products, sort }: { products: Product[]; sort: string }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-12 pb-3 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="p-1 -ml-1">
          <Icon name="arrow-left" size={22} className="text-[#181818]" />
        </button>
        <h1 className="text-[18px] font-bold text-[#181818] flex-1">전체 상품</h1>
      </div>

      {/* 정렬 */}
      <div className="px-4 pb-3 flex items-center gap-0.5 justify-end">
        {SORT_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => router.push(s.value === 'newest' ? pathname : `${pathname}?sort=${s.value}`)}
            className="text-[12px] px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 transition-colors"
            style={sort === s.value ? { color: '#181818', fontWeight: 700 } : { color: '#C8C8C8', fontWeight: 500 }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 상품 수 */}
      <div className="px-4 pb-3">
        <p className="text-[13px] text-[#9E9E9E]">상품 {products.length}개</p>
      </div>

      {/* 그리드 */}
      <div className="px-4 pb-24">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-[15px] font-semibold text-[#181818] mb-1">등록된 상품이 없어요</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
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
        {product.location && <p className="text-[11px] text-[#9E9E9E]">{product.location}</p>}
        <span className="flex items-center gap-0.5 text-[11px] text-[#9E9E9E] mt-0.5">
          <Icon name="heart" size={12} className="text-[#9E9E9E]" />{product.likes}
        </span>
      </div>
    </Link>
  )
}
