import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const accounts = await prisma.bankAccount.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const { bankName, accountNumber, accountHolder, isDefault } = await req.json()
  if (!bankName || !accountNumber || !accountHolder) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })
  }

  if (isDefault) {
    await prisma.bankAccount.updateMany({ where: { userId }, data: { isDefault: false } })
  }

  const existing = await prisma.bankAccount.count({ where: { userId } })
  const created = await prisma.bankAccount.create({
    data: { userId, bankName, accountNumber, accountHolder, isDefault: isDefault || existing === 0 },
  })
  return NextResponse.json(created, { status: 201 })
}
