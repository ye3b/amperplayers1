'use client'

import { useState, useEffect } from 'react'
import BackHeader from '@/components/ui/BackHeader'
import Icon from '@/components/ui/Icon'

const BANKS = [
  '국민은행', '신한은행', '우리은행', '하나은행', '기업은행', '농협',
  '카카오뱅크', '토스뱅크', '케이뱅크', 'SC제일은행', '수협', '부산은행',
  '경남은행', '광주은행', '전북은행', '대구은행', '제주은행', '우체국',
]

interface Account {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
  isDefault: boolean
}

const EMPTY_FORM = { bankName: '', accountNumber: '', accountHolder: '', isDefault: false }

export default function BankClient() {
  const [items, setItems] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const r = await fetch('/api/bank')
    setItems(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setError(''); setShowForm(true) }

  const handleSave = async () => {
    if (!form.bankName || !form.accountNumber || !form.accountHolder) {
      setError('모든 항목을 입력해주세요.'); return
    }
    setSaving(true)
    const res = await fetch('/api/bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (!res.ok) { const d = await res.json(); setError(d.error || '저장 실패'); return }
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('계좌를 삭제할까요?')) return
    await fetch(`/api/bank/${id}`, { method: 'DELETE' })
    load()
  }

  const setDefault = async (id: string) => {
    await fetch(`/api/bank/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDefault: true }) })
    load()
  }

  const maskAccount = (num: string) => {
    if (num.length <= 4) return num
    return num.slice(0, -4).replace(/./g, '*') + num.slice(-4)
  }

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="내 계좌 관리" />

      <div className="mx-[14px]">
        <p className="text-[12px] text-[#9E9E9E] mb-[12px]">판매 대금 정산에 사용되는 계좌예요.</p>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-5 h-5 border-2 border-[#181818] border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[13px] text-[#9E9E9E]">등록된 계좌가 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {items.map((a) => (
              <div key={a.id} className="border border-[#F0F0F0] rounded-[12px] p-[14px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#181818]">{a.bankName}</span>
                    {a.isDefault && (
                      <span className="px-[6px] py-[2px] bg-[#181818] rounded text-[9px] font-bold text-white leading-none">기본</span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(a.id)} className="text-[12px] text-[#FF4444]">삭제</button>
                </div>
                <p className="text-[14px] font-semibold text-[#181818] mt-[4px]">{maskAccount(a.accountNumber)}</p>
                <p className="text-[12px] text-[#757575]">{a.accountHolder}</p>
                {!a.isDefault && (
                  <button onClick={() => setDefault(a.id)} className="mt-[8px] text-[11px] font-semibold text-[#00A65A]">
                    기본 계좌로 설정
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 py-[12px]">
        <button onClick={openAdd} className="w-full h-[52px] rounded-[12px] bg-[#181818] text-[14px] font-bold text-[#00F5A0]">
          + 계좌 추가
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-[390px] bg-white rounded-t-[20px] px-[20px] pt-[20px] pb-[90px]">
            <div className="flex items-center justify-between mb-[20px]">
              <h2 className="text-[16px] font-bold text-[#181818]">계좌 추가</h2>
              <button onClick={() => setShowForm(false)}><Icon name="x-01" size={20} className="text-[#9E9E9E]" /></button>
            </div>

            <div className="flex flex-col gap-[14px]">
              {/* 은행 선택 */}
              <div>
                <label className="block text-[11px] font-semibold text-[#9E9E9E] mb-[6px]">은행 <span className="text-[#FF4444]">*</span></label>
                <select
                  value={form.bankName}
                  onChange={(e) => setForm(p => ({ ...p, bankName: e.target.value }))}
                  className="w-full h-[46px] rounded-[10px] border border-[#E8E8E8] px-[14px] text-[14px] text-[#181818] outline-none focus:border-[#181818] bg-white"
                >
                  <option value="">은행 선택</option>
                  {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9E9E9E] mb-[6px]">계좌번호 <span className="text-[#FF4444]">*</span></label>
                <input
                  type="tel"
                  placeholder="숫자만 입력"
                  value={form.accountNumber}
                  onChange={(e) => setForm(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') }))}
                  className="w-full h-[46px] rounded-[10px] border border-[#E8E8E8] px-[14px] text-[14px] text-[#181818] placeholder:text-[#C8C8C8] outline-none focus:border-[#181818]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9E9E9E] mb-[6px]">예금주명 <span className="text-[#FF4444]">*</span></label>
                <input
                  type="text"
                  placeholder="예금주 이름"
                  value={form.accountHolder}
                  onChange={(e) => setForm(p => ({ ...p, accountHolder: e.target.value }))}
                  className="w-full h-[46px] rounded-[10px] border border-[#E8E8E8] px-[14px] text-[14px] text-[#181818] placeholder:text-[#C8C8C8] outline-none focus:border-[#181818]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm(p => ({ ...p, isDefault: !p.isDefault }))}
                  className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-colors
                    ${form.isDefault ? 'bg-[#181818] border-[#181818]' : 'border-[#D0D0D0]'}`}
                >
                  {form.isDefault && <Icon name="check-01" size={12} className="text-white" />}
                </div>
                <span className="text-[13px] font-medium text-[#181818]">기본 계좌로 설정</span>
              </label>
            </div>

            {error && <p className="text-[12px] text-[#FF4444] mt-[12px]">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-[52px] rounded-[12px] bg-[#181818] text-[14px] font-bold text-[#00F5A0] mt-[20px] disabled:opacity-50"
            >
              {saving ? '저장 중...' : '계좌 등록'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
