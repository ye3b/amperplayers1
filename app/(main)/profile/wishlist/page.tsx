import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'

export default async function WishlistPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as { id: string }).id

  const items = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: { id: true, name: true, price: true, grade: true, images: true, likes: true, status: true, sport: true },
      },
    },
  })

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 pt-[52px] pb-[12px]">
        <Link href="/profile" className="w-[40px] h-[40px] flex items-center justify-center -ml-2">
          <Icon name="arrow-left" size={24} className="text-[#181818]" />
        </Link>
        <span className="text-[20px] font-bold text-[#181818] tracking-[-0.5px]">관심 상품</span>
      </div>

      {/* 목록 */}
      <div className="mx-[13px] flex flex-col gap-[8px] mt-[4px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Icon name="heart" size={40} className="text-[#E8E8E8] mb-3" />
            <p className="text-[13px] text-[#9E9E9E]">관심 상품이 없어요</p>
          </div>
        ) : (
          items.map(({ product }) => {
            const images: string[] = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
            const thumb = images[0] ?? null

            const GRADE_COLORS: Record<string, string> = {
              S: 'bg-[#00F5A0]', A: 'bg-[#00F5A0]', B: 'bg-[#FFD700]', C: 'bg-[#FF6B6B]',
            }
            const gradeColor = product.grade ? (GRADE_COLORS[product.grade] ?? 'bg-[#00F5A0]') : 'bg-[#00F5A0]'

            return (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="flex items-center gap-3 bg-white rounded-[12px] p-[14px] border border-[#F5F5F5]">
                  <div className="w-[70px] h-[70px] rounded-[9px] bg-[#F5F5F5] flex-shrink-0 overflow-hidden">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="bag-04" size={24} className="text-[#D9D9D9]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {product.grade && (
                      <span className={`inline-flex items-center gap-0.5 ${gradeColor} rounded px-[5px] py-[2px] text-[8px] font-bold text-[#181818] leading-none mb-[4px]`}>
                        <Icon name="stars" size={8} className="text-[#181818]" />
                        {product.grade}
                      </span>
                    )}
                    <p className="text-[12px] font-bold text-[#333333] leading-[20px] line-clamp-1 mb-[2px]">{product.name}</p>
                    <p className="text-[12px] font-bold text-[#181818] leading-[20px]">{product.price.toLocaleString()}원</p>
                    <span className="flex items-center gap-0.5 text-[10px] text-[#D9D9D9] mt-[2px]">
                      <Icon name="heart" size={12} className="text-[#D9D9D9]" />{product.likes}
                    </span>
                  </div>
                  <Icon name="right" size={14} className="text-[#C8C8C8]" />
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
