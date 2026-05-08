import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const addr = await prisma.shippingAddress.findUnique({ where: { id: params.id } })
  if (!addr || addr.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()

  if (body.isDefault === true) {
    await prisma.shippingAddress.updateMany({ where: { userId }, data: { isDefault: false } })
  }

  const updated = await prisma.shippingAddress.update({
    where: { id: params.id },
    data: {
      label:         body.label         ?? addr.label,
      recipient:     body.recipient     ?? addr.recipient,
      phone:         body.phone         ?? addr.phone,
      zipCode:       body.zipCode       ?? addr.zipCode,
      address:       body.address       ?? addr.address,
      addressDetail: body.addressDetail ?? addr.addressDetail,
      isDefault:     body.isDefault     ?? addr.isDefault,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const addr = await prisma.shippingAddress.findUnique({ where: { id: params.id } })
  if (!addr || addr.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.shippingAddress.delete({ where: { id: params.id } })

  // 삭제된 항목이 기본이었으면 가장 최근 것을 기본으로 설정
  if (addr.isDefault) {
    const next = await prisma.shippingAddress.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
    if (next) await prisma.shippingAddress.update({ where: { id: next.id }, data: { isDefault: true } })
  }

  return NextResponse.json({ ok: true })
}
