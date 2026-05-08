import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const buyerId = (session.user as { id: string }).id

  const { productId, shippingMethod, shippingAddressId, paymentMethodId } = await req.json()
  if (!productId || !shippingMethod || !shippingAddressId || !paymentMethodId) {
    return NextResponse.json({ error: '필수 항목이 누락되었어요.' }, { status: 400 })
  }

  // 1. 상품 조회
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || product.status !== 'active') {
    return NextResponse.json({ error: '구매할 수 없는 상품이에요.' }, { status: 400 })
  }
  if (product.userId === buyerId) {
    return NextResponse.json({ error: '본인 상품은 구매할 수 없어요.' }, { status: 400 })
  }

  // 2. 결제수단 조회
  const paymentMethod = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } })
  if (!paymentMethod || paymentMethod.userId !== buyerId) {
    return NextResponse.json({ error: '결제수단을 찾을 수 없어요.' }, { status: 404 })
  }

  // 3. 배송지 조회
  const shippingAddress = await prisma.shippingAddress.findUnique({ where: { id: shippingAddressId } })
  if (!shippingAddress || shippingAddress.userId !== buyerId) {
    return NextResponse.json({ error: '배송지를 찾을 수 없어요.' }, { status: 404 })
  }

  // 4. 결제 금액 계산
  const discountedPrice =
    product.discount && product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price
  const shippingFee =
    shippingMethod === 'prepaid' && product.shippingType === 'separate'
      ? (product.shippingFee ?? 0)
      : 0
  const totalAmount = discountedPrice + shippingFee

  // 5. 실결제 (금액이 있을 때만)
  const orderId = `order_${Date.now()}_${buyerId.slice(-4)}`

  if (totalAmount > 0) {
    if (paymentMethod.type === 'kakao') {
      const kakaoRes = await fetch('https://open-api.kakaopay.com/online/v1/payment/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `SECRET_KEY ${process.env.KAKAO_PAY_SECRET_KEY}`,
        },
        body: JSON.stringify({
          cid: process.env.KAKAO_PAY_CID,
          sid: paymentMethod.billingKey,
          partner_order_id: orderId,
          partner_user_id: buyerId,
          item_name: product.name,
          quantity: 1,
          total_amount: totalAmount,
          tax_free_amount: 0,
        }),
      })
      if (!kakaoRes.ok) {
        const err = await kakaoRes.json()
        return NextResponse.json({ error: err.msg || '카카오페이 결제에 실패했어요.' }, { status: 400 })
      }
    } else {
      // toss / naver
      const tossRes = await fetch(
        `https://api.tosspayments.com/v1/billing/${paymentMethod.billingKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
          },
          body: JSON.stringify({
            customerKey: paymentMethod.customerKey,
            amount: totalAmount,
            orderId,
            orderName: product.name,
          }),
        }
      )
      if (!tossRes.ok) {
        const err = await tossRes.json()
        return NextResponse.json({ error: err.message || '결제에 실패했어요.' }, { status: 400 })
      }
    }
  }

  // 6. 채팅방 생성 또는 조회
  let chat = await prisma.chat.findUnique({
    where: { productId_buyerId: { productId, buyerId } },
  })
  if (!chat) {
    chat = await prisma.chat.create({
      data: { productId, buyerId, sellerId: product.userId },
    })
  }

  // 중복 주문 방지
  const existing = await prisma.order.findUnique({ where: { chatId: chat.id } })
  if (existing) {
    return NextResponse.json({ error: '이미 주문이 존재해요.', chatId: chat.id }, { status: 409 })
  }

  // 7. 주문 생성
  const refundDeadline = new Date()
  refundDeadline.setDate(refundDeadline.getDate() + 7)

  const shippingSnapshot = JSON.stringify({
    label: shippingAddress.label,
    recipient: shippingAddress.recipient,
    phone: shippingAddress.phone,
    zipCode: shippingAddress.zipCode,
    address: shippingAddress.address,
    addressDetail: shippingAddress.addressDetail,
  })

  const order = await prisma.order.create({
    data: {
      chatId: chat.id,
      productId,
      buyerId,
      sellerId: product.userId,
      status: 'paid',
      shippingMethod,
      shippingSnapshot,
      refundDeadline,
    },
  })

  // 8. 상품 상태 sold로 변경
  await prisma.product.update({ where: { id: productId }, data: { status: 'sold' } })

  // 9. 시스템 메시지
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

  // 10. 판매자 푸시
  sendPushToUser(product.userId, 'transaction', {
    title: '결제가 완료됐어요',
    body: `${product.name} 거래가 시작됐어요. 배송을 준비해주세요.`,
    url: `/chat/${chat.id}`,
  }).catch(() => {})

  return NextResponse.json({ chatId: chat.id, orderId: order.id }, { status: 201 })
}
