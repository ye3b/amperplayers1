import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Toss authKey → 빌링키 발급 후 저장
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const { authKey, customerKey, type } = await req.json()
  if (!authKey || !customerKey || !type) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  // Toss 빌링키 발급
  const tossRes = await fetch('https://api.tosspayments.com/v1/billing/authorizations/issue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
    },
    body: JSON.stringify({ authKey, customerKey }),
  })

  if (!tossRes.ok) {
    const err = await tossRes.json()
    return NextResponse.json({ error: err.message || '빌링키 발급 실패' }, { status: 400 })
  }

  const billing = await tossRes.json()

  // type 별 표시명
  const aliasMap: Record<string, string> = {
    toss: '토스페이',
    naver: '네이버페이',
    card: '신용/체크카드',
  }

  // 기존 같은 타입이 있으면 교체
  await prisma.paymentMethod.deleteMany({ where: { userId, type } })

  const method = await prisma.paymentMethod.create({
    data: {
      userId,
      type,
      alias: aliasMap[type] ?? type,
      billingKey: billing.billingKey,
      customerKey,
      isDefault: (await prisma.paymentMethod.count({ where: { userId } })) === 0,
    },
  })

  return NextResponse.json(method, { status: 201 })
}
