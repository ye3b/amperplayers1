import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'

// 메시지 전송
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const chat = await prisma.chat.findUnique({ where: { id: params.id } })
  if (!chat) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (chat.buyerId !== userId && chat.sellerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const message = await prisma.message.create({
    data: { chatId: params.id, senderId: userId, content: content.trim() },
    include: {
      sender: { select: { id: true, name: true, username: true, image: true } },
    },
  })

  // 채팅방 updatedAt 갱신
  await prisma.chat.update({ where: { id: params.id }, data: { updatedAt: new Date() } })

  // 상대방에게 푸시 알림
  const recipientId = chat.buyerId === userId ? chat.sellerId : chat.buyerId
  const senderName = message.sender?.name || message.sender?.username || '상대방'
  sendPushToUser(recipientId, 'chat', {
    title: `${senderName}님의 메시지`,
    body: content.trim().slice(0, 80),
    url: `/chat/${params.id}`,
  }).catch(() => {})

  return NextResponse.json(message)
}

// 특정 시간 이후 새 메시지 polling
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const chat = await prisma.chat.findUnique({ where: { id: params.id } })
  if (!chat) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (chat.buyerId !== userId && chat.sellerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const after = req.nextUrl.searchParams.get('after')
  const messages = await prisma.message.findMany({
    where: {
      chatId: params.id,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, name: true, username: true, image: true } },
    },
  })

  return NextResponse.json(messages)
}
