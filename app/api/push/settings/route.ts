import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 알림 설정 조회
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const settings = await prisma.notificationSettings.findUnique({ where: { userId } })
  return NextResponse.json(settings ?? { chat: true, transaction: true, wishlist: true, newProduct: false, marketing: false })
}

// 알림 설정 저장
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const body = await req.json()
  const data: Record<string, boolean> = {}
  for (const key of ['chat', 'transaction', 'wishlist', 'newProduct', 'marketing']) {
    if (typeof body[key] === 'boolean') data[key] = body[key]
  }

  const settings = await prisma.notificationSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  })

  return NextResponse.json(settings)
}
