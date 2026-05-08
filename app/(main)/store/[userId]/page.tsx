import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PublicStoreClient from './PublicStoreClient'

export default async function PublicStorePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params

  const [user, activeProducts, soldCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, username: true, image: true, createdAt: true,
        sports: { select: { sport: true, level: true } },
      },
    }),
    prisma.product.findMany({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, price: true, grade: true,
        score: true, images: true, likes: true, discount: true, location: true, createdAt: true,
      },
    }),
    prisma.product.count({ where: { userId, status: 'sold' } }),
  ])

  if (!user) notFound()

  const completedOrders = await prisma.order.count({ where: { sellerId: userId, status: 'delivered' } })
  const totalOrders = await prisma.order.count({ where: { sellerId: userId } })
  const trustScore = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100

  return (
    <PublicStoreClient
      user={user}
      activeProducts={activeProducts}
      soldCount={soldCount}
      trustScore={trustScore}
    />
  )
}
