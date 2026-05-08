'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import BackHeader from '@/components/ui/BackHeader'

interface PaymentMethod {
  id: string
  type: string
  alias: string
  billingKey: string | null
  isDefault: boolean
}

const KakaoPayLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#FEE500"/>
    <text x="20" y="16" textAnchor="middle" fill="#191919" fontSize="7.5" fontWeight="700" fontFamily="Arial, sans-serif">kakao</text>
    <text x="20" y="26" textAnchor="middle" fill="#191919" fontSize="7.5" fontWeight="700" fontFamily="Arial, sans-serif">pay</text>
  </svg>
)

const CardLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#0064FF"/>
    <rect x="8" y="13" width="24" height="16" rx="3" fill="none" stroke="white" strokeWidth="1.5"/>
    <rect x="8" y="19" width="24" height="3" fill="white"/>
    <rect x="11" y="24" width="6" height="2" rx="1" fill="white"/>
  </svg>
)

const PROVIDERS = [
  {
    id: 'kakao',
    label: '카카오페이',
    logo: <KakaoPayLogo />,
    desc: '카카오페이 계정으로 간편하게 결제해요',
  },
  {
    id: 'card',
    label: '신용/체크카드',
    logo: <CardLogo />,
    desc: '카드를 등록해 자동결제로 사용해요',
  },
]

export default function PaymentClient() {
  const { data: session } = useSession()
  const [items, setItems] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  const load = async () => {
    const r = await fetch('/api/payment')
    setItems(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // 카드 빌링: Toss Payments card billing auth
  const connectCard = async () => {
    setConnecting('card')
    try {
      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk')
      const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)
      const payment = toss.payment({
        customerKey: (session?.user as { id?: string })?.id ?? 'guest',
      })

      const base = window.location.origin
      await payment.requestBillingAuth({
        method: 'CARD',
        successUrl: `${base}/profile/account/payment/toss-success?type=card`,
        failUrl:    `${base}/profile/account/payment/fail`,
        customerName: (session?.user as { name?: string })?.name ?? undefined,
      })
      // 리다이렉트 방식이므로 이 아래 코드는 실행 안 됨
    } catch {
      setConnecting(null)
    }
  }

  // 카카오페이: KakaoPay Ready API → 리다이렉트
  const connectKakao = async () => {
    setConnecting('kakao')
    try {
      const res = await fetch('/api/payment/kakao-ready', { method: 'POST' })
      if (!res.ok) {
        const d = await res.json()
        alert(d.error || '카카오페이 연결 준비에 실패했습니다.')
        setConnecting(null)
        return
      }
      const { tid, mobileUrl, redirectUrl } = await res.json()
      sessionStorage.setItem('kakao_pay_tid', tid)
      const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
      window.location.href = isMobile ? mobileUrl : redirectUrl
    } catch {
      setConnecting(null)
    }
  }

  const handleConnect = (type: string) => {
    if (type === 'kakao') connectKakao()
    else if (type === 'card') connectCard()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('결제수단을 해제할까요?')) return
    await fetch(`/api/payment/${id}`, { method: 'DELETE' })
    load()
  }

  const setDefault = async (id: string) => {
    await fetch(`/api/payment/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    load()
  }

  const connectedMap = Object.fromEntries(items.map(m => [m.type, m]))

  return (
    <div className="min-h-screen bg-white pb-[40px]">
      <BackHeader title="간편결제 관리" />

      <div className="mx-[14px]">
        <p className="text-[12px] text-[#9E9E9E] mb-[16px]">상품 구매 시 사용할 결제수단을 연결해요.</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-[#181818] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {PROVIDERS.map((p) => {
              const method = connectedMap[p.id]
              const connected = !!method
              const isConnecting = connecting === p.id

              return (
                <div
                  key={p.id}
                  className={`border rounded-[14px] p-[16px] transition-colors ${connected ? 'border-[#181818]' : 'border-[#F0F0F0]'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-[40px] h-[40px] flex items-center justify-center">{p.logo}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-bold text-[#181818]">{p.label}</span>
                        {connected && (
                          <span className="px-[6px] py-[2px] bg-[#181818] rounded text-[9px] font-bold text-white leading-none">연결됨</span>
                        )}
                        {method?.isDefault && (
                          <span className="px-[6px] py-[2px] bg-[#00F5A0] rounded text-[9px] font-bold text-[#181818] leading-none">기본</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9E9E9E] mt-[2px]">{p.desc}</p>
                    </div>
                  </div>

                  <div className="flex gap-[6px] mt-[12px]">
                    {!connected ? (
                      <button
                        onClick={() => handleConnect(p.id)}
                        disabled={!!connecting}
                        className="flex-1 h-[38px] rounded-[8px] bg-[#181818] text-[12px] font-bold text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {isConnecting ? (
                          <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />연결 중…</>
                        ) : '연결하기'}
                      </button>
                    ) : (
                      <>
                        {!method.isDefault && (
                          <button
                            onClick={() => setDefault(method.id)}
                            className="flex-1 h-[38px] rounded-[8px] border border-[#E0E0E0] text-[12px] font-semibold text-[#181818]"
                          >
                            기본으로 설정
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(method.id)}
                          className="flex-1 h-[38px] rounded-[8px] border border-[#FFD0D0] text-[12px] font-semibold text-[#FF4444]"
                        >
                          연결 해제
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
