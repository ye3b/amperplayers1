import { createHmac, randomBytes } from 'crypto'

export async function sendSMS(to: string, text: string): Promise<void> {
  const apiKey    = process.env.SOLAPI_API_KEY!
  const apiSecret = process.env.SOLAPI_API_SECRET!
  const from      = process.env.SOLAPI_FROM_NUMBER!

  if (!apiKey || !apiSecret || !from) {
    throw new Error('SMS 설정이 완료되지 않았습니다. .env의 SOLAPI_* 값을 확인해주세요.')
  }

  const date      = new Date().toISOString()
  const salt      = randomBytes(16).toString('hex')
  const signature = createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex')

  const res = await fetch('https://api.solapi.com/messages/v4/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify({
      message: { to, from, text },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.errorMessage ?? `SMS 발송 실패 (${res.status})`)
  }
}

/** 한국 휴대폰 번호 정규화 (하이픈 제거, 국가코드 처리) */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // 국내 번호: 01X로 시작 (10~11자리)
  if (/^01\d{8,9}$/.test(digits)) return digits
  // +82 국가코드 → 0 치환
  if (/^8201\d{8,9}$/.test(digits)) return '0' + digits.slice(2)
  throw new Error('올바른 휴대폰 번호 형식이 아닙니다.')
}
