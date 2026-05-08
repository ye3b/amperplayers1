import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'

// 주문 생성 (결제 완료 시)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const buyerId = (session.user as { id: string }).id

  const { chatId, shippingMethod, buyerNote } = await req.json()
  if (!chatId) return NextResponse.json({ error: 'chatId required' }, { status: 400 })

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { product: true, order: true },
  })
  if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  if (chat.buyerId !== buyerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (chat.order) return NextResponse.json({ error: 'Order already exists' }, { status: 409 })

  // 자동 환불 기한: 결제 후 7일
  const refundDeadline = new Date()
  refundDeadline.setDate(refundDeadline.getDate() + 7)

  const order = await prisma.order.create({
    data: {
      chatId,
      productId: chat.productId,
      buyerId,
      sellerId: chat.sellerId,
      status: 'paid',
      shippingMethod: shippingMethod ?? null,
      buyerNote: buyerNote ?? null,
      refundDeadline,
    },
  })

  // 시스템 메시지 생성
  const metadata = JSON.stringify({
    orderId: order.id,
    shippingMethod: order.shippingMethod,
    buyerNote: order.buyerNote,
    refundDeadline: order.refundDeadline?.toISOString(),
  })
  await prisma.message.create({
    data: {
      chatId,
      type: 'system_payment',
      content: '결제를 완료했어요.',
      metadata,
    },
  })
  await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } })

  // 판매자에게 결제 완료 푸시
  sendPushToUser(chat.sellerId, 'transaction', {
    title: '결제가 완료됐어요',
    body: `${chat.product.name} 거래가 시작됐어요. 배송을 준비해주세요.`,
    url: `/chat/${chatId}`,
  }).catch(() => {})

  return NextResponse.json(order, { status: 201 })
}
