import { NextResponse } from 'next/server'
import { createHash, randomInt } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendSMS, normalizePhone } from '@/lib/sms'

const OTP_TTL_MS   = 3 * 60 * 1000  // 3분
const COOLDOWN_MS  = 60 * 1000       // 60초 재발송 방지

function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex')
}

/** 생년월일(YYMMDD) + 성별코드(1~4) → 유효한 날짜인지 검증 */
function validateBirth(birth: string, genderDigit: string): string | null {
  if (!/^\d{6}$/.test(birth)) return '생년월일 형식이 올바르지 않습니다.'
  if (!['1', '2', '3', '4'].includes(genderDigit)) return '주민번호 성별코드가 올바르지 않습니다.'

  const yy = parseInt(birth.slice(0, 2), 10)
  const mm = parseInt(birth.slice(2, 4), 10)
  const dd = parseInt(birth.slice(4, 6), 10)

  // 1900년대: 1(남), 2(여) / 2000년대: 3(남), 4(여)
  const fullYear = ['1', '2'].includes(genderDigit) ? 1900 + yy : 2000 + yy

  // 실제 날짜인지 확인 (자바스크립트 Date 오버플로우 방지)
  const date = new Date(fullYear, mm - 1, dd)
  if (
    date.getFullYear() !== fullYear ||
    date.getMonth()    !== mm - 1  ||
    date.getDate()     !== dd
  ) return '존재하지 않는 생년월일입니다.'

  // 미래 날짜 차단
  if (date >= new Date()) return '생년월일이 올바르지 않습니다.'

  // 만 14세 미만 차단 (정보통신망법)
  const minAgeDate = new Date()
  minAgeDate.setFullYear(minAgeDate.getFullYear() - 14)
  if (date > minAgeDate) return '만 14세 이상만 가입할 수 있습니다.'

  return null // 유효
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, birth, genderDigit, phone } = body

    // ── 입력 검증 ──────────────────────────────────────────
    if (!name?.trim() || name.trim().length < 2) {
      return NextResponse.json({ error: '이름을 올바르게 입력해주세요.' }, { status: 400 })
    }

    const birthError = validateBirth((birth ?? '').replace(/\./g, ''), genderDigit ?? '')
    if (birthError) return NextResponse.json({ error: birthError }, { status: 400 })

    let rawPhone: string
    try {
      rawPhone = normalizePhone(phone ?? '')
    } catch {
      return NextResponse.json({ error: '올바른 휴대폰 번호를 입력해주세요.' }, { status: 400 })
    }

    // ── 이미 가입된 번호인지 확인 ──────────────────────────
    const existingUser = await prisma.user.findUnique({ where: { phone: rawPhone } })
    if (existingUser) {
      return NextResponse.json({ error: '이미 가입된 휴대폰 번호입니다.' }, { status: 409 })
    }

    // ── 재발송 쿨다운 ──────────────────────────────────────
    const cooldownId = `cd:${rawPhone}`
    const cooldown = await prisma.verificationToken.findFirst({
      where: { identifier: cooldownId, expires: { gt: new Date() } },
    })
    if (cooldown) {
      const secs = Math.ceil((cooldown.expires.getTime() - Date.now()) / 1000)
      return NextResponse.json({ error: `${secs}초 후에 재발송할 수 있습니다.` }, { status: 429 })
    }

    // ── 기존 토큰 정리 + 새 OTP 발급 ──────────────────────
    const code    = String(randomInt(100000, 999999))
    const expires = new Date(Date.now() + OTP_TTL_MS)
    const cdExp   = new Date(Date.now() + COOLDOWN_MS)

    await prisma.verificationToken.deleteMany({
      where: { identifier: { in: [`otp:${rawPhone}`, cooldownId] } },
    })
    await prisma.verificationToken.createMany({
      data: [
        { identifier: `otp:${rawPhone}`, token: sha256(code), expires },
        { identifier: cooldownId,         token: sha256('cd:' + rawPhone), expires: cdExp },
      ],
    })

    // ── SMS 발송 ───────────────────────────────────────────
    try {
      await sendSMS(rawPhone, `[Players] 인증번호: ${code}\n3분 이내 입력해주세요.`)
    } catch (err) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: { in: [`otp:${rawPhone}`, cooldownId] } },
      })
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[send-sms]', msg)
      return NextResponse.json({ error: `SMS 발송 실패: ${msg}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[send-sms] unexpected error:', msg)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
