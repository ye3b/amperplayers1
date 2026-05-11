import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import BottomNav from '@/components/navigation/BottomNav'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  // 비로그인 → 로그인 페이지
  if (!session?.user) redirect('/login')

  const userId = (session.user as { id?: string }).id
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true },
  })

  // 온보딩 미완료 → 종목 선택
  if (!user?.onboardingCompleted) redirect('/signup/sports')

  return (
    <>
      <main className="max-w-[390px] mx-auto min-h-screen pb-[78px]">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
