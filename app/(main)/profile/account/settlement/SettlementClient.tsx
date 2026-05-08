'use client'

import BackHeader from '@/components/ui/BackHeader'

interface Settlement {
  id: string
  productName: string
  price: number
  amount: number
  status: string
  paidAt: string
  settledAt: string | null
}

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  paid:      { label: '정산 대기',  color: 'text-[#B07800] bg-[#FFF8E8]' },
  preparing: { label: '정산 대기',  color: 'text-[#B07800] bg-[#FFF8E8]' },
  shipped:   { label: '정산 예정',  color: 'text-[#2B5FD9] bg-[#E8F0FF]' },
  delivered: { label: '정산 완료',  color: 'text-[#00A65A] bg-[#E8F8F1]' },
  cancelled: { label: '정산 취소',  color: 'text-[#757575] bg-[#F0F0F0]' },
}

export default function SettlementClient({
  settlements,
  totalSettled,
  totalPending,
}: {
  settlements: Settlement[]
  totalSettled: number
  totalPending: number
}) {
  return (
    <div className="min-h-screen bg-white pb-[40px]">
      <BackHeader title="정산내역" />

      {/* 요약 카드 */}
      <div className="mx-[14px] grid grid-cols-2 gap-[8px] mb-[20px]">
        <div className="bg-[#F8F8F8] rounded-[12px] px-[14px] py-[14px]">
          <p className="text-[11px] text-[#9E9E9E] mb-[4px]">정산 완료</p>
          <p className="text-[18px] font-bold text-[#181818]">{totalSettled.toLocaleString()}<span className="text-[12px] font-medium ml-[2px]">원</span></p>
        </div>
        <div className="bg-[#F8F8F8] rounded-[12px] px-[14px] py-[14px]">
          <p className="text-[11px] text-[#9E9E9E] mb-[4px]">정산 예정</p>
          <p className="text-[18px] font-bold text-[#181818]">{totalPending.toLocaleString()}<span className="text-[12px] font-medium ml-[2px]">원</span></p>
        </div>
      </div>

      <p className="mx-[14px] text-[11px] text-[#C8C8C8] mb-[12px]">수수료 3% 차감 후 금액이에요. 배송 완료 후 3영업일 내 정산됩니다.</p>

      {/* 내역 리스트 */}
      <div className="mx-[14px] flex flex-col gap-[1px]">
        {settlements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[13px] text-[#9E9E9E]">정산 내역이 없어요</p>
          </div>
        ) : (
          settlements.map((s) => {
            const info = STATUS_INFO[s.status] ?? { label: s.status, color: 'text-[#757575] bg-[#F0F0F0]' }
            return (
              <div key={s.id} className="flex items-center justify-between py-[14px] border-b border-[#F5F5F5]">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-[13px] font-semibold text-[#181818] line-clamp-1">{s.productName}</p>
                  <p className="text-[11px] text-[#9E9E9E] mt-[2px]">
                    {new Date(s.paidAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 결제
                    {s.settledAt && ` · ${new Date(s.settledAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 정산`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-[4px] flex-shrink-0">
                  <p className="text-[14px] font-bold text-[#181818]">{s.amount.toLocaleString()}원</p>
                  <span className={`px-[6px] py-[2px] rounded text-[9px] font-bold leading-none ${info.color}`}>
                    {info.label}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
