import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'

// 주문 상태 변경 (판매자: preparing / shipped)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.sellerId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { status, trackingNumber, trackingCarrier } = body

  if (status === 'preparing') {
    if (order.status !== 'paid') {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
    }
    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: 'preparing', preparingAt: new Date() },
    })
    await prisma.message.create({
      data: {
        chatId: order.chatId,
        type: 'system_preparing',
        content: '배송이 곧 시작됩니다!',
        metadata: JSON.stringify({ orderId: order.id }),
      },
    })
    await prisma.chat.update({ where: { id: order.chatId }, data: { updatedAt: new Date() } })
    // 구매자에게 배송 준비 푸시
    sendPushToUser(order.buyerId, 'transaction', {
      title: '배송 준비 중이에요',
      body: '판매자가 배송을 준비하고 있어요.',
      url: `/chat/${order.chatId}`,
    }).catch(() => {})
    return NextResponse.json(updated)
  }

  if (status === 'shipped') {
    if (order.status !== 'preparing') {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
    }
    if (!trackingNumber) {
      return NextResponse.json({ error: 'trackingNumber required' }, { status: 400 })
    }
    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'shipped',
        trackingNumber,
        trackingCarrier: trackingCarrier ?? null,
        shippedAt: new Date(),
      },
    })
    await prisma.message.create({
      data: {
        chatId: order.chatId,
        type: 'system_shipped',
        content: '운송장 번호가 등록되었어요.',
        metadata: JSON.stringify({
          orderId: order.id,
          trackingNumber,
          trackingCarrier: trackingCarrier ?? null,
        }),
      },
    })
    await prisma.chat.update({ where: { id: order.chatId }, data: { updatedAt: new Date() } })
    // 구매자에게 배송 시작 푸시
    sendPushToUser(order.buyerId, 'transaction', {
      title: '상품이 발송됐어요',
      body: `운송장 번호: ${trackingNumber}`,
      url: `/chat/${order.chatId}`,
    }).catch(() => {})
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
}

// 주문 조회
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      product: { select: { id: true, name: true, price: true, images: true } },
      buyer: { select: { id: true, name: true, username: true } },
      seller: { select: { id: true, name: true, username: true } },
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.buyerId !== userId && order.sellerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(order)
}
