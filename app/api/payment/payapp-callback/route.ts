import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'

// 페이앱 서버 → 우리 서버 결제 완료 콜백
// 페이앱은 결제 완료 시 POST로 URL-encoded 데이터를 전송
export async function POST(req: NextRequest) {
  const body = await req.text()
  const params = new URLSearchParams(body)

  const mulNo = params.get('mul_no')       // 결제 고유번호
  const state = params.get('state')        // 1: 성공, 0: 실패
  const payPrice = params.get('pay_price') // 실제 결제 금액

  // 결제 실패 또는 필수값 누락
  if (state !== '1' || !mulNo) {
    return new NextResponse('FAIL', { status: 200 })
  }

  // 대기 중인 결제 의도 조회 (mul_no를 billingKey로 저장)
  const pending = await prisma.paymentMethod.findFirst({
    where: { billingKey: mulNo, type: 'payapp_pending' },
  })

  if (!pending || !pending.customerKey) {
    return new NextResponse('FAIL', { status: 200 })
  }

  let orderData: {
    productId: string
    shippingMethod: string
    buyerId: string
    sellerId: string
    productName: string
    totalAmount: number
    shippingSnapshot: string
    refundDeadline: string
  }

  try {
    orderData = JSON.parse(pending.customerKey)
  } catch {
    await prisma.paymentMethod.delete({ where: { id: pending.id } })
    return new NextResponse('FAIL', { status: 200 })
  }

  // 금액 검증
  if (payPrice && parseInt(payPrice) !== orderData.totalAmount) {
    await prisma.paymentMethod.delete({ where: { id: pending.id } })
    return new NextResponse('FAIL', { status: 200 })
  }

  const { productId, shippingMethod, buyerId, sellerId, productName, totalAmount, shippingSnapshot, refundDeadline } = orderData

  // 이미 결제된 주문 중복 방지
  const existingChat = await prisma.chat.findUnique({
    where: { productId_buyerId: { productId, buyerId } },
  })
  if (existingChat) {
    const existingOrder = await prisma.order.findUnique({ where: { chatId: existingChat.id } })
    if (existingOrder) {
      await prisma.paymentMethod.delete({ where: { id: pending.id } })
      return new NextResponse('SUCCESS', { status: 200 })
    }
  }

  // 채팅방 생성 또는 조회
  const chat = existingChat ?? await prisma.chat.create({
    data: { productId, buyerId, sellerId },
  })

  // 주문 생성
  const order = await prisma.order.create({
    data: {
      chatId: chat.id,
      productId,
      buyerId,
      sellerId,
      status: 'paid',
      shippingMethod,
      shippingSnapshot,
      refundDeadline: new Date(refundDeadline),
    },
  })

  // 상품 상태 sold로 변경
  await prisma.product.update({ where: { id: productId }, data: { status: 'sold' } })

  // 시스템 메시지
  await prisma.message.create({
    data: {
      chatId: chat.id,
      type: 'system_payment',
      content: '결제를 완료했어요.',
      metadata: JSON.stringify({
        orderId: order.id,
        shippingMethod,
        shippingSnapshot,
        refundDeadline: order.refundDeadline?.toISOString(),
        amount: totalAmount,
      }),
    },
  })
  await prisma.chat.update({ where: { id: chat.id }, data: { updatedAt: new Date() } })

  // 대기 레코드 삭제
  await prisma.paymentMethod.delete({ where: { id: pending.id } })

  // 판매자 푸시 알림
  sendPushToUser(sellerId, 'transaction', {
    title: '결제가 완료됐어요',
    body: `${productName} 거래가 시작됐어요. 배송을 준비해주세요.`,
    url: `/chat/${chat.id}`,
  }).catch(() => {})

  return new NextResponse('SUCCESS', { status: 200 })
}
