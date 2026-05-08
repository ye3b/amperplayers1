import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SettlementClient from './SettlementClient'

export default async function SettlementPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as { id: string }).id

  const orders = await prisma.order.findMany({
    where: { sellerId: userId },
    orderBy: { paidAt: 'desc' },
    select: {
      id: true,
      status: true,
      paidAt: true,
      shippedAt: true,
      product: { select: { name: true, price: true } },
    },
  })

  // 정산 예상금액: 수수료 3% 차감
  const FEE_RATE = 0.03
  const settlements = orders.map((o) => ({
    id: o.id,
    productName: o.product.name,
    price: o.product.price,
    amount: Math.floor(o.product.price * (1 - FEE_RATE)),
    status: o.status,
    paidAt: o.paidAt.toISOString(),
    settledAt: o.status === 'delivered' && o.shippedAt
      ? new Date(o.shippedAt.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
      : null,
  }))

  const totalSettled = settlements.filter(s => s.status === 'delivered').reduce((s, o) => s + o.amount, 0)
  const totalPending = settlements.filter(s => !['delivered', 'cancelled'].includes(s.status)).reduce((s, o) => s + o.amount, 0)

  return <SettlementClient settlements={settlements} totalSettled={totalSettled} totalPending={totalPending} />
}
