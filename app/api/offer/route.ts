import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const buyerId = (session.user as { id: string }).id
  const buyerName = (session.user as { name?: string }).name ?? '구매자'

  const { productId, offerPrice } = await req.json()
  if (!productId || !offerPrice) {
    return NextResponse.json({ error: 'productId and offerPrice required' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { userId: true, name: true, price: true },
  })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (product.userId === buyerId) {
    return NextResponse.json({ error: 'Cannot offer on your own product' }, { status: 400 })
  }

  // 채팅방 생성 또는 기존 방 재사용
  const chat = await prisma.chat.upsert({
    where: { productId_buyerId: { productId, buyerId } },
    create: { productId, buyerId, sellerId: product.userId },
    update: {},
  })

  // 제안 메시지 채팅방에 전송
  const offerAmount = Number(offerPrice).toLocaleString('ko-KR')
  await prisma.message.create({
    data: {
      chatId: chat.id,
      senderId: buyerId,
      content: `💰 가격 제안: ${offerAmount}원\n(판매가 ${product.price.toLocaleString('ko-KR')}원)`,
      type: 'text',
    },
  })

  // 채팅 updatedAt 갱신 (목록 정렬용)
  await prisma.chat.update({ where: { id: chat.id }, data: { updatedAt: new Date() } })

  // 판매자에게 푸시 알림 전송
  await sendPushToUser(product.userId, 'chat', {
    title: `${buyerName}님의 가격 제안`,
    body: `${product.name} — ${offerAmount}원에 구매하고 싶어요`,
    url: `/chat/${chat.id}`,
  })

  return NextResponse.json({ chatId: chat.id })
}
