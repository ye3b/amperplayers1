'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import Badge from '@/components/ui/Badge'

const SPORT_LABELS: Record<string, string> = {
  soccer:      '축구',
  futsal:      '풋살',
  basketball:  '농구',
  baseball:    '야구',
  tennis:      '테니스',
  badminton:   '배드민턴',
  volleyball:  '배구',
  golf:        '골프',
  swimming:    '수영',
  cycling:     '자전거',
  running:     '러닝',
  fitness:     '헬스',
  climbing:    '클라이밍',
  skiing:      '스키',
  snowboard:   '스노보드',
  surfing:     '서핑',
  tabletennis: '탁구',
  boxing:      '복싱',
}

interface Product {
  id: string
  name: string
  price: number
  sport: string
  grade: string | null
  score: number | null
  discount: number | null
  location: string | null
  images: string
  likes: number
  createdAt: string
}

const RECENT_KEY = 'players_recent_searches'

function loadRecent(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecent(list: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 10)))
}

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [focused, setFocused] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [popular, setPopular] = useState<string[]>([])
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const DEFAULT_SPORTS = ['soccer', 'baseball', 'basketball', 'badminton', 'golf', 'cycling']
  const [popularSports, setPopularSports] = useState<string[]>(DEFAULT_SPORTS)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRecent(loadRecent())
    fetch('/api/search/popular')
      .then((r) => r.json())
      .then((data) => setPopular(data.popular ?? []))
      .catch(() => {})
    fetch('/api/search/popular-sports')
      .then((r) => r.json())
      .then((data) => { if (data.sports?.length > 0) setPopularSports(data.sports) })
      .catch(() => {})
  }, [])

  const fetchResults = useCallback(async (term: string, sport: string) => {
    if (!term.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/search/products?q=${encodeURIComponent(term)}&sport=${sport}`)
      if (!res.ok) { setResults([]); return }
      const data = await res.json()
      setResults(data.products ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const selectCategory = (value: string) => {
    setCategory(value)
    if (query) fetchResults(query, value)
    if (value !== 'all') {
      fetch('/api/search/popular-sports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport: value }),
      }).catch(() => {})
    }
  }

  const submitSearch = (term: string) => {
    if (!term.trim()) return
    const updated = [term, ...recent.filter((r) => r !== term)]
    setRecent(updated)
    saveRecent(updated)
    setQuery(term)
    setFocused(false)
    inputRef.current?.blur()
    fetchResults(term, category)

    fetch('/api/search/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: term.trim() }),
    }).catch(() => {})
  }

  const removeRecent = (term: string) => {
    const updated = recent.filter((r) => r !== term)
    setRecent(updated)
    saveRecent(updated)
  }

  const clearRecent = () => {
    setRecent([])
    saveRecent([])
  }

  const showOverlay = focused || query.length === 0

  return (
    <div className="min-h-screen bg-white">
      {/* 검색바 */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-12 pb-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submitSearch(query)
          }}
          className="flex items-center gap-3"
        >
          <div className="flex-1 flex items-center gap-2.5 bg-[#F5F5F5] rounded-2xl px-4 h-[48px]">
            <Icon name="search-01" size={18} className="text-[#9E9E9E] flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="브랜드, 모델명, 종목 검색"
              className="flex-1 bg-transparent text-[15px] text-[#181818] placeholder:text-[#9E9E9E] focus:outline-none"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="flex-shrink-0"
              >
                <div className="w-[18px] h-[18px] rounded-full bg-[#C8C8C8] flex items-center justify-center">
                  <Icon name="x-01" size={10} className="text-white" />
                </div>
              </button>
            )}
          </div>
          {focused && (
            <button
              type="button"
              onClick={() => {
                setFocused(false)
                setQuery('')
                inputRef.current?.blur()
              }}
              className="text-[15px] font-medium text-[#181818] flex-shrink-0"
            >
              취소
            </button>
          )}
        </form>
      </div>

      {/* 검색 전: 최근검색 + 인기검색어 */}
      {showOverlay && (
        <div className="px-4">
          {/* 카테고리 필터 — 인기 종목 순 */}
          <CategoryBar
            popularSports={popularSports}
            category={category}
            onSelect={selectCategory}
          />

          {/* 최근 검색 */}
          {recent.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-[#181818]">최근 검색</h2>
                <button onClick={clearRecent} className="text-[12px] text-[#9E9E9E]">
                  전체 삭제
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((term) => (
                  <div
                    key={term}
                    className="flex items-center gap-1.5 h-[34px] pl-3.5 pr-2.5 rounded-full bg-[#F5F5F5]"
                  >
                    <button
                      onClick={() => submitSearch(term)}
                      className="text-[13px] font-medium text-[#383838]"
                    >
                      {term}
                    </button>
                    <button onClick={() => removeRecent(term)} className="flex items-center justify-center">
                      <Icon name="x-01" size={12} className="text-[#9E9E9E]" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 인기 검색어 */}
          <section>
            <h2 className="text-[15px] font-bold text-[#181818] mb-3">인기 검색어</h2>
            {popular.length === 0 ? (
              <p className="text-[13px] text-[#9E9E9E] py-4">아직 인기 검색어가 없어요</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                {popular.map((term, i) => (
                  <button
                    key={term}
                    onClick={() => submitSearch(term)}
                    className="flex items-center gap-3 py-3 border-b border-[#F5F5F5] text-left"
                  >
                    <span
                      className={`text-[14px] font-bold w-5 flex-shrink-0 ${
                        i < 3 ? 'text-[#181818]' : 'text-[#C8C8C8]'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[14px] font-medium text-[#181818] truncate">{term}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* 검색 결과 */}
      {!showOverlay && query.length > 0 && (
        <div className="px-4">
          <CategoryBar
            popularSports={popularSports}
            category={category}
            onSelect={selectCategory}
          />

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-6 h-6 border-2 border-[#181818] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-[13px] text-[#9E9E9E] mb-3">상품 {results.length}개</p>
              <div className="grid grid-cols-2 gap-3">
                {results.map((product) => (
                  <SearchProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-4">
                <Icon name="search-01" size={28} className="text-[#C8C8C8]" />
              </div>
              <p className="text-[15px] font-semibold text-[#181818] mb-1">
                &ldquo;{query}&rdquo; 검색 결과
              </p>
              <p className="text-[13px] text-[#9E9E9E]">등록된 상품이 없어요</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SearchProductCard({ product }: { product: Product }) {
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
        {product.location && (
          <p className="text-[11px] text-[#9E9E9E]">{product.location}</p>
        )}
        <span className="flex items-center gap-0.5 text-[11px] text-[#9E9E9E] mt-0.5">
          <Icon name="heart" size={12} className="text-[#9E9E9E]" />
          {product.likes}
        </span>
      </div>
    </Link>
  )
}

function CategoryBar({
  popularSports,
  category,
  onSelect,
}: {
  popularSports: string[]
  category: string
  onSelect: (value: string) => void
}) {
  // '전체' + 인기 종목 순
  const tabs = [
    { value: 'all', label: '전체' },
    ...popularSports.map((s) => ({ value: s, label: SPORT_LABELS[s] ?? s })),
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 pt-1">
      {tabs.map((tab) => {
        const isSelected = category === tab.value
        return (
          <button
            key={tab.value}
            onClick={() => onSelect(tab.value)}
            className={`flex-shrink-0 h-[34px] px-4 rounded-full text-[13px] font-medium transition-colors
              ${isSelected
                ? 'bg-[#181818] text-white font-semibold'
                : 'bg-[#F5F5F5] text-[#9E9E9E]'
              }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
