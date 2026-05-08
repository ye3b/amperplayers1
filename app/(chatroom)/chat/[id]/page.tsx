import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import ChatRoomClient from './ChatRoomClient'

export default async function ChatRoomPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as { id: string }).id

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
      order: true,
    },
  })

  if (!chat) notFound()
  if (chat.buyerId !== userId && chat.sellerId !== userId) redirect('/chat')

  return <ChatRoomClient chat={chat} currentUserId={userId} />
}
