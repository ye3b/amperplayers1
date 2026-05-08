import { NextResponse } from 'next/server'
import { createHash, randomInt } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

const CODE_TTL_MINUTES = 3
// 같은 이메일로 60초 이내 재발송 방지
const RESEND_COOLDOWN_SECONDS = 60

function hashCode(code: string) {
  return createHash('sha256').update(code).digest('hex')
}

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '유효한 이메일을 입력해주세요.' }, { status: 400 })
  }

  // 이미 가입된 이메일인지 확인
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 })
  }

  // 재발송 쿨다운 확인
  const recentToken = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token: 'cooldown' } },
  })
  if (recentToken && recentToken.expires > new Date()) {
    const secondsLeft = Math.ceil((recentToken.expires.getTime() - Date.now()) / 1000)
    return NextResponse.json(
      { error: `${secondsLeft}초 후에 다시 시도해주세요.` },
      { status: 429 },
    )
  }

  // 기존 토큰 모두 삭제 후 새로 발급
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })

  const code = String(randomInt(100000, 999999))
  const expires = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)
  const cooldownExpires = new Date(Date.now() + RESEND_COOLDOWN_SECONDS * 1000)

  await prisma.verificationToken.createMany({
    data: [
      { identifier: email, token: hashCode(code), expires },
      { identifier: email, token: 'cooldown', expires: cooldownExpires },
    ],
  })

  await sendVerificationEmail(email, code)

  return NextResponse.json({ ok: true })
}
