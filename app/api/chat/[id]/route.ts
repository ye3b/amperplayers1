import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 채팅방 상세 (메시지 포함)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const chat = await prisma.chat.findUnique({
    where: { id: params.id },
    include: {
      product: { select: { id: true, name: true, price: true, images: true, status: true } },
      buyer: { select: { id: true, name: true, username: true, image: true } },
      seller: { select: { id: true, name: true, username: true, image: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, username: true, image: true } },
        },
      },
    },
  })

  if (!chat) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (chat.buyerId !== userId && chat.sellerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(chat)
}
