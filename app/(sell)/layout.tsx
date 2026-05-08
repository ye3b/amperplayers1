import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SellProgress from './SellProgress'

export default async function SellLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = (session.user as { id?: string }).id
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true },
  })
  if (!user?.onboardingCompleted) redirect('/onboarding/sports')

  return (
    <div className="max-w-[390px] mx-auto bg-white min-h-screen flex flex-col">
      <SellProgress />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
