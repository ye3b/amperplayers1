import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  // 최근 7일 내 검색어를 집계해 상위 10개 반환
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const rows = await prisma.searchLog.groupBy({
    by: ['query'],
    where: { createdAt: { gte: since } },
    _count: { query: true },
    orderBy: { _count: { query: 'desc' } },
    take: 10,
  })

  const popular = rows.map((r) => r.query)
  return NextResponse.json({ popular })
}
