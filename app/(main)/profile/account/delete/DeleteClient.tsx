'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import BackHeader from '@/components/ui/BackHeader'

const WARNINGS = [
  '등록한 모든 상품과 거래 내역이 삭제돼요',
  '진행 중인 거래가 있다면 취소될 수 있어요',
  '정산 예정 금액은 지급되지 않아요',
  '삭제된 계정은 복구할 수 없어요',
]

export default function DeleteClient() {
  const router = useRouter()
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (confirm !== '탈퇴하겠습니다') {
      setError("'탈퇴하겠습니다'를 정확히 입력해주세요."); return
    }
    setLoading(true)
    const res = await fetch('/api/user/delete', { method: 'DELETE' })
    if (!res.ok) {
      setError('탈퇴 처리 중 오류가 발생했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="계정 탈퇴" />

      <div className="mx-[14px]">
        {/* 경고 박스 */}
        <div className="bg-[#FFF5F5] border border-[#FFD0D0] rounded-[12px] px-[16px] py-[14px] mb-[24px]">
          <p className="text-[13px] font-bold text-[#FF4444] mb-[10px]">탈퇴 전 꼭 확인해주세요</p>
          <ul className="flex flex-col gap-[6px]">
            {WARNINGS.map((w) => (
              <li key={w} className="flex items-start gap-[6px]">
                <span className="text-[#FF4444] text-[12px] mt-[1px] flex-shrink-0">•</span>
                <span className="text-[12px] text-[#C03030] leading-[18px]">{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 확인 입력 */}
        <div className="mb-[8px]">
          <p className="text-[13px] font-semibold text-[#181818] mb-[8px]">
            계속하려면 아래에 <span className="text-[#FF4444]">탈퇴하겠습니다</span>를 입력해주세요.
          </p>
          <input
            type="text"
            placeholder="탈퇴하겠습니다"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError('') }}
            className="w-full h-[46px] rounded-[10px] border border-[#E8E8E8] px-[14px] text-[14px] text-[#181818] placeholder:text-[#C8C8C8] outline-none focus:border-[#FF4444]"
          />
        </div>

        {error && <p className="text-[12px] text-[#FF4444] mb-[12px]">{error}</p>}

        <button
          onClick={handleDelete}
          disabled={loading || confirm !== '탈퇴하겠습니다'}
          className={`w-full h-[52px] rounded-[12px] text-[14px] font-bold transition-colors mt-[8px]
            ${confirm === '탈퇴하겠습니다' && !loading
              ? 'bg-[#FF4444] text-white'
              : 'bg-[#F0F0F0] text-[#C8C8C8]'}`}
        >
          {loading ? '처리 중...' : '계정 영구 삭제'}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full h-[48px] mt-[8px] text-[14px] font-medium text-[#9E9E9E]"
        >
          취소
        </button>
      </div>
    </div>
  )
}
