'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function TossSuccessPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const authKey    = params.get('authKey')
    const customerKey = params.get('customerKey')
    const type       = params.get('type') ?? 'toss'

    if (!authKey || !customerKey) {
      setStatus('error'); setMsg('인증 정보가 없습니다.'); return
    }

    fetch('/api/payment/toss-billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authKey, customerKey, type }),
    })
      .then(async (r) => {
        if (!r.ok) { const d = await r.json(); throw new Error(d.error) }
        setStatus('done')
        setTimeout(() => router.replace('/profile/account/payment'), 1200)
      })
      .catch((e) => { setStatus('error'); setMsg(e.message) })
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      {status === 'loading' && (
        <>
          <div className="w-8 h-8 border-2 border-[#181818] border-t-transparent rounded-full animate-spin" />
          <p className="text-[14px] text-[#9E9E9E]">결제수단 등록 중…</p>
        </>
      )}
      {status === 'done' && (
        <>
          <span className="text-[48px]">✅</span>
          <p className="text-[15px] font-bold text-[#181818]">연결 완료!</p>
        </>
      )}
      {status === 'error' && (
        <>
          <span className="text-[48px]">❌</span>
          <p className="text-[15px] font-bold text-[#181818]">연결 실패</p>
          <p className="text-[13px] text-[#9E9E9E] text-center">{msg}</p>
          <button onClick={() => router.replace('/profile/account/payment')}
            className="mt-2 px-6 h-[44px] rounded-[10px] bg-[#181818] text-[13px] font-bold text-white">
            돌아가기
          </button>
        </>
      )}
    </div>
  )
}
