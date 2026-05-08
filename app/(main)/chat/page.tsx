import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ChatListClient from './ChatListClient'

export default async function ChatPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as { id: string }).id

  const chats = await prisma.chat.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: {
      product: { select: { id: true, name: true, price: true, images: true } },
      buyer: { select: { id: true, name: true, username: true, image: true } },
      seller: { select: { id: true, name: true, username: true, image: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return <ChatListClient chats={chats} currentUserId={userId} />
}
