import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const sport = searchParams.get('sport') ?? 'all'

  if (!q) return NextResponse.json({ products: [] })

  try {
    const words = q.split(/\s+/).filter(Boolean)
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        ...(sport !== 'all' ? { sport } : {}),
        OR: words.map((w) => ({ name: { contains: w } })),
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: {
        id: true,
        name: true,
        price: true,
        sport: true,
        grade: true,
        score: true,
        discount: true,
        location: true,
        images: true,
        likes: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ products })
  } catch (err) {
    console.error('[search/products]', err)
    return NextResponse.json({ products: [] })
  }
}
