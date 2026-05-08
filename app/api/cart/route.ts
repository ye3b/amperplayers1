import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 장바구니 목록 조회
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

// 장바구니 추가
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  })
  return NextResponse.json(item)
}

// 장바구니 삭제
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  await prisma.cartItem.deleteMany({ where: { userId, productId } })
  return NextResponse.json({ ok: true })
}
