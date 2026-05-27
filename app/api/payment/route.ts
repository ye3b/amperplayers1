import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const methods = await prisma.paymentMethod.findMany({
    where: { userId, NOT: { type: 'payapp_pending' } },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(methods)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const { type, alias, isDefault } = await req.json()
  if (!type || !alias) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })
  }

  if (isDefault) {
    await prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } })
  }

  const existing = await prisma.paymentMethod.count({ where: { userId } })
  const created = await prisma.paymentMethod.create({
    data: { userId, type, alias, isDefault: isDefault || existing === 0 },
  })
  return NextResponse.json(created, { status: 201 })
}
