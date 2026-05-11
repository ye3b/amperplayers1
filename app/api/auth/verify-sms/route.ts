import { NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { normalizePhone } from '@/lib/sms'

function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex')
}

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp || otp.length !== 6) {
      return NextResponse.json({ error: '인증번호 6자리를 입력해주세요.' }, { status: 400 })
    }

    let rawPhone: string
    try {
      rawPhone = normalizePhone(phone)
    } catch {
      return NextResponse.json({ error: '올바른 휴대폰 번호가 아닙니다.' }, { status: 400 })
    }

    // OTP 토큰 조회
    const token = await prisma.verificationToken.findFirst({
      where: { identifier: `otp:${rawPhone}`, token: sha256(otp) },
    })

    if (!token) {
      return NextResponse.json({ error: '인증번호가 올바르지 않습니다.' }, { status: 400 })
    }
    if (token.expires < new Date()) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: { in: [`otp:${rawPhone}`, `cd:${rawPhone}`] } },
      })
      return NextResponse.json({ error: '인증번호가 만료되었습니다. 다시 발송해주세요.' }, { status: 400 })
    }

    // OTP 토큰 소모 + 완료 토큰(10분 유효) 발급
    const verifiedToken = randomBytes(32).toString('hex')
    const verifiedExp   = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.verificationToken.deleteMany({
      where: { identifier: { in: [`otp:${rawPhone}`, `pv:${rawPhone}`] } },
    })
    await prisma.verificationToken.create({
      data: { identifier: `pv:${rawPhone}`, token: sha256(verifiedToken), expires: verifiedExp },
    })

    // 클라이언트에 완료 토큰 전달 (회원가입 API에서 사용)
    return NextResponse.json({ ok: true, verifiedToken, phone: rawPhone })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[verify-sms] unexpected error:', msg)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
