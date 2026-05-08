import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const addresses = await prisma.shippingAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(addresses)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const { label, recipient, phone, zipCode, address, addressDetail, isDefault } = await req.json()
  if (!label || !recipient || !phone || !zipCode || !address) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })
  }

  if (isDefault) {
    await prisma.shippingAddress.updateMany({ where: { userId }, data: { isDefault: false } })
  }

  const existing = await prisma.shippingAddress.count({ where: { userId } })
  const created = await prisma.shippingAddress.create({
    data: { userId, label, recipient, phone, zipCode, address, addressDetail: addressDetail ?? null, isDefault: isDefault || existing === 0 },
  })
  return NextResponse.json(created, { status: 201 })
}
