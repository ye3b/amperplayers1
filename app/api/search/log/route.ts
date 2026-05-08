import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { query } = await req.json()
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  await prisma.searchLog.create({ data: { query: query.trim() } })
  return NextResponse.json({ ok: true })
}
