import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 아이디 규칙: 영문·숫자·밑줄, 3~20자
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username') ?? ''

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      { available: false, message: '영문, 숫자, 밑줄(_)만 사용 가능하며 3~20자여야 합니다.' },
      { status: 400 },
    )
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json({ available: false, message: '이미 사용 중인 아이디입니다.' })
  }

  return NextResponse.json({ available: true, message: '사용 가능한 아이디입니다.' })
}
