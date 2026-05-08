import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const body = await req.json()
  const {
    name,
    description,
    price,
    sport,
    productType,
    level,
    metadata,
    images,
    grade,
    score,
    allowOffer,
    shippingType,
    shippingFeeType,
    shippingFee,
    allowMeetup,
  } = body

  if (!name || !price || !sport || !images?.length) {
    return NextResponse.json({ error: '필수 항목이 누락됐습니다.' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      userId,
      name,
      description: description ?? null,
      price: Number(price),
      sport,
      productType: productType ?? null,
      level: level ?? null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      images: JSON.stringify(images),
      grade: grade ?? null,
      score: score ?? null,
      status: 'active',
      allowOffer:      allowOffer  ?? true,
      shippingType:    shippingType    ?? null,
      shippingFeeType: shippingFeeType ?? null,
      shippingFee:     shippingFee ? Number(shippingFee) : null,
      allowMeetup:     allowMeetup ?? true,
    },
  })

  return NextResponse.json(product)
}
