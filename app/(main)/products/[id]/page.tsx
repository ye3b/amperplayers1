import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from './ProductDetailClient'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string })?.id

  // DB에서 먼저 조회
  let product = null
  let seller = null
  let initialLiked = false
  let initialInCart = false

  try {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            createdAt: true,
            _count: { select: { products: true } },
          },
        },
      },
    })
    if (product) seller = (product as any).user

    if (userId && product) {
      const [wishlist, cart] = await Promise.all([
        prisma.wishlist.findUnique({ where: { userId_productId: { userId, productId: id } } }),
        prisma.cartItem.findUnique({ where: { userId_productId: { userId, productId: id } } }),
      ])
      initialLiked = !!wishlist
      initialInCart = !!cart
    }
  } catch {}

  if (!product) notFound()

  // 추가 상품 조회 (DB 상품일 때만)
  const productId = (product as any).id
  const sport = (product as any).sport
  const productType = (product as any).productType
  const sellerId = seller?.id

  const [similarProducts, popularProducts, sellerProducts] = product && sellerId !== 'mock-user'
    ? await Promise.all([
        // 비슷한 상품 (같은 종목 + 용품 종류)
        prisma.product.findMany({
          where: { id: { not: productId }, sport, productType: productType ?? undefined, status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: { id: true, name: true, price: true, grade: true, score: true, images: true, likes: true, discount: true },
        }),
        // 해당 종목 인기 상품
        prisma.product.findMany({
          where: { id: { not: productId }, sport, status: 'active' },
          orderBy: { likes: 'desc' },
          take: 6,
          select: { id: true, name: true, price: true, grade: true, score: true, images: true, likes: true, discount: true },
        }),
        // 해당 상점의 다른 상품
        prisma.product.findMany({
          where: { id: { not: productId }, userId: sellerId, status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: { id: true, name: true, price: true, grade: true, score: true, images: true, likes: true, discount: true },
        }),
      ])
    : [[], [], []]

  return (
    <ProductDetailClient
      product={product}
      seller={seller}
      initialLiked={initialLiked}
      initialInCart={initialInCart}
      similarProducts={similarProducts}
      popularProducts={popularProducts}
      sellerProducts={sellerProducts}
    />
  )
}
