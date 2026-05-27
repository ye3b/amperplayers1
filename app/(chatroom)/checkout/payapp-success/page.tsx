'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PayappSuccessPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const productId = params.get('productId')
    if (!productId) {
      setStatus('error')
      setErrorMsg('결제 정보를 확인할 수 없어요.')
      return
    }

    let attempts = 0
    const maxAttempts = 10

    const poll = async () => {
      try {
        const res = await fetch(`/api/payment/payapp-status?productId=${productId}`)
        const data = await res.json()

        if (data.chatId) {
          setStatus('done')
          setTimeout(() => router.replace(`/chat/${data.chatId}`), 800)
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000)
        } else {
          // 타임아웃 - 채팅 목록으로 이동
          setStatus('done')
          setTimeout(() => router.replace('/'), 1500)
        }
      } catch {
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000)
        } else {
          setStatus('error')
          setErrorMsg('결제 확인 중 오류가 발생했어요.')
        }
      }
    }

    poll()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      {status === 'loading' && (
        <>
          <div className="w-8 h-8 border-2 border-[#181818] border-t-transparent rounded-full animate-spin" />
          <p className="text-[14px] text-[#9E9E9E]">결제 확인 중…</p>
        </>
      )}
      {status === 'done' && (
        <>
          <span className="text-[48px]">✅</span>
          <p className="text-[15px] font-bold text-[#181818]">결제 완료!</p>
          <p className="text-[13px] text-[#9E9E9E]">채팅방으로 이동할게요.</p>
        </>
      )}
      {status === 'error' && (
        <>
          <span className="text-[48px]">❌</span>
          <p className="text-[15px] font-bold text-[#181818]">결제 확인 실패</p>
          <p className="text-[13px] text-[#9E9E9E] text-center">{errorMsg}</p>
          <button
            onClick={() => router.replace('/')}
            className="mt-2 px-6 h-[44px] rounded-[10px] bg-[#181818] text-[13px] font-bold text-white"
          >
            홈으로 돌아가기
          </button>
        </>
      )}
    </div>
  )
}
