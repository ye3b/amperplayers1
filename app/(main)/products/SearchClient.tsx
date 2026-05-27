'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import Badge from '@/components/ui/Badge'

const SPORT_LABELS: Record<string, string> = {
golf:       '골프',
soccer:     '축구',
baseball:   '야구',
running:    '러닝',
cycling:    '자전거',
basketball: '농구',
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
      {/* 헤더 */}
      <div className="px-4 pt-6 pb-1">
        <div className="flex items-center">
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
        </div>
      </div>

      {/* 검색바 */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-3 pb-3">
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
