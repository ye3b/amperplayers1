import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex')
}

export async function POST(req: Request) {
  try {
  const { username, password, phone, verifiedToken } = await req.json()

  // ── 기본 입력 검증 ──────────────────────────────────────
  if (!username || !password || !phone || !verifiedToken) {
    return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 })
  }
  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      { error: '아이디는 영문, 숫자, 밑줄(_)만 사용 가능하며 3~20자여야 합니다.' },
      { status: 400 },
    )
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 })
  }

  // ── 전화 인증 완료 토큰 확인 ────────────────────────────
  const pvToken = await prisma.verificationToken.findFirst({
    where: { identifier: `pv:${phone}`, token: sha256(verifiedToken) },
  })
  if (!pvToken || pvToken.expires < new Date()) {
    return NextResponse.json(
      { error: '본인인증이 만료되었습니다. 다시 인증해주세요.' },
      { status: 400 },
    )
  }

  // ── 아이디 / 전화번호 중복 확인 ─────────────────────────
  const [existingUsername, existingPhone] = await Promise.all([
    prisma.user.findUnique({ where: { username } }),
    prisma.user.findUnique({ where: { phone } }),
  ])
  if (existingUsername) {
    return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 409 })
  }
  if (existingPhone) {
    return NextResponse.json({ error: '이미 가입된 휴대폰 번호입니다.' }, { status: 409 })
  }

  // ── 계정 생성 ────────────────────────────────────────────
  await prisma.verificationToken.deleteMany({ where: { identifier: `pv:${phone}` } })
  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({ data: { username, password: hashed, phone } })

  return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[signup] unexpected error:', msg)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
