import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 내 채팅 목록 조회
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const chats = await prisma.chat.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: {
      product: { select: { id: true, name: true, price: true, images: true } },
      buyer: { select: { id: true, name: true, username: true, image: true } },
      seller: { select: { id: true, name: true, username: true, image: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(chats)
}

// 채팅방 생성 (구매자가 판매자에게)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const buyerId = (session.user as { id: string }).id

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { userId: true },
  })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (product.userId === buyerId) {
    return NextResponse.json({ error: 'Cannot chat with yourself' }, { status: 400 })
  }

  const chat = await prisma.chat.upsert({
    where: { productId_buyerId: { productId, buyerId } },
    create: { productId, buyerId, sellerId: product.userId },
    update: {},
  })

  return NextResponse.json(chat)
}
