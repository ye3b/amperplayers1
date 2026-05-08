import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as { id: string }).id

  const [user, activeProducts, soldProducts, hiddenProducts, totalLikes, purchaseOrders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        sports: { select: { sport: true, level: true } },
      },
    }),
    prisma.product.findMany({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, price: true, grade: true, score: true, images: true, likes: true, status: true, sport: true },
    }),
    prisma.product.findMany({
      where: { userId, status: 'sold' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, price: true, grade: true, score: true, images: true, likes: true, status: true, sport: true },
    }),
    prisma.product.findMany({
      where: { userId, status: 'hidden' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, price: true, grade: true, score: true, images: true, likes: true, status: true, sport: true },
    }),
    prisma.product.aggregate({
      where: { userId },
      _sum: { likes: true },
    }),
    prisma.order.findMany({
      where: { buyerId: userId },
      orderBy: { paidAt: 'desc' },
      select: {
        id: true,
        status: true,
        paidAt: true,
        chatId: true,
        product: {
          select: { id: true, name: true, price: true, images: true, grade: true, sport: true },
        },
      },
    }),
  ])

  const completedOrders = await prisma.order.count({ where: { sellerId: userId, status: 'delivered' } })
  const totalOrders = await prisma.order.count({ where: { sellerId: userId } })
  const trustScore = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100

  return (
    <ProfileClient
      user={user!}
      activeProducts={activeProducts}
      soldProducts={soldProducts}
      hiddenProducts={hiddenProducts}
      totalLikes={totalLikes._sum.likes ?? 0}
      trustScore={trustScore}
      purchaseOrders={purchaseOrders}
    />
  )
}
