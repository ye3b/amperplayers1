import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import AllProductsClient from './AllProductsClient'

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort } = await searchParams

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
  if (sort === 'price_asc')  orderBy = { price: 'asc' }
  if (sort === 'price_desc') orderBy = { price: 'desc' }
  if (sort === 'likes')      orderBy = { likes: 'desc' }

  const products = await prisma.product.findMany({
    where: { status: 'active' },
    orderBy,
    take: 60,
    select: {
      id: true, name: true, price: true, sport: true,
      grade: true, score: true, discount: true,
      location: true, images: true, likes: true, createdAt: true,
    },
  })

  return <AllProductsClient products={products} sort={sort ?? 'newest'} />
}
