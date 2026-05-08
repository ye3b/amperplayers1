import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const method = await prisma.paymentMethod.findUnique({ where: { id: params.id } })
  if (!method || method.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  if (body.isDefault === true) {
    await prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } })
  }

  const updated = await prisma.paymentMethod.update({
    where: { id: params.id },
    data: {
      alias:     body.alias     ?? method.alias,
      isDefault: body.isDefault ?? method.isDefault,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const method = await prisma.paymentMethod.findUnique({ where: { id: params.id } })
  if (!method || method.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.paymentMethod.delete({ where: { id: params.id } })

  if (method.isDefault) {
    const next = await prisma.paymentMethod.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
    if (next) await prisma.paymentMethod.update({ where: { id: next.id }, data: { isDefault: true } })
  }

  return NextResponse.json({ ok: true })
}
