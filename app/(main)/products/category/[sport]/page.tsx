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
