'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  discount: number | null
  grade: string | null
  images: string
  shippingType: string | null
  shippingFee: number | null
}

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

interface PaymentMethod {
  id: string
  type: string
  alias: string
  isDefault: boolean
}

const GRADE_COLOR: Record<string, { color: string; bg: string }> = {
  S: { color: '#6D28D9', bg: '#EDE9FE' },
  A: { color: '#1D4ED8', bg: '#DBEAFE' },
  B: { color: '#047857', bg: '#D1FAE5' },
  C: { color: '#B45309', bg: '#FEF3C7' },
  F: { color: '#991B1B', bg: '#FEE2E2' },
}

const METHOD_ICON: Record<string, string> = {
  kakao: '💛',
  toss: '💙',
  naver: '💚',
  payapp: '💳',
}

const PAYAPP_OPTION: PaymentMethod = {
  id: 'payapp',
  type: 'payapp',
  alias: '신용/체크카드 (페이앱)',
  isDefault: false,
}

function formatPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

const EMPTY_FORM = {
  label: '',
  recipient: '',
  phone: '',
  zipCode: '',
  address: '',
  addressDetail: '',
  isDefault: false,
}

export default function CheckoutClient({
  product,
  shippingMethod,
}: {
  product: Product
  shippingMethod: 'prepaid' | 'cod'
}) {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  // 배송지 추가 폼
  const [showAddrForm, setShowAddrForm] = useState(false)
  const [addrForm, setAddrForm] = useState(EMPTY_FORM)
  const [addrSaving, setAddrSaving] = useState(false)
  const [addrError, setAddrError] = useState('')

  useEffect(() => {
    Promise.all([fetch('/api/shipping'), fetch('/api/payment')]).then(async ([r1, r2]) => {
      const addrs: Address[] = await r1.json()
      const methods: PaymentMethod[] = await r2.json()
      setAddresses(addrs)
      // 페이앱 카드 결제 옵션을 항상 마지막에 추가
      setPaymentMethods([...methods, PAYAPP_OPTION])
      const defAddr = addrs.find((a) => a.isDefault) ?? addrs[0]
      const defMethod = methods.find((m) => m.isDefault) ?? methods[0]
      if (defAddr) setSelectedAddressId(defAddr.id)
      if (defMethod) setSelectedPaymentId(defMethod.id)
      setLoadingData(false)
    })
  }, [])

  const discountedPrice =
    product.discount && product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price

  const shippingFee =
    shippingMethod === 'prepaid' && product.shippingType === 'separate'
      ? (product.shippingFee ?? 0)
      : 0

  const totalAmount = discountedPrice + shippingFee

  const images: string[] = (() => {
    try { return JSON.parse(product.images) } catch { return [] }
  })()
  const thumbnail = images[0] ?? null

  const gradeStyle = product.grade ? (GRADE_COLOR[product.grade] ?? { color: '#555', bg: '#F3F3F3' }) : null

  const handleAddAddr = async () => {
    if (!addrForm.label || !addrForm.recipient || !addrForm.phone || !addrForm.zipCode || !addrForm.address) {
      setAddrError('모든 필수 항목을 입력해주세요.'); return
    }
    setAddrSaving(true)
    const res = await fetch('/api/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addrForm),
    })
    setAddrSaving(false)
    if (!res.ok) { const d = await res.json(); setAddrError(d.error || '저장 실패'); return }
    const created: Address = await res.json()
    setAddresses((prev) => [...prev, created])
    setSelectedAddressId(created.id)
    setShowAddrForm(false)
    setAddrForm(EMPTY_FORM)
    setAddrError('')
  }

  const handlePay = async () => {
    if (!selectedAddressId) { setError('배송지를 선택해주세요.'); return }
    if (!selectedPaymentId) { setError('결제수단을 선택해주세요.'); return }
    setError('')
    setPaying(true)

    // 페이앱 신용/체크카드 결제 (리다이렉트 방식)
    if (selectedPaymentId === 'payapp') {
      try {
        const res = await fetch('/api/payment/payapp-ready', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            shippingMethod,
            shippingAddressId: selectedAddressId,
          }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || '페이앱 결제 준비에 실패했어요.'); setPaying(false); return }
        window.location.href = data.payurl
      } catch {
        setError('페이앱 결제 중 오류가 발생했어요.')
        setPaying(false)
      }
      return
    }

    // 기존 빌링키 결제 (카카오페이, 토스 등)
    try {
      const res = await fetch('/api/payment/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          shippingMethod,
          shippingAddressId: selectedAddressId,
          paymentMethodId: selectedPaymentId,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '결제에 실패했어요.'); setPaying(false); return }
      router.replace(`/chat/${data.chatId}`)
    } catch {
      setError('결제 중 오류가 발생했어요.')
      setPaying(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="w-full max-w-[390px] mx-auto bg-white flex flex-col min-h-screen">
        <div className="sticky top-0 z-10 bg-white flex items-center gap-2 px-3 py-3 border-b border-[#F0F0F0]">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center -ml-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="#181818" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="text-[16px] font-bold text-neutral-900 tracking-[-0.3px]">주문/결제</span>
        </div>

        <div className="pb-[88px]">

        {/* 상품 정보 */}
        <section className="px-4 py-4 border-b border-neutral-100">
          <p className="text-[12px] font-bold text-neutral-400 mb-3">상품 정보</p>
          <div className="flex gap-3 items-start">
            {thumbnail ? (
              <img src={thumbnail} alt={product.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-neutral-100 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {gradeStyle && product.grade && (
                  <span
                    className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                    style={{ color: gradeStyle.color, background: gradeStyle.bg }}
                  >
                    {product.grade}급
                  </span>
                )}
                <p className="text-[13px] font-semibold text-neutral-900 truncate">{product.name}</p>
              </div>
              <div className="flex items-baseline gap-1.5">
                {product.discount && product.discount > 0 && (
                  <span className="text-[12px] text-error font-bold">{product.discount}%</span>
                )}
                <span className="text-[15px] font-bold text-neutral-900">
                  {discountedPrice.toLocaleString()}원
                </span>
                {product.discount && product.discount > 0 && (
                  <span className="text-[11px] text-[#BDBDBD] line-through">{product.price.toLocaleString()}원</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 배송지 */}
        <section className="px-4 py-4 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-bold text-neutral-400">배송지</p>
            <button
              onClick={() => { setShowAddrForm(true); setAddrForm(EMPTY_FORM); setAddrError('') }}
              className="text-[12px] font-semibold text-neutral-900"
            >
              + 추가
            </button>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-4">
              <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : addresses.length === 0 ? (
            <p className="text-[13px] text-neutral-400 text-center py-3">등록된 배송지가 없어요</p>
          ) : (
            <div className="flex flex-col gap-2">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAddressId(a.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                    selectedAddressId === a.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-100'
                  }`}
                >
                  <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedAddressId === a.id ? 'border-neutral-900' : 'border-[#BDBDBD]'
                  }`}>
                    {selectedAddressId === a.id && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[13px] font-bold text-neutral-900">{a.label}</span>
                      {a.isDefault && (
                        <span className="px-1.5 py-0.5 bg-neutral-900 rounded text-[9px] font-bold text-white leading-none">기본</span>
                      )}
                    </div>
                    <p className="text-[12px] font-semibold text-neutral-900">{a.recipient} · {a.phone}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      ({a.zipCode}) {a.address}
                      {a.addressDetail && ` ${a.addressDetail}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 거래 방법 */}
        <section className="px-4 py-4 border-b border-neutral-100">
          <p className="text-[12px] font-bold text-neutral-400 mb-3">거래 방법</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-[#F3F3F3] text-[12px] font-bold text-neutral-900">
              {shippingMethod === 'prepaid' ? '선불' : '착불'}
            </span>
            <span className="text-[12px] text-neutral-400">
              {shippingMethod === 'prepaid' ? '구매자가 배송비를 부담해요' : '판매자가 배송비를 부담해요'}
            </span>
          </div>
        </section>

        {/* 결제수단 */}
        <section className="px-4 py-4 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-bold text-neutral-400">결제수단</p>
            <button
              onClick={() => router.push('/profile/account/payment')}
              className="text-[12px] font-semibold text-neutral-900"
            >
              관리 →
            </button>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-4">
              <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-[13px] text-neutral-400 mb-2">등록된 결제수단이 없어요</p>
              <button
                onClick={() => router.push('/profile/account/payment')}
                className="text-[13px] font-bold text-neutral-900 underline"
              >
                결제수단 추가하기
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedPaymentId(m.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                    selectedPaymentId === m.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedPaymentId === m.id ? 'border-neutral-900' : 'border-[#BDBDBD]'
                  }`}>
                    {selectedPaymentId === m.id && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
                  </div>
                  <span className="text-[16px]">{METHOD_ICON[m.type] ?? '💳'}</span>
                  <div className="flex-1">
                    <span className="text-[13px] font-semibold text-neutral-900">{m.alias}</span>
                    {m.isDefault && (
                      <span className="ml-2 px-1.5 py-0.5 bg-neutral-900 rounded text-[9px] font-bold text-white leading-none">기본</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 결제금액 */}
        <section className="px-4 py-4 border-b border-neutral-100">
          <p className="text-[12px] font-bold text-neutral-400 mb-3">결제금액</p>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-neutral-500">상품 금액</span>
              <span className="text-[13px] text-neutral-900">{discountedPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-neutral-500">배송비</span>
              <span className="text-[13px] text-neutral-900">
                {shippingMethod === 'cod'
                  ? '착불'
                  : product.shippingType === 'included'
                  ? '무료'
                  : shippingFee === 0
                  ? '무료'
                  : `${shippingFee.toLocaleString()}원`}
              </span>
            </div>
            <div className="h-px bg-neutral-100" />
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-bold text-neutral-900">총 결제금액</span>
              <span className="text-[16px] font-bold text-neutral-900">{totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </section>

        </div>

        {/* 결제하기 버튼 */}
        {/* 결제하기 버튼 - 화면 하단 고정 */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#F0F0F0] flex justify-center">
          <div className="w-full max-w-[390px] px-4 pt-3 pb-8">
            {error && <p className="text-[12px] text-[#FF4444] text-center mb-2">{error}</p>}
            <button
              onClick={handlePay}
              disabled={paying || loadingData}
              className="w-full h-[52px] bg-[#181818] text-white rounded-2xl text-[15px] font-bold disabled:opacity-40 transition-opacity"
            >
              {paying ? '결제 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
            </button>
          </div>
        </div>
      </div>

      {/* 배송지 추가 바텀시트 */}
      {showAddrForm && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddrForm(false)} />
          <div className="relative w-full max-w-[390px] bg-white rounded-t-[20px] px-5 pt-5 pb-10 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-neutral-900">배송지 추가</h2>
              <button
                onClick={() => setShowAddrForm(false)}
                className="text-[20px] text-neutral-400 leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              <AddrField label="배송지명" placeholder="집, 회사, 기타" value={addrForm.label} onChange={(v) => setAddrForm(p => ({ ...p, label: v }))} />
              <AddrField label="받는 분" placeholder="이름 입력" value={addrForm.recipient} onChange={(v) => setAddrForm(p => ({ ...p, recipient: v }))} />
              <AddrField label="연락처" placeholder="010-0000-0000" value={addrForm.phone} onChange={(v) => setAddrForm(p => ({ ...p, phone: formatPhone(v) }))} type="tel" />
              <AddrField label="우편번호" placeholder="12345" value={addrForm.zipCode} onChange={(v) => setAddrForm(p => ({ ...p, zipCode: v }))} type="tel" />
              <AddrField label="주소" placeholder="도로명 주소 입력" value={addrForm.address} onChange={(v) => setAddrForm(p => ({ ...p, address: v }))} />
              <AddrField label="상세주소" placeholder="동/호수 등" value={addrForm.addressDetail} onChange={(v) => setAddrForm(p => ({ ...p, addressDetail: v }))} required={false} />

              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setAddrForm(p => ({ ...p, isDefault: !p.isDefault }))}
                  className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-colors
                    ${addrForm.isDefault ? 'bg-neutral-900 border-neutral-900' : 'border-[#D0D0D0]'}`}
                >
                  {addrForm.isDefault && <span className="text-white text-[10px] font-bold">✓</span>}
                </div>
                <span className="text-[13px] font-medium text-neutral-900">기본 배송지로 설정</span>
              </label>
            </div>

            {addrError && <p className="text-[12px] text-error mt-3">{addrError}</p>}

            <button
              onClick={handleAddAddr}
              disabled={addrSaving}
              className="w-full h-[52px] rounded-xl bg-neutral-900 text-[14px] font-bold text-white mt-5 disabled:opacity-50"
            >
              {addrSaving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AddrField({
  label, placeholder, value, onChange, type = 'text', required = true,
}: {
  label: string; placeholder: string; value: string
  onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[46px] rounded-[10px] border border-neutral-200 px-3.5 text-[14px] text-neutral-900 placeholder:text-neutral-300 outline-none focus:border-neutral-900"
      />
    </div>
  )
}
