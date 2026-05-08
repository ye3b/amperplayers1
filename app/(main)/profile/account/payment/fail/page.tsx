'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentFailPage() {
  const router = useRouter()
  const params = useSearchParams()
  const message = params.get('message') ?? params.get('msg') ?? '결제수단 연결에 실패했습니다.'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <span className="text-[48px]">❌</span>
      <p className="text-[15px] font-bold text-[#181818]">연결 실패</p>
      <p className="text-[13px] text-[#9E9E9E] text-center">{message}</p>
      <button
        onClick={() => router.replace('/profile/account/payment')}
        className="mt-2 px-6 h-[44px] rounded-[10px] bg-[#181818] text-[13px] font-bold text-white"
      >
        돌아가기
      </button>
    </div>
  )
}
