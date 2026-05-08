import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function ChatRoomLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect('/login')

  const userId = (session.user as { id?: string }).id
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true },
  })

  if (!user?.onboardingCompleted) redirect('/onboarding/sports')

  return <>{children}</>
}
