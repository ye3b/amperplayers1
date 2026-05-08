import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // 최근 30일 종목 클릭 집계, 상위 8개
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const rows = await prisma.sportClickLog.groupBy({
    by: ['sport'],
    where: { createdAt: { gte: since } },
    _count: { sport: true },
    orderBy: { _count: { sport: 'desc' } },
    take: 8,
  })

  const sports = rows.map((r) => r.sport)
  return NextResponse.json({ sports })
}

export async function POST(req: Request) {
  const { sport } = await req.json()
  if (!sport || typeof sport !== 'string') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  await prisma.sportClickLog.create({ data: { sport } })
  return NextResponse.json({ ok: true })
}
