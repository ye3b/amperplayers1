import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// KakaoPay 결제 승인 → SID(구독키) 저장
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const { tid, pgToken } = await req.json()
  if (!tid || !pgToken) return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })

  const res = await fetch('https://open-api.kakaopay.com/online/v1/payment/approve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `SECRET_KEY ${process.env.KAKAO_PAY_SECRET_KEY}`,
    },
    body: JSON.stringify({
      cid: process.env.KAKAO_PAY_CID,
      tid,
      partner_order_id: `register_${userId}`,
      partner_user_id: userId,
      pg_token: pgToken,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.msg || '카카오페이 승인 실패' }, { status: 400 })
  }

  const data = await res.json()
  const sid = data.sid ?? null

  // 기존 kakao 타입 교체
  await prisma.paymentMethod.deleteMany({ where: { userId, type: 'kakao' } })

  const method = await prisma.paymentMethod.create({
    data: {
      userId,
      type: 'kakao',
      alias: '카카오페이',
      billingKey: sid,
      isDefault: (await prisma.paymentMethod.count({ where: { userId } })) === 0,
    },
  })

  return NextResponse.json(method, { status: 201 })
}
