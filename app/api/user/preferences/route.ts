import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type SportEntry = { sport: string; level: string }

const VALID_SPORTS = [
  'soccer','futsal','basketball','baseball','tennis','badminton',
  'volleyball','golf','swimming','cycling','running','fitness',
  'climbing','skiing','snowboard','surfing','tabletennis','boxing',
]
const VALID_LEVELS = ['beginner', 'amateur', 'pro']

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  const { sports }: { sports: SportEntry[] } = await req.json()

  if (!Array.isArray(sports) || sports.length === 0) {
    return NextResponse.json({ error: '종목을 1개 이상 선택해주세요.' }, { status: 400 })
  }

  for (const { sport, level } of sports) {
    if (!VALID_SPORTS.includes(sport) || !VALID_LEVELS.includes(level)) {
      return NextResponse.json({ error: '올바르지 않은 종목 또는 숙련도입니다.' }, { status: 400 })
    }
  }

  // 기존 선호 종목 교체 + onboardingCompleted 설정
  await prisma.$transaction([
    prisma.userSport.deleteMany({ where: { userId } }),
    prisma.userSport.createMany({
      data: sports.map(({ sport, level }) => ({ userId, sport, level })),
    }),
    prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    }),
  ])

  return NextResponse.json({ ok: true })
}

// 건너뛰기: 온보딩만 완료 처리
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true },
  })

  return NextResponse.json({ ok: true })
}
