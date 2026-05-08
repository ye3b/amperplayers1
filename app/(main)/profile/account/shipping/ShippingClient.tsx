'use client'

import { useState, useEffect } from 'react'
import BackHeader from '@/components/ui/BackHeader'
import Icon from '@/components/ui/Icon'

interface Address {
  id: string
  label: string
  recipient: string
  phone: string
  zipCode: string
  address: string
  addressDetail: string | null
  isDefault: boolean
}

function formatPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

const EMPTY_FORM = { label: '', recipient: '', phone: '', zipCode: '', address: '', addressDetail: '', isDefault: false }

export default function ShippingClient() {
  const [items, setItems] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const r = await fetch('/api/shipping')
    setItems(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setShowForm(true) }
  const openEdit = (a: Address) => {
    setEditing(a)
    setForm({ label: a.label, recipient: a.recipient, phone: a.phone, zipCode: a.zipCode, address: a.address, addressDetail: a.addressDetail ?? '', isDefault: a.isDefault })
    setError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.label || !form.recipient || !form.phone || !form.zipCode || !form.address || !form.addressDetail) {
      setError('모든 필수 항목을 입력해주세요.'); return
    }
    setSaving(true)
    const url = editing ? `/api/shipping/${editing.id}` : '/api/shipping'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (!res.ok) { const d = await res.json(); setError(d.error || '저장 실패'); return }
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('배송지를 삭제할까요?')) return
    await fetch(`/api/shipping/${id}`, { method: 'DELETE' })
    load()
  }

  const setDefault = async (id: string) => {
    await fetch(`/api/shipping/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDefault: true }) })
    load()
  }

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="배송지 관리" />

      <div className="mx-[14px]">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-5 h-5 border-2 border-[#181818] border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-[13px] text-[#9E9E9E]">등록된 배송지가 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[8px] mt-[4px]">
            {items.map((a) => (
              <div key={a.id} className="border border-[#F0F0F0] rounded-[12px] p-[14px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-[6px]">
                    <span className="text-[13px] font-bold text-[#181818]">{a.label}</span>
                    {a.isDefault && (
                      <span className="px-[6px] py-[2px] bg-[#181818] rounded text-[9px] font-bold text-white leading-none">기본</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(a)} className="text-[12px] text-[#9E9E9E]">수정</button>
                    <button onClick={() => handleDelete(a.id)} className="text-[12px] text-[#FF4444]">삭제</button>
                  </div>
                </div>
                <p className="text-[13px] font-semibold text-[#181818]">{a.recipient} · {a.phone}</p>
                <p className="text-[12px] text-[#757575] mt-[2px]">({a.zipCode}) {a.address}</p>
                {a.addressDetail && <p className="text-[12px] text-[#757575]">{a.addressDetail}</p>}
                {!a.isDefault && (
                  <button onClick={() => setDefault(a.id)} className="mt-[8px] text-[11px] font-semibold text-[#00A65A]">
                    기본 배송지로 설정
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 추가 버튼 */}
      <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[390px] px-[14px] py-[12px]">
        <button
          onClick={openAdd}
          className="w-full h-[52px] rounded-[12px] bg-[#181818] text-[14px] font-bold text-[#00F5A0]"
        >
          + 배송지 추가
        </button>
      </div>

      {/* 바텀시트 폼 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-[390px] bg-white rounded-t-[20px] px-[20px] pt-[20px] pb-[90px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-[20px]">
              <h2 className="text-[16px] font-bold text-[#181818]">{editing ? '배송지 수정' : '배송지 추가'}</h2>
              <button onClick={() => setShowForm(false)}><Icon name="x-01" size={20} className="text-[#9E9E9E]" /></button>
            </div>

            <div className="flex flex-col gap-[14px]">
              <Field label="배송지명" placeholder="집, 회사, 기타" value={form.label} onChange={(v) => setForm(p => ({ ...p, label: v }))} />
              <Field label="받는 분" placeholder="이름 입력" value={form.recipient} onChange={(v) => setForm(p => ({ ...p, recipient: v }))} />
              <Field label="연락처" placeholder="010-0000-0000" value={form.phone} onChange={(v) => setForm(p => ({ ...p, phone: formatPhone(v) }))} type="tel" />
              <Field label="우편번호" placeholder="12345" value={form.zipCode} onChange={(v) => setForm(p => ({ ...p, zipCode: v }))} type="tel" />
              <Field label="주소" placeholder="도로명 주소 입력" value={form.address} onChange={(v) => setForm(p => ({ ...p, address: v }))} />
              <Field label="상세주소" placeholder="동/호수 등" value={form.addressDetail} onChange={(v) => setForm(p => ({ ...p, addressDetail: v }))} />

              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm(p => ({ ...p, isDefault: !p.isDefault }))}
                  className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-colors
                    ${form.isDefault ? 'bg-[#181818] border-[#181818]' : 'border-[#D0D0D0]'}`}
                >
                  {form.isDefault && <Icon name="check-01" size={12} className="text-white" />}
                </div>
                <span className="text-[13px] font-medium text-[#181818]">기본 배송지로 설정</span>
              </label>
            </div>

            {error && <p className="text-[12px] text-[#FF4444] mt-[12px]">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-[52px] rounded-[12px] bg-[#181818] text-[14px] font-bold text-[#00F5A0] mt-[20px] disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, placeholder, value, onChange, type = 'text', required = true }: {
  label: string; placeholder: string; value: string
  onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#9E9E9E] mb-[6px]">
        {label}{required && <span className="text-[#FF4444] ml-[2px]">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[46px] rounded-[10px] border border-[#E8E8E8] px-[14px] text-[14px] text-[#181818] placeholder:text-[#C8C8C8] outline-none focus:border-[#181818]"
      />
    </div>
  )
}
