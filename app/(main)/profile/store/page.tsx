import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StoreClient from './StoreClient'

export default async function StorePage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as { id: string }).id

  const productSelect = {
    id: true, name: true, price: true, grade: true,
    score: true, images: true, likes: true, discount: true, location: true, createdAt: true, status: true,
  }

  const [user, activeProducts, soldProducts, hiddenProducts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        createdAt: true,
        sports: { select: { sport: true, level: true } },
      },
    }),
    prisma.product.findMany({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      select: productSelect,
    }),
    prisma.product.findMany({
      where: { userId, status: 'sold' },
      orderBy: { createdAt: 'desc' },
      select: productSelect,
    }),
    prisma.product.findMany({
      where: { userId, status: 'hidden' },
      orderBy: { createdAt: 'desc' },
      select: productSelect,
    }),
  ])
  const soldCount = soldProducts.length

  const completedOrders = await prisma.order.count({ where: { sellerId: userId, status: 'delivered' } })
  const totalOrders = await prisma.order.count({ where: { sellerId: userId } })
  const trustScore = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100

  return (
    <StoreClient
      user={user!}
      activeProducts={activeProducts}
      soldProducts={soldProducts}
      hiddenProducts={hiddenProducts}
      soldCount={soldCount}
      trustScore={trustScore}
    />
  )
}
