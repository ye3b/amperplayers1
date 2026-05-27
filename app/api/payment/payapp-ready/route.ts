import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const buyerId = (session.user as { id: string }).id

  const { productId, shippingMethod, shippingAddressId } = await req.json()
  if (!productId || !shippingMethod || !shippingAddressId) {
    return NextResponse.json({ error: '필수 항목이 누락되었어요.' }, { status: 400 })
  }

  // 상품 검증
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || product.status !== 'active') {
    return NextResponse.json({ error: '구매할 수 없는 상품이에요.' }, { status: 400 })
  }
  if (product.userId === buyerId) {
    return NextResponse.json({ error: '본인 상품은 구매할 수 없어요.' }, { status: 400 })
  }

  // 배송지 검증
  const shippingAddress = await prisma.shippingAddress.findUnique({ where: { id: shippingAddressId } })
  if (!shippingAddress || shippingAddress.userId !== buyerId) {
    return NextResponse.json({ error: '배송지를 찾을 수 없어요.' }, { status: 404 })
  }

  // 금액 계산
  const discountedPrice =
    product.discount && product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price
  const shippingFee =
    shippingMethod === 'prepaid' && product.shippingType === 'separate'
      ? (product.shippingFee ?? 0)
      : 0
  const totalAmount = discountedPrice + shippingFee

  if (totalAmount <= 0) {
    return NextResponse.json({ error: '페이앱은 0원 결제를 지원하지 않아요.' }, { status: 400 })
  }

  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  // 페이앱 결제 요청 (URL-encoded 응답 반환)
  const params = new URLSearchParams({
    cmd: 'payrequest',
    userid: process.env.PAYAPP_USERID!,
    goodname: product.name.slice(0, 40),
    price: totalAmount.toString(),
    recvphone: process.env.PAYAPP_RECVPHONE!,
    redirecturl: `${base}/checkout/payapp-success?productId=${productId}`,
    callbackurl: `${base}/api/payment/payapp-callback`,
  })

  const payappRes = await fetch('https://api.payapp.kr/oapi/apiLoad.html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!payappRes.ok) {
    return NextResponse.json({ error: '페이앱 서버 연결에 실패했어요.' }, { status: 502 })
  }

  // 페이앱은 URL-encoded 형식으로 응답
  const rawText = await payappRes.text()
  const result = new URLSearchParams(rawText)

  const state = result.get('state')
  const mulNo = result.get('mul_no')   // 결제 고유 번호 (token 역할)
  const payurl = result.get('payurl')
  const errorMessage = result.get('errorMessage')

  if (state !== '1' || !mulNo || !payurl) {
    return NextResponse.json({
      error: errorMessage || '페이앱 결제 준비에 실패했어요.',
    }, { status: 400 })
  }

  // 결제 의도 임시 저장 (PaymentMethod 테이블 활용, mul_no를 billingKey로)
  await prisma.paymentMethod.deleteMany({
    where: { userId: buyerId, type: 'payapp_pending' },
  })

  const shippingSnapshot = JSON.stringify({
    label: shippingAddress.label,
    recipient: shippingAddress.recipient,
    phone: shippingAddress.phone,
    zipCode: shippingAddress.zipCode,
    address: shippingAddress.address,
    addressDetail: shippingAddress.addressDetail,
  })

  await prisma.paymentMethod.create({
    data: {
      userId: buyerId,
      type: 'payapp_pending',
      alias: '페이앱 결제 대기',
      billingKey: mulNo,
      customerKey: JSON.stringify({
        productId,
        shippingMethod,
        buyerId,
        sellerId: product.userId,
        productName: product.name,
        totalAmount,
        shippingSnapshot,
        refundDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      isDefault: false,
    },
  })

  return NextResponse.json({ payurl, mulNo })
}
