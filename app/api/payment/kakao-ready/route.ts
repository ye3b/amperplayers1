import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// KakaoPay 결제 준비 (SID 획득용 최소 결제)
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const base = process.env.NEXTAUTH_URL!
  const cid = process.env.KAKAO_PAY_CID!
  const secretKey = process.env.KAKAO_PAY_SECRET_KEY

  if (!secretKey) {
    return NextResponse.json({ error: 'KAKAO_PAY_SECRET_KEY가 설정되지 않았습니다.' }, { status: 500 })
  }

  const res = await fetch('https://open-api.kakaopay.com/online/v1/payment/ready', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `SECRET_KEY ${secretKey}`,
    },
    body: JSON.stringify({
      cid,
      partner_order_id: `register_${userId}_${Date.now()}`,
      partner_user_id: userId,
      item_name: '카카오페이 간편결제 등록',
      quantity: 1,
      total_amount: 0,
      tax_free_amount: 0,
      approval_url: `${base}/profile/account/payment/kakao-success`,
      cancel_url:   `${base}/profile/account/payment`,
      fail_url:     `${base}/profile/account/payment/fail`,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.msg || '카카오페이 연결 준비 실패' }, { status: 400 })
  }

  const data = await res.json()
  return NextResponse.json({ tid: data.tid, redirectUrl: data.next_redirect_pc_url, mobileUrl: data.next_redirect_mobile_url })
}
