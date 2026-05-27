import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 페이앱 결제 완료 여부 폴링 (성공 페이지에서 사용)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const buyerId = (session.user as { id: string }).id

  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'productId 필요' }, { status: 400 })

  const chat = await prisma.chat.findUnique({
    where: { productId_buyerId: { productId, buyerId } },
  })

  if (!chat) return NextResponse.json({ pending: true })

  const order = await prisma.order.findUnique({ where: { chatId: chat.id } })
  if (!order) return NextResponse.json({ pending: true })

  return NextResponse.json({ chatId: chat.id })
}
