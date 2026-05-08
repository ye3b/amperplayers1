import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as { id: string }).id

  const userSports = await prisma.userSport.findMany({
    where: { userId },
    select: { sport: true, level: true },
  })

  const userSportKeys = userSports.map((s) => s.sport)

  const recommendedProducts = userSportKeys.length > 0
    ? await prisma.product.findMany({
        where: {
          sport: { in: userSportKeys },
          status: 'active',
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    : []

  return <HomeClient userSports={userSports} recommendedProducts={recommendedProducts} />
}
