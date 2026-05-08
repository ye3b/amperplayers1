import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CheckoutClient from './CheckoutClient'

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ shipping?: string }>
}) {
  const { productId } = await params
  const { shipping } = await searchParams

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || product.status !== 'active') notFound()

  return (
    <CheckoutClient
      product={{
        id: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        grade: product.grade,
        images: product.images,
        shippingType: product.shippingType,
        shippingFee: product.shippingFee,
      }}
      shippingMethod={(shipping === 'cod' ? 'cod' : 'prepaid') as 'prepaid' | 'cod'}
    />
  )
}
