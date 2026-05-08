import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function firstImage(images: string): string | null {
  try { const a = JSON.parse(images); return a[0] ?? null } catch { return null }
}

const ORDER_MSG: Record<string, string> = {
  paid:      '결제가 완료됐어요',
  preparing: '판매자가 배송을 준비 중이에요',
  shipped:   '상품이 배송 중이에요',
  delivered: '거래가 완료됐어요',
  cancelled: '주문이 취소됐어요',
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ notifications: [] })
  const userId = (session.user as { id: string }).id

  const [wishlists, chats, orders] = await Promise.all([
    // 내 상품에 관심 등록
    prisma.wishlist.findMany({
      where: { product: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { product: { select: { id: true, name: true, images: true } } },
    }),
    // 내 상품에 채팅 문의 (판매자)
    prisma.chat.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        product: { select: { id: true, name: true, images: true } },
        buyer: { select: { name: true, username: true } },
      },
    }),
    // 내 구매 주문 상태
    prisma.order.findMany({
      where: { buyerId: userId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: { product: { select: { id: true, name: true, images: true } } },
    }),
  ])

  const notifications = [
    ...wishlists.map((w) => ({
      id: `wish-${w.id}`,
      type: 'wishlist' as const,
      message: '내 상품이 관심 상품으로 등록됐어요',
      productName: w.product.name,
      image: firstImage(w.product.images),
      createdAt: w.createdAt,
      link: `/products/${w.product.id}`,
    })),
    ...chats.map((c) => ({
      id: `chat-${c.id}`,
      type: 'chat' as const,
      message: `${c.buyer.name ?? c.buyer.username ?? '구매자'}님이 채팅 문의를 보냈어요`,
      productName: c.product.name,
      image: firstImage(c.product.images),
      createdAt: c.createdAt,
      link: `/chat/${c.id}`,
    })),
    ...orders.map((o) => ({
      id: `order-${o.id}`,
      type: 'order' as const,
      message: ORDER_MSG[o.status] ?? '주문 상태가 변경됐어요',
      productName: o.product.name,
      image: firstImage(o.product.images),
      createdAt: o.updatedAt,
      link: `/chat/${o.chatId}`,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 30)

  return NextResponse.json({ notifications })
}
