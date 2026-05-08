import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Prisma } from '@prisma/client'
import CategoryClient from './CategoryClient'

const SPORT_LABELS: Record<string, string> = {
  soccer:      '축구',
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
  skiing:      '스키',
  snowboard:   '스노보드',
  tabletennis: '탁구',
  boxing:      '복싱',
  futsal:      '풋살',
  climbing:    '클라이밍',
  surfing:     '서핑',
}

const MOCK_PRODUCTS = [
  // 축구
  { id: 'mock-1',  name: '나이키 머큐리얼 축구화 270mm', price: 85000,  sport: 'soccer',     productType: 'shoes',    grade: 'A', level: 'amateur', score: 85, discount: 0,  location: '서울 강남구', images: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"]', likes: 12, createdAt: new Date(), metadata: null },
  { id: 'mock-2',  name: '아디다스 탱고 축구공 5호', price: 32000,  sport: 'soccer',     productType: 'ball',     grade: 'B', level: 'beginner', score: 70, discount: 5000, location: '서울 마포구', images: '["https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=400"]', likes: 8,  createdAt: new Date(), metadata: null },
  { id: 'mock-3',  name: '푸마 축구 유니폼 세트 M사이즈', price: 45000,  sport: 'soccer',     productType: 'uniform', grade: 'S', level: 'amateur', score: 95, discount: 0,  location: '경기 성남시', images: '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"]', likes: 21, createdAt: new Date(), metadata: null },
  { id: 'mock-4',  name: '나이키 티엠포 축구화 265mm', price: 120000, sport: 'soccer',     productType: 'shoes',    grade: 'S', level: 'pro',     score: 92, discount: 20000, location: '서울 송파구', images: '["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400"]', likes: 34, createdAt: new Date(), metadata: null },
  { id: 'mock-5',  name: '미즈노 축구공 4호 공식구', price: 55000,  sport: 'soccer',     productType: 'ball',     grade: 'A', level: 'amateur', score: 88, discount: 0,  location: '인천 부평구', images: '["https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400"]', likes: 6,  createdAt: new Date(), metadata: null },
  { id: 'mock-6',  name: '아디다스 축구 유니폼 레알마드리드 L', price: 38000,  sport: 'soccer',     productType: 'uniform', grade: 'B', level: 'beginner', score: 72, discount: 0,  location: '서울 강서구', images: '["https://images.unsplash.com/photo-1540747913346-19212a4b423e?w=400"]', likes: 15, createdAt: new Date(), metadata: null },
  // 농구
  { id: 'mock-7',  name: '나이키 에어조던 농구화 280mm', price: 150000, sport: 'basketball', productType: 'shoes',    grade: 'A', level: 'amateur', score: 87, discount: 0,  location: '서울 강남구', images: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"]', likes: 28, createdAt: new Date(), metadata: null },
  { id: 'mock-8',  name: '스폴딩 NBA 공식 농구공 7호', price: 68000,  sport: 'basketball', productType: 'ball',     grade: 'B', level: 'pro',     score: 80, discount: 8000, location: '서울 노원구', images: '["https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400"]', likes: 19, createdAt: new Date(), metadata: null },
  { id: 'mock-9',  name: '아디다스 농구 유니폼 XL', price: 42000,  sport: 'basketball', productType: 'uniform', grade: 'S', level: 'amateur', score: 90, discount: 0,  location: '경기 수원시', images: '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"]', likes: 11, createdAt: new Date(), metadata: null },
  // 야구
  { id: 'mock-10', name: '롤링스 야구 글러브 내야수용', price: 95000,  sport: 'baseball',   productType: 'glove',    grade: 'A', level: 'amateur', score: 85, discount: 0,  location: '서울 강북구', images: '["https://images.unsplash.com/photo-1566379285-cc2f65a0d420?w=400"]', likes: 9,  createdAt: new Date(), metadata: null },
  { id: 'mock-11', name: '미즈노 야구 배트 82cm 알루미늄', price: 78000,  sport: 'baseball',   productType: 'bat',      grade: 'B', level: 'beginner', score: 75, discount: 0,  location: '부산 해운대구', images: '["https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=400"]', likes: 7,  createdAt: new Date(), metadata: null },
  // 테니스
  { id: 'mock-12', name: '윌슨 프로 테니스 라켓 100sq', price: 185000, sport: 'tennis',     productType: 'racket',   grade: 'A', level: 'pro',     score: 88, discount: 15000, location: '서울 서초구', images: '["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"]', likes: 22, createdAt: new Date(), metadata: null },
  { id: 'mock-13', name: '바볼랏 퓨어 드라이브 테니스공 3개입', price: 15000,  sport: 'tennis',     productType: 'ball',     grade: 'S', level: 'beginner', score: 95, discount: 0,  location: '경기 용인시', images: '["https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400"]', likes: 14, createdAt: new Date(), metadata: null },
  // 배드민턴
  { id: 'mock-14', name: '요넥스 아크세이버 배드민턴 라켓 3U', price: 135000, sport: 'badminton',  productType: 'racket',   grade: 'A', level: 'amateur', score: 86, discount: 0,  location: '서울 은평구', images: '["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400"]', likes: 17, createdAt: new Date(), metadata: null },
  // 골프
  { id: 'mock-15', name: '타이틀리스트 아이언 세트 5-P', price: 450000, sport: 'golf',       productType: 'iron',     grade: 'A', level: 'pro',     score: 88, discount: 50000, location: '서울 강남구', images: '["https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"]', likes: 31, createdAt: new Date(), metadata: null },
  { id: 'mock-16', name: '캘러웨이 드라이버 10.5도', price: 280000, sport: 'golf',       productType: 'driver',   grade: 'B', level: 'amateur', score: 78, discount: 0,  location: '경기 고양시', images: '["https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400"]', likes: 25, createdAt: new Date(), metadata: null },
  // 러닝
  { id: 'mock-17', name: '나이키 페가수스 40 러닝화 270mm', price: 95000,  sport: 'running',    productType: 'shoes',    grade: 'A', level: 'beginner', score: 87, discount: 0,  location: '서울 동작구', images: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"]', likes: 18, createdAt: new Date(), metadata: null },
  { id: 'mock-18', name: '가민 포러너 255 GPS 러닝 워치', price: 220000, sport: 'running',    productType: 'watch',    grade: 'S', level: 'pro',     score: 93, discount: 0,  location: '서울 광진구', images: '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"]', likes: 42, createdAt: new Date(), metadata: null },
  // 헬스
  { id: 'mock-19', name: '요철 덤벨 세트 5-20kg', price: 75000,  sport: 'fitness',    productType: 'dumbbell', grade: 'B', level: 'beginner', score: 76, discount: 0,  location: '서울 강동구', images: '["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400"]', likes: 13, createdAt: new Date(), metadata: null },
  { id: 'mock-20', name: '나이키 트레이닝화 270mm', price: 62000,  sport: 'fitness',    productType: 'shoes',    grade: 'A', level: 'amateur', score: 84, discount: 12000, location: '경기 부천시', images: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"]', likes: 10, createdAt: new Date(), metadata: null },
  // 자전거
  { id: 'mock-21', name: '트렉 FX3 하이브리드 자전거', price: 850000, sport: 'cycling',    productType: 'bike',     grade: 'A', level: 'amateur', score: 88, discount: 0,  location: '서울 양천구', images: '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"]', likes: 37, createdAt: new Date(), metadata: null },
  // 수영
  { id: 'mock-22', name: '스피도 패스트스킨 수영복 M', price: 48000,  sport: 'swimming',   productType: 'swimsuit', grade: 'S', level: 'pro',     score: 91, discount: 0,  location: '서울 관악구', images: '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"]', likes: 16, createdAt: new Date(), metadata: null },
  // 스키
  { id: 'mock-23', name: '살로몬 QST 스키 세트 165cm', price: 380000, sport: 'skiing',     productType: 'ski',      grade: 'A', level: 'amateur', score: 86, discount: 30000, location: '강원 평창군', images: '["https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400"]', likes: 20, createdAt: new Date(), metadata: null },
  // 스노보드
  { id: 'mock-24', name: '버튼 카스텔 스노보드 155cm', price: 290000, sport: 'snowboard',  productType: 'board',    grade: 'B', level: 'beginner', score: 77, discount: 0,  location: '강원 강릉시', images: '["https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400"]', likes: 24, createdAt: new Date(), metadata: null },
  // 배구
  { id: 'mock-25', name: '미즈노 배구화 255mm', price: 72000,  sport: 'volleyball', productType: 'shoes',    grade: 'A', level: 'amateur', score: 85, discount: 0,  location: '서울 구로구', images: '["https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400"]', likes: 9,  createdAt: new Date(), metadata: null },
  // 탁구
  { id: 'mock-26', name: '버터플라이 탁구 라켓 FL 그립', price: 55000,  sport: 'tabletennis',productType: 'racket',   grade: 'A', level: 'amateur', score: 87, discount: 0,  location: '서울 중구', images: '["https://images.unsplash.com/photo-1534158914592-062992fbe900?w=400"]', likes: 11, createdAt: new Date(), metadata: null },
  // 복싱
  { id: 'mock-27', name: '이블라스트 복싱 글러브 16oz', price: 45000,  sport: 'boxing',     productType: 'glove',    grade: 'B', level: 'beginner', score: 74, discount: 5000, location: '서울 성동구', images: '["https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400"]', likes: 8,  createdAt: new Date(), metadata: null },
  // 풋살
  { id: 'mock-28', name: '나이키 풋살화 인도어 260mm', price: 65000,  sport: 'futsal',     productType: 'shoes',    grade: 'A', level: 'amateur', score: 86, discount: 0,  location: '서울 영등포구', images: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"]', likes: 13, createdAt: new Date(), metadata: null },
  // 클라이밍
  { id: 'mock-29', name: '스카르파 클라이밍화 EUR42', price: 110000, sport: 'climbing',    productType: 'shoes',    grade: 'A', level: 'pro',     score: 89, discount: 0,  location: '서울 도봉구', images: '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"]', likes: 26, createdAt: new Date(), metadata: null },
  // 서핑
  { id: 'mock-30', name: '립컬 서프보드 7\'0" 펀보드', price: 320000, sport: 'surfing',    productType: 'board',    grade: 'B', level: 'beginner', score: 78, discount: 0,  location: '부산 해운대구', images: '["https://images.unsplash.com/photo-1526317432010-e45a4d0a66e4?w=400"]', likes: 30, createdAt: new Date(), metadata: null },
]

export async function generateMetadata({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params
  const label = SPORT_LABELS[sport]
  if (!label) return {}
  return { title: `${label} 용품` }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ sport: string }>
  searchParams: Promise<{
    grade?: string
    level?: string
    productType?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    discount?: string
  }>
}) {
  const { sport } = await params
  const filters = await searchParams

  if (!SPORT_LABELS[sport]) notFound()

  // WHERE 절 구성
  const where: Prisma.ProductWhereInput = { sport, status: 'active' }

  const grades = filters.grade?.split(',').filter(Boolean) ?? []
  if (grades.length) where.grade = { in: grades }

  const levels = filters.level?.split(',').filter(Boolean) ?? []
  if (levels.length) where.level = { in: levels }

  const productTypes = filters.productType?.split(',').filter(Boolean) ?? []
  if (productTypes.length) where.productType = { in: productTypes }

  const minPrice = filters.minPrice ? parseInt(filters.minPrice) : undefined
  const maxPrice = filters.maxPrice ? parseInt(filters.maxPrice) : undefined
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) (where.price as Prisma.IntFilter).gte = minPrice
    if (maxPrice !== undefined) (where.price as Prisma.IntFilter).lte = maxPrice
  }

  if (filters.discount === 'true') where.discount = { gt: 0 }

  // 정렬
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
  if (filters.sort === 'price_asc')  orderBy = { price: 'asc' }
  if (filters.sort === 'price_desc') orderBy = { price: 'desc' }
  if (filters.sort === 'likes')      orderBy = { likes: 'desc' }

  let products = await prisma.product.findMany({
    where,
    orderBy,
    take: 60,
  })

  // DB에 상품이 없으면 Mock 데이터 사용
  if (products.length === 0) {
    const now = new Date()
    products = MOCK_PRODUCTS
      .filter((p) => p.sport === sport)
      .filter((p) => grades.length === 0 || (p.grade && grades.includes(p.grade)))
      .filter((p) => levels.length === 0 || (p.level && levels.includes(p.level)))
      .filter((p) => productTypes.length === 0 || (p.productType && productTypes.includes(p.productType)))
      .filter((p) => {
        if (minPrice !== undefined && p.price < minPrice) return false
        if (maxPrice !== undefined && p.price > maxPrice) return false
        return true
      })
      .sort((a, b) => {
        if (filters.sort === 'price_asc')  return a.price - b.price
        if (filters.sort === 'price_desc') return b.price - a.price
        if (filters.sort === 'likes')      return b.likes - a.likes
        return 0
      }) as typeof products
  }

  return (
    <CategoryClient
      sport={sport}
      label={SPORT_LABELS[sport]}
      products={products.map((p) => ({ ...p }))}
      activeFilters={{
        grade: grades,
        level: levels,
        productType: productTypes,
        minPrice,
        maxPrice,
        sort: filters.sort ?? 'newest',
        discount: filters.discount === 'true',
      }}
    />
  )
}
