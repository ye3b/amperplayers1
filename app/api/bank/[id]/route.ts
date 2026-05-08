import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const acct = await prisma.bankAccount.findUnique({ where: { id: params.id } })
  if (!acct || acct.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  if (body.isDefault === true) {
    await prisma.bankAccount.updateMany({ where: { userId }, data: { isDefault: false } })
  }

  const updated = await prisma.bankAccount.update({
    where: { id: params.id },
    data: {
      bankName:      body.bankName      ?? acct.bankName,
      accountNumber: body.accountNumber ?? acct.accountNumber,
      accountHolder: body.accountHolder ?? acct.accountHolder,
      isDefault:     body.isDefault     ?? acct.isDefault,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const acct = await prisma.bankAccount.findUnique({ where: { id: params.id } })
  if (!acct || acct.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.bankAccount.delete({ where: { id: params.id } })

  if (acct.isDefault) {
    const next = await prisma.bankAccount.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
    if (next) await prisma.bankAccount.update({ where: { id: next.id }, data: { isDefault: true } })
  }

  return NextResponse.json({ ok: true })
}
