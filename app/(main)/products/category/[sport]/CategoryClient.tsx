'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import SportIcon, { SportKey } from '@/components/ui/SportIcon'
import { SPORTS_TABS } from '@/app/(sell)/sell/detail/formConfig'

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────
const GRADE_CONFIG: Record<string, { color: string; bg: string }> = {
  S: { color: '#00C471', bg: '#E8FAF2' },
  A: { color: '#3B82F6', bg: '#EFF6FF' },
  B: { color: '#F59E0B', bg: '#FFFBEB' },
  C: { color: '#EF4444', bg: '#FEF2F2' },
  F: { color: '#7F1D1D', bg: '#FEE2E2' },
}
const GRADES = ['S', 'A', 'B', 'C', 'F'] as const

const LEVELS = [
  { value: 'beginner', label: '초보자' },
  { value: 'amateur', label: '아마추어' },
  { value: 'pro',     label: '프로' },
]

const DEFAULT_PRICE_RANGES = [
  { label: '1만원 이하',  min: 0,      max: 10000  },
  { label: '1~5만원',    min: 10000,  max: 50000  },
  { label: '5~10만원',   min: 50000,  max: 100000 },
  { label: '10만원 이상', min: 100000, max: undefined },
]

const SPORT_PRICE_RANGES: Record<string, typeof DEFAULT_PRICE_RANGES> = {
  cycling: [
    { label: '30만원 이하',    min: 0,       max: 300000  },
    { label: '30~70만원',     min: 300000,  max: 700000  },
    { label: '70~150만원',    min: 700000,  max: 1500000 },
    { label: '150~300만원',   min: 1500000, max: 3000000 },
    { label: '300만원 이상',   min: 3000000, max: undefined },
  ],
  golf: [
    { label: '10만원 이하',   min: 0,       max: 100000  },
    { label: '10~30만원',    min: 100000,  max: 300000  },
    { label: '30~50만원',    min: 300000,  max: 500000  },
    { label: '50~100만원',   min: 500000,  max: 1000000 },
    { label: '100만원 이상',  min: 1000000, max: undefined },
  ],
  running: [
    { label: '10만원 이하',  min: 0,      max: 100000 },
    { label: '10~15만원',   min: 100000, max: 150000 },
    { label: '15~20만원',   min: 150000, max: 200000 },
    { label: '20만원 이상',  min: 200000, max: undefined },
  ],
  baseball: [
    { label: '10만원 이하',   min: 0,      max: 100000 },
    { label: '10~20만원',    min: 100000, max: 200000 },
    { label: '20~40만원',    min: 200000, max: 400000 },
    { label: '40~50만원',    min: 400000, max: 500000 },
    { label: '50만원 이상',   min: 500000, max: undefined },
  ],
}

const SORT_OPTIONS = [
  { value: 'newest',     label: '최신순' },
  { value: 'price_asc',  label: '낮은 가격순' },
  { value: 'price_desc', label: '높은 가격순' },
  { value: 'likes',      label: '좋아요순' },
]

// 종목별 인기 브랜드 (상품 데이터 없을 때 기본 제공)
const POPULAR_BRANDS: Record<string, string[]> = {
  soccer:      ['나이키', '아디다스', '푸마', '뉴발란스', '아식스', '미즈노', '엄브로'],
  basketball:  ['나이키', '아디다스', '조던', '언더아머', '리복', '뉴발란스'],
  baseball:    ['미즈노', '아식스', '롤링스', '루이빌', '이스턴', '윌슨'],
  tennis:      ['윌슨', '헤드', '바볼랏', '던롭', '프린스', '요넥스'],
  badminton:   ['요넥스', '빅터', '리닝', '아테믹'],
  golf:        ['타이틀리스트', '캘러웨이', '핑', '테일러메이드', '미즈노', '클리블랜드'],
  cycling:     ['캐넌데일', '스페셜라이즈드', '트렉', '자이언트', '비앙키'],
  running:     ['나이키', '아디다스', '뉴발란스', '아식스', '살로몬', '브룩스', '호카'],
  fitness:     ['나이키', '아디다스', '언더아머', '리복', '짐샤크'],
  volleyball:  ['미즈노', '아식스', '나이키', '몰텐'],
  swimming:    ['스피도', '아레나', '미즈노', '토야보'],
  skiing:      ['살로몬', '로시뇰', '피셔', '아토믹', '헤드', '볼클'],
  snowboard:   ['버튼', '살로몬', 'K2', '유니온'],
  tabletennis: ['버터플라이', '야사카', '스티가', '닉시스'],
  boxing:      ['이블라스트', '타이틀', '이볼더', '리복'],
}

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
interface Product {
  id: string
  name: string
  price: number
  sport: string
  productType: string | null
  metadata: string | null
  level: string | null
  grade: string | null
  score: number | null
  discount: number | null
  location: string | null
  images: string
  likes: number
  createdAt: Date
}

interface ActiveFilters {
  grade: string[]
  level: string[]
  productType: string[]
  minPrice?: number
  maxPrice?: number
  sort: string
  discount: boolean
}

// metadata 기반 클라이언트 필터: { fieldId: selectedOptions[] }
type MetaFilters = Record<string, string[]>

interface CategoryClientProps {
  sport: string
  label: string
  products: Product[]
  activeFilters: ActiveFilters
}

// ─────────────────────────────────────────────
// 유틸 함수
// ─────────────────────────────────────────────
function parseMeta(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try { return JSON.parse(raw) } catch { return {} }
}

function buildSearchParams(f: ActiveFilters): string {
  const p = new URLSearchParams()
  if (f.grade.length)       p.set('grade',       f.grade.join(','))
  if (f.level.length)       p.set('level',       f.level.join(','))
  if (f.productType.length) p.set('productType', f.productType.join(','))
  if (f.minPrice !== undefined) p.set('minPrice', String(f.minPrice))
  if (f.maxPrice !== undefined) p.set('maxPrice', String(f.maxPrice))
  if (f.sort !== 'newest')  p.set('sort', f.sort)
  if (f.discount)           p.set('discount', 'true')
  return p.toString()
}

function countBasicFilters(f: ActiveFilters) {
  let n = f.grade.length + f.level.length + f.productType.length
  if (f.minPrice !== undefined || f.maxPrice !== undefined) n++
  if (f.discount) n++
  return n
}

function countMetaFilters(m: MetaFilters) {
  return Object.values(m).filter((v) => v.length > 0).length
}

// ─────────────────────────────────────────────
// 선택한 productType의 필터 가능한 필드 추출
// radio / select / multiselect 만 포함
// brand (text) 는 별도 처리
// ─────────────────────────────────────────────
interface FilterField {
  id: string
  label: string
  options: string[]
}

function getDetailFields(sport: string, selectedTypes: string[]): FilterField[] {
  const tabs = SPORTS_TABS[sport] ?? []
  const relevant = selectedTypes.length > 0
    ? tabs.filter((t) => selectedTypes.includes(t.id))
    : tabs // 선택 없으면 전체 탭 기준

  const seen = new Set<string>()
  const result: FilterField[] = []

  for (const tab of relevant) {
    for (const field of tab.fields) {
      if (field.id === 'brand' || seen.has(field.id)) continue
      if (
        field.type === 'radio' ||
        field.type === 'select' ||
        field.type === 'multiselect'
      ) {
        seen.add(field.id)
        result.push({ id: field.id, label: field.label, options: field.options })
      }
    }
  }

  return result
}

function hasBrandField(sport: string, selectedTypes: string[]): boolean {
  const tabs = SPORTS_TABS[sport] ?? []
  const relevant = selectedTypes.length > 0
    ? tabs.filter((t) => selectedTypes.includes(t.id))
    : tabs
  return relevant.some((t) => t.fields.some((f) => f.id === 'brand'))
}

// ─────────────────────────────────────────────
// 칩 컴포넌트
// ─────────────────────────────────────────────
function Chip({
  label,
  selected,
  onClick,
  color,
  bg,
}: {
  label: string
  selected: boolean
  onClick: () => void
  color?: string
  bg?: string
}) {
  return (
    <button
      onClick={onClick}
      className="h-[32px] px-3.5 rounded-full text-[13px] font-medium transition-all flex-shrink-0 border"
      style={
        selected
          ? { backgroundColor: color ?? '#181818', color: '#fff', borderColor: color ?? '#181818' }
          : { backgroundColor: bg ?? '#F8F8F8', color: '#555', borderColor: '#EBEBEB' }
      }
    >
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────
// 필터 섹션
// ─────────────────────────────────────────────
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[13px] font-bold text-[#181818] mb-3">{title}</h3>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </section>
  )
}

// ─────────────────────────────────────────────
// 필터 바텀시트
// ─────────────────────────────────────────────
function FilterSheet({
  sport,
  draft,
  draftMeta,
  onDraftChange,
  onMetaChange,
  onReset,
  onApply,
  onClose,
  brandOptions,
}: {
  sport: string
  draft: ActiveFilters
  draftMeta: MetaFilters
  onDraftChange: (partial: Partial<ActiveFilters>) => void
  onMetaChange: (fieldId: string, value: string) => void
  onReset: () => void
  onApply: () => void
  onClose: () => void
  brandOptions: string[]
}) {
  const tabs = SPORTS_TABS[sport] ?? []
  const showBrand = hasBrandField(sport, draft.productType)
  const detailFields = getDetailFields(sport, draft.productType)
  const hasTabs = tabs.length > 0

  const toggleBasic = (key: 'grade' | 'level' | 'productType', value: string) => {
    const cur = draft[key] as string[]
    onDraftChange({ [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] })
  }

  const PRICE_RANGES = SPORT_PRICE_RANGES[sport] ?? DEFAULT_PRICE_RANGES
  const activePriceIdx = PRICE_RANGES.findIndex(
    (r) => r.min === (draft.minPrice ?? 0) && r.max === draft.maxPrice
  )

  const totalActive =
    countBasicFilters(draft) +
    Object.values(draftMeta).filter((v) => v.length > 0).length

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white rounded-t-2xl z-[70] flex flex-col max-h-[88vh]">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-[#E0E0E0]" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F5F5F5] flex-shrink-0">
          <span className="text-[16px] font-bold text-[#181818]">필터</span>
          <button onClick={onClose}>
            <Icon name="x-01" size={20} className="text-[#9E9E9E]" />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-6">

          {/* ── AI 진단 등급 ── */}
          <FilterSection title="AI 진단 등급">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => toggleBasic('grade', g)}
                className="flex items-center h-[34px] px-3.5 rounded-full border text-[13px] font-bold transition-all"
                style={
                  draft.grade.includes(g)
                    ? { backgroundColor: GRADE_CONFIG[g].color, color: '#fff', borderColor: GRADE_CONFIG[g].color }
                    : { backgroundColor: GRADE_CONFIG[g].bg, color: GRADE_CONFIG[g].color, borderColor: GRADE_CONFIG[g].color + '55' }
                }
              >
                {g}급
              </button>
            ))}
          </FilterSection>

          {/* ── 용품 종류 ── */}
          {hasTabs && (
            <FilterSection title="용품 종류">
              {tabs.map((tab) => (
                <Chip
                  key={tab.id}
                  label={tab.label}
                  selected={draft.productType.includes(tab.id)}
                  onClick={() => onDraftChange({ productType: draft.productType.includes(tab.id) ? [] : [tab.id] })}
                />
              ))}
            </FilterSection>
          )}

          {/* ── 상세 필터 (용품 종류 선택 시) ── */}
          {hasTabs && (
            <>
              {draft.productType.length > 0 ? (
                <>
                  {/* 브랜드 */}
                  {showBrand && brandOptions.length > 0 && (
                    <FilterSection title="브랜드">
                      {brandOptions.map((b) => (
                        <Chip
                          key={b}
                          label={b}
                          selected={(draftMeta.brand ?? []).includes(b)}
                          onClick={() => onMetaChange('brand', b)}
                        />
                      ))}
                    </FilterSection>
                  )}

                  {/* radio / select / multiselect 필드 */}
                  {detailFields.map((field) => (
                    <FilterSection key={field.id} title={field.label}>
                      {field.options.map((opt) => (
                        <Chip
                          key={opt}
                          label={opt}
                          selected={(draftMeta[field.id] ?? []).includes(opt)}
                          onClick={() => onMetaChange(field.id, opt)}
                        />
                      ))}
                    </FilterSection>
                  ))}
                </>
              ) : (
                <div className="flex items-center gap-2 py-2 px-3 bg-[#F8F8F8] rounded-xl">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="#C8C8C8" strokeWidth="1" />
                    <line x1="7" y1="6.5" x2="7" y2="10" stroke="#C8C8C8" strokeWidth="1" strokeLinecap="round" />
                    <circle cx="7" cy="4.5" r="0.5" fill="#C8C8C8" />
                  </svg>
                  <span className="text-[12px] text-[#9E9E9E]">용품 종류를 선택하면 상세 필터가 표시돼요</span>
                </div>
              )}
            </>
          )}

          {/* ── 숙련도 ── */}
          <FilterSection title="숙련도">
            {LEVELS.map((lv) => (
              <Chip
                key={lv.value}
                label={lv.label}
                selected={draft.level.includes(lv.value)}
                onClick={() => toggleBasic('level', lv.value)}
              />
            ))}
          </FilterSection>

          {/* ── 가격 범위 ── */}
          <FilterSection title="가격 범위">
            {PRICE_RANGES.map((r, i) => (
              <Chip
                key={r.label}
                label={r.label}
                selected={activePriceIdx === i}
                onClick={() => {
                  if (activePriceIdx === i) {
                    onDraftChange({ minPrice: undefined, maxPrice: undefined })
                  } else {
                    onDraftChange({ minPrice: r.min, maxPrice: r.max })
                  }
                }}
              />
            ))}
          </FilterSection>

          {/* ── 정렬 ── */}
          <FilterSection title="정렬">
            {SORT_OPTIONS.map((s) => (
              <Chip
                key={s.value}
                label={s.label}
                selected={draft.sort === s.value}
                onClick={() => onDraftChange({ sort: s.value })}
              />
            ))}
          </FilterSection>

          {/* ── 할인 상품 ── */}
          <section>
            <button
              onClick={() => onDraftChange({ discount: !draft.discount })}
              className="flex items-center gap-2.5"
            >
              <div
                className="w-[20px] h-[20px] rounded flex items-center justify-center border transition-colors"
                style={
                  draft.discount
                    ? { backgroundColor: '#181818', borderColor: '#181818' }
                    : { borderColor: '#D9D9D9' }
                }
              >
                {draft.discount && (
                  <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                    <path d="M1 4l3 3 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[13px] font-medium text-[#383838]">할인 상품만 보기</span>
            </button>
          </section>
        </div>

        {/* 하단 버튼 */}
        <div className="px-5 pb-8 pt-3 border-t border-[#F5F5F5] flex gap-3 flex-shrink-0">
          <button
            onClick={onReset}
            className="h-[48px] px-5 rounded-[12px] border border-[#E8E8E8] text-[14px] font-medium text-[#555] flex-shrink-0"
          >
            초기화
          </button>
          <button
            onClick={onApply}
            className="flex-1 h-[48px] rounded-[12px] bg-[#181818] text-white text-[15px] font-bold"
          >
            적용{totalActive > 0 ? ` (${totalActive})` : ''}
          </button>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────
// 활성 필터 칩 (상단 스크롤)
// ─────────────────────────────────────────────
function ActiveChips({
  sport,
  activeFilters,
  metaFilters,
  onRemove,
}: {
  sport: string
  activeFilters: ActiveFilters
  metaFilters: MetaFilters
  onRemove: (type: 'basic' | 'meta', key: string, value: string) => void
}) {
  const PRICE_RANGES = SPORT_PRICE_RANGES[sport] ?? DEFAULT_PRICE_RANGES
  const chips: { label: string; type: 'basic' | 'meta'; key: string; value: string }[] = [
    ...activeFilters.grade.map((g) => ({ label: `${g}급`, type: 'basic' as const, key: 'grade', value: g })),
    ...activeFilters.productType.map((t) => ({
      label: Object.values(SPORTS_TABS).flat().find((tab) => tab.id === t)?.label ?? t,
      type: 'basic' as const, key: 'productType', value: t,
    })),
    ...activeFilters.level.map((l) => ({
      label: LEVELS.find((lv) => lv.value === l)?.label ?? l,
      type: 'basic' as const, key: 'level', value: l,
    })),
    ...(activeFilters.minPrice !== undefined || activeFilters.maxPrice !== undefined
      ? [{
          label: PRICE_RANGES.find(
            (r) => r.min === (activeFilters.minPrice ?? 0) && r.max === activeFilters.maxPrice
          )?.label ?? '가격',
          type: 'basic' as const, key: 'price', value: '',
        }]
      : []),
    ...(activeFilters.discount ? [{ label: '할인', type: 'basic' as const, key: 'discount', value: '' }] : []),
    // meta filters
    ...Object.entries(metaFilters).flatMap(([fieldId, values]) =>
      values.map((v) => ({ label: v, type: 'meta' as const, key: fieldId, value: v }))
    ),
  ]

  if (chips.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-3">
      {chips.map((c, i) => (
        <div
          key={i}
          className="flex items-center gap-1 h-[28px] pl-3 pr-2 rounded-full bg-[#181818] flex-shrink-0"
        >
          <span className="text-[11px] font-bold text-white">{c.label}</span>
          <button onClick={() => onRemove(c.type, c.key, c.value)} className="flex items-center">
            <Icon name="x-01" size={10} className="text-white/70" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function CategoryClient({
  sport,
  label,
  products,
  activeFilters,
}: CategoryClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [draft, setDraft] = useState<ActiveFilters>(activeFilters)
  const [draftMeta, setDraftMeta] = useState<MetaFilters>({})
  // 실제 적용된 meta 필터 (클라이언트 필터링에 사용)
  const [metaFilters, setMetaFilters] = useState<MetaFilters>({})

  // 브랜드 옵션: 인기 브랜드 + 기존 상품에서 추출한 브랜드
  const brandOptions = useMemo(() => {
    const fromProducts = new Set<string>()
    products.forEach((p) => {
      const meta = parseMeta(p.metadata)
      if (typeof meta.brand === 'string' && meta.brand) fromProducts.add(meta.brand)
    })
    const popular = POPULAR_BRANDS[sport] ?? []
    return [...new Set([...popular, ...fromProducts])].slice(0, 14)
  }, [products, sport])

  // metadata 필터 적용한 표시 상품
  const displayedProducts = useMemo(() => {
    const activeEntries = Object.entries(metaFilters).filter(([, vals]) => vals.length > 0)
    if (activeEntries.length === 0) return products
    return products.filter((p) => {
      const meta = parseMeta(p.metadata)
      return activeEntries.every(([fieldId, values]) => {
        const val = meta[fieldId]
        if (val == null) return false
        if (Array.isArray(val)) return values.some((v) => (val as string[]).includes(v))
        return values.includes(String(val))
      })
    })
  }, [products, metaFilters])

  const pushFilters = useCallback((f: ActiveFilters) => {
    const qs = buildSearchParams(f)
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }, [router, pathname])

  // ── 시트 열기 ──
  const openSheet = () => {
    setDraft(activeFilters)
    setDraftMeta({ ...metaFilters })
    setSheetOpen(true)
  }

  // ── meta 드래프트 토글 ──
  const toggleDraftMeta = (fieldId: string, value: string) => {
    setDraftMeta((prev) => {
      const cur = prev[fieldId] ?? []
      return { ...prev, [fieldId]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] }
    })
  }

  // ── 적용 ──
  const applyFilters = () => {
    pushFilters(draft)
    setMetaFilters(draftMeta)
    setSheetOpen(false)
  }

  // ── 초기화 ──
  const resetFilters = () => {
    const empty: ActiveFilters = { grade: [], level: [], productType: [], sort: 'newest', discount: false }
    setDraft(empty)
    setDraftMeta({})
    setMetaFilters({})
    pushFilters(empty)
    setSheetOpen(false)
  }

  // ── 칩 제거 ──
  const handleRemove = (type: 'basic' | 'meta', key: string, value: string) => {
    if (type === 'meta') {
      const next = { ...metaFilters, [key]: (metaFilters[key] ?? []).filter((v) => v !== value) }
      setMetaFilters(next)
    } else {
      let next: ActiveFilters
      if (key === 'grade')       next = { ...activeFilters, grade:       activeFilters.grade.filter((v) => v !== value) }
      else if (key === 'level')  next = { ...activeFilters, level:       activeFilters.level.filter((v) => v !== value) }
      else if (key === 'productType') next = { ...activeFilters, productType: activeFilters.productType.filter((v) => v !== value) }
      else if (key === 'price')  next = { ...activeFilters, minPrice: undefined, maxPrice: undefined }
      else if (key === 'discount') next = { ...activeFilters, discount: false }
      else next = activeFilters
      pushFilters(next)
    }
  }

  const totalActive = countBasicFilters(activeFilters) + countMetaFilters(metaFilters)
  const hasTabs = (SPORTS_TABS[sport] ?? []).length > 0

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-12 pb-3 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="p-1 -ml-1">
          <Icon name="arrow-left" size={22} className="text-[#181818]" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <SportIcon sport={sport as SportKey} size={20} className="text-[#181818]" />
          <h1 className="text-[18px] font-bold text-[#181818]">{label}</h1>
        </div>
      </div>

      {/* 필터 + 정렬 바 */}
      <div className="px-4 pb-2 flex items-center gap-2">
        {/* 필터 버튼 */}
        <button
          onClick={openSheet}
          className="flex items-center gap-1.5 h-[34px] px-3.5 rounded-full border flex-shrink-0 transition-colors"
          style={
            totalActive > 0
              ? { borderColor: '#181818', backgroundColor: '#181818' }
              : { borderColor: '#E0E0E0', backgroundColor: '#fff' }
          }
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M7 12h10M10 18h4"
              stroke={totalActive > 0 ? '#fff' : '#555'}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[13px] font-medium" style={{ color: totalActive > 0 ? '#fff' : '#555' }}>
            필터{totalActive > 0 ? ` ${totalActive}` : ''}
          </span>
        </button>

        {/* 정렬 탭 */}
        <div className="flex items-center gap-0.5 ml-auto overflow-x-auto scrollbar-hide">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                const next = { ...activeFilters, sort: s.value }
                pushFilters(next)
              }}
              className="text-[12px] px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 transition-colors"
              style={
                activeFilters.sort === s.value
                  ? { color: '#181818', fontWeight: 700 }
                  : { color: '#C8C8C8', fontWeight: 500 }
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 활성 필터 칩 */}
      <ActiveChips
        sport={sport}
        activeFilters={activeFilters}
        metaFilters={metaFilters}
        onRemove={handleRemove}
      />

      {/* 상품 수 */}
      <div className="px-4 pb-3">
        <p className="text-[13px] text-[#9E9E9E]">상품 {displayedProducts.length}개</p>
      </div>

      {/* 상품 그리드 */}
      <div className="px-4 pb-24">
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-3">
              <SportIcon sport={sport as SportKey} size={32} className="text-[#C8C8C8]" />
            </div>
            <p className="text-[15px] font-semibold text-[#181818] mb-1">
              {totalActive > 0 ? '조건에 맞는 상품이 없어요' : '등록된 상품이 없어요'}
            </p>
            <p className="text-[13px] text-[#9E9E9E]">
              {totalActive > 0 ? '필터를 조정해보세요' : `아직 ${label} 용품이 올라오지 않았어요`}
            </p>
            {totalActive > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 h-[36px] px-5 rounded-full border border-[#E0E0E0] text-[13px] font-medium text-[#555]"
              >
                필터 초기화
              </button>
            )}
          </div>
        )}
      </div>

      {/* 필터 바텀시트 */}
      {sheetOpen && (
        <FilterSheet
          sport={sport}
          draft={draft}
          draftMeta={draftMeta}
          onDraftChange={(partial) => setDraft((prev) => ({ ...prev, ...partial }))}
          onMetaChange={toggleDraftMeta}
          onReset={resetFilters}
          onApply={applyFilters}
          onClose={() => setSheetOpen(false)}
          brandOptions={brandOptions}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// 상품 카드
// ─────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const images: string[] = JSON.parse(product.images)
  const thumbUrl = images[0] ?? null

  return (
    <Link href={`/products/${product.id}`} className="flex flex-col">
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

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          {product.discount != null && product.discount > 0 && (
            <span className="text-[13px] font-bold text-[#FF4444]">{product.discount}%</span>
          )}
          <span className="text-[14px] font-bold text-[#181818]">
            {product.price.toLocaleString()}원
          </span>
        </div>
        <p className="text-[12px] font-medium text-[#181818] leading-[18px] line-clamp-2">
          {product.name}
        </p>
        {product.location && (
          <p className="text-[11px] text-[#9E9E9E]">
            {product.location} · {formatTime(product.createdAt)}
          </p>
        )}
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
