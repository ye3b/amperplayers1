import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

// UT 전용 회원가입 — SMS 인증 없이 username+password만으로 계정 생성
export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
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

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { username, password: hashed } })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[signup-ut] error:', msg)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
