import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from './ProductDetailClient'

const MOCK_PRODUCTS = [
  {
    id: 'mock-1',
    name: '나이키 머큐리얼 축구화 270mm',
    price: 85000,
    sport: 'soccer',
    productType: 'shoes',
    grade: 'A',
    level: 'amateur',
    score: 85,
    discount: 0,
    location: '서울 강남구',
    images: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"]',
    likes: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
    description: '나이키 머큐리얼 슈퍼플라이 시리즈 축구화입니다.\n\n270mm 착용, 실외 천연잔디용 FG 스터드 타입이에요.\n구입 후 3회 정도 착용했고 상태 매우 좋습니다.\n박스 있어요.\n\n직거래 강남구 우선, 택배 가능합니다.',
    metadata: JSON.stringify({
      brand: '나이키',
      model: '머큐리얼 슈퍼플라이 9 FG',
      sizeMM: '270',
      studType: 'FG',
      widthType: '보통',
      soleWear: '약간 마모',
    }),
    userId: 'mock-user',
  },
]

const MOCK_SELLER = {
  id: 'mock-user',
  name: '김스포츠',
  username: 'kim_sports',
  image: null,
  createdAt: new Date('2024-03-15'),
  _count: { products: 8 },
  rating: 4.8,
  reviewCount: 23,
  dealCount: 31,
}

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

  // DB에 없으면 Mock에서 조회
  if (!product) {
    const mock = MOCK_PRODUCTS.find((p) => p.id === id)
    if (!mock) notFound()
    product = mock as any
    seller = MOCK_SELLER
  }

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
