import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 관심 상품 목록 조회
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const items = await prisma.wishlist.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

// 관심 상품 토글 (없으면 추가, 있으면 삭제)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  })

  if (existing) {
    await prisma.wishlist.delete({ where: { userId_productId: { userId, productId } } })
    await prisma.product.update({ where: { id: productId }, data: { likes: { decrement: 1 } } })
    return NextResponse.json({ liked: false })
  } else {
    await prisma.wishlist.create({ data: { userId, productId } })
    await prisma.product.update({ where: { id: productId }, data: { likes: { increment: 1 } } })
    return NextResponse.json({ liked: true })
  }
}
