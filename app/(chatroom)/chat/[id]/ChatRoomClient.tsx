'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'

type SupabaseChannel = ReturnType<ReturnType<typeof createClient>['channel']>

interface User {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

interface Message {
  id: string
  content: string
  type: string
  metadata: string | null
  createdAt: Date | string
  senderId: string | null
  sender: User | null
}

interface Order {
  id: string
  status: string
  shippingMethod: string | null
  buyerNote: string | null
  trackingNumber: string | null
  trackingCarrier: string | null
  refundDeadline: Date | string | null
  paidAt: Date | string
}

interface Chat {
  id: string
  product: { id: string; name: string; price: number; images: string; status: string }
  buyer: User
  seller: User
  messages: Message[]
  buyerId: string
  sellerId: string
  order: Order | null
}

interface Props {
  chat: Chat
  currentUserId: string
}

const BROADCAST_EVENT = 'new-message'

export default function ChatRoomClient({ chat, currentUserId }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(chat.messages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<SupabaseChannel | null>(null)

  const isMockMode = chat.id === 'mock'
  const isBuyer = chat.buyerId === currentUserId
  const counterpart = isBuyer ? chat.seller : chat.buyer
  const counterpartName = counterpart.name || counterpart.username || '알 수 없음'

  const images: string[] = JSON.parse(chat.product.images)
  const thumbUrl = images[0] ?? null

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Supabase Realtime Broadcast 구독
  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return // env 미설정 시 폴링으로 폴백

    const channel = supabase.channel(`chat:${chat.id}`)
    channelRef.current = channel

    channel
      .on('broadcast', { event: BROADCAST_EVENT }, ({ payload }: { payload: Message }) => {
        // 내가 보낸 메시지는 sendMessage에서 이미 추가했으므로 무시
        if (payload.senderId === currentUserId) return
        setMessages((prev) => {
          // 중복 방지
          if (prev.some((m) => m.id === payload.id)) return prev
          return [...prev, payload]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chat.id, currentUserId])

  // Supabase 미설정 시 3초 폴링 폴백 (mock 모드 제외)
  useEffect(() => {
    const supabase = getSupabaseClient()
    if (supabase || isMockMode) return

    let lastAt: string | null =
      chat.messages.length > 0
        ? new Date(chat.messages[chat.messages.length - 1].createdAt).toISOString()
        : null

    const poll = async () => {
      const url = lastAt
        ? `/api/chat/${chat.id}/messages?after=${encodeURIComponent(lastAt)}`
        : `/api/chat/${chat.id}/messages`
      const res = await fetch(url)
      if (!res.ok) return
      const newMsgs: Message[] = await res.json()
      if (newMsgs.length > 0) {
        setMessages((prev) => [...prev, ...newMsgs])
        lastAt = new Date(newMsgs[newMsgs.length - 1].createdAt).toISOString()
      }
    }

    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [chat.id, chat.messages, isMockMode])

  const sendMessage = async () => {
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    setInput('')

    if (isMockMode) {
      // mock: DB 저장 없이 Broadcast만
      const mockMsg: Message = {
        id: `mock-${Date.now()}`,
        content,
        type: 'text',
        metadata: null,
        createdAt: new Date().toISOString(),
        senderId: currentUserId,
        sender: { id: currentUserId, name: '나', username: 'user_me', image: null },
      }
      // 로컬에 즉시 추가
      setMessages((prev) => [...prev, mockMsg])
      // 다른 클라이언트에게 broadcast (Supabase 연결된 경우)
      await channelRef.current?.send({
        type: 'broadcast',
        event: BROADCAST_EVENT,
        payload: mockMsg,
      })
      setSending(false)
      return
    }

    // 실제 채팅: API로 DB 저장 → broadcast
    const res = await fetch(`/api/chat/${chat.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (res.ok) {
      const msg: Message = await res.json()
      // 로컬에 즉시 추가
      setMessages((prev) => [...prev, msg])
      // 다른 클라이언트에게 broadcast (Supabase 연결된 경우)
      await channelRef.current?.send({
        type: 'broadcast',
        event: BROADCAST_EVENT,
        payload: msg,
      })
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#F0F0F0] flex-shrink-0">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <Icon name="arrow-left" size={22} className="text-[#181818]" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {counterpart.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={counterpart.image}
              alt={counterpartName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#E8E8E8] flex items-center justify-center flex-shrink-0">
              <Icon name="user-profile-03" size={18} className="text-[#9E9E9E]" />
            </div>
          )}
          <span className="text-[16px] font-semibold text-[#181818] truncate">{counterpartName}</span>
        </div>
      </div>

      {/* 상품 정보 바 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F0F0F0] bg-[#FAFAFA] flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#E8E8E8] overflow-hidden flex-shrink-0">
          {thumbUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbUrl} alt={chat.product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="bag-04" size={18} className="text-[#C8C8C8]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-[#9E9E9E] truncate">{chat.product.name}</p>
          <p className="text-[13px] font-bold text-[#181818]">
            {chat.product.price.toLocaleString()}원
          </p>
        </div>
        {chat.product.status === 'sold' && (
          <span className="text-[11px] font-medium text-[#9E9E9E] bg-[#F0F0F0] px-2 py-1 rounded-full flex-shrink-0">
            판매완료
          </span>
        )}
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* 상품 소개 카드 - 항상 상단에 표시 */}
        <div className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden mb-2">
          <div className="px-4 pt-4 pb-3">
            {/* 상품 썸네일 */}
            <div className="w-[72px] h-[72px] rounded-xl bg-[#E8E8E8] overflow-hidden mb-3">
              {thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbUrl} alt={chat.product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="bag-04" size={28} className="text-[#C8C8C8]" />
                </div>
              )}
            </div>
            {/* 소개 문구 */}
            <p className="text-[15px] font-bold text-[#181818] leading-[22px] mb-3">
              {counterpartName}님과 {chat.product.name}에 대한 이야기를 시작해 보세요.
            </p>
            {/* 상품 정보 */}
            <ul className="space-y-1">
              <li className="text-[13px] text-[#444444]">
                <span className="text-[#9E9E9E]">• 상품금액: </span>
                {chat.product.price.toLocaleString()}원
              </li>
            </ul>
          </div>
          {/* 상품상세 보기 버튼 */}
          <Link
            href={`/products/${chat.product.id}`}
            className="block w-full text-center py-3 text-[14px] font-medium text-[#444444] bg-[#F5F5F5] hover:bg-[#EBEBEB] transition-colors"
          >
            상품상세 보기
          </Link>
        </div>
        {messages.map((msg, i) => {
          const isSystem = msg.type !== 'text'
          const isMine = !isSystem && msg.senderId === currentUserId
          const prev = messages[i - 1]
          const showDate =
            i === 0 ||
            new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString()

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="text-[11px] text-[#9E9E9E] bg-[#F5F5F5] px-3 py-1 rounded-full">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              )}
              {isSystem ? (
                <SystemMessageCard
                  msg={msg}
                  thumbUrl={thumbUrl}
                  productName={chat.product.name}
                />
              ) : (
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-1.5 max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full bg-[#E8E8E8] overflow-hidden flex-shrink-0 flex items-center justify-center mb-0.5">
                        {counterpart.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={counterpart.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Icon name="user-profile-03" size={14} className="text-[#9E9E9E]" />
                        )}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-[14px] leading-[20px] ${
                          isMine
                            ? 'bg-[#181818] text-white rounded-br-sm'
                            : 'bg-[#F5F5F5] text-[#181818] rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-[#C8C8C8] mt-0.5 px-0.5">
                        {formatMsgTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="flex-shrink-0 border-t border-[#F0F0F0] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
            rows={1}
            className="flex-1 resize-none bg-[#F7F7F7] rounded-2xl px-4 py-3 text-[14px] text-[#181818] placeholder-[#9E9E9E] outline-none max-h-[100px] leading-[20px]"
            style={{ overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden' }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 100)}px`
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              input.trim() && !sending ? 'bg-[#181818]' : 'bg-[#E8E8E8]'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5M12 5L5 12M12 5L19 12"
                stroke={input.trim() && !sending ? 'white' : '#9E9E9E'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 시스템 메시지 카드 ─────────────────────────────────────────
function SystemMessageCard({
  msg,
  thumbUrl,
  productName,
}: {
  msg: Message
  thumbUrl: string | null
  productName: string
}) {
  const meta = msg.metadata ? JSON.parse(msg.metadata) : {}
  const orderId: string = meta.orderId ?? ''

  return (
    <div className="my-2">
      <div className="border border-[#EBEBEB] rounded-2xl overflow-hidden bg-white">
        <div className="px-4 pt-4 pb-3 space-y-3">
          {/* 상품 썸네일 */}
          <div className="w-[72px] h-[72px] rounded-xl bg-[#E8E8E8] overflow-hidden">
            {thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbUrl} alt={productName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="bag-04" size={28} className="text-[#C8C8C8]" />
              </div>
            )}
          </div>

          {/* 타입별 내용 */}
          {msg.type === 'system_payment' && (
            <PaymentCardBody meta={meta} />
          )}
          {msg.type === 'system_preparing' && (
            <PreparingCardBody />
          )}
          {msg.type === 'system_shipped' && (
            <ShippedCardBody />
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="border-t border-[#F0F0F0]">
          {msg.type === 'system_shipped' ? (
            <>
              <Link
                href={`/orders/${orderId}`}
                className="block w-full text-center py-3 text-[14px] font-medium text-[#444444] hover:bg-[#FAFAFA] transition-colors border-b border-[#F0F0F0]"
              >
                거래 정보 확인
              </Link>
              <Link
                href={`/orders/${orderId}#tracking`}
                className="block w-full text-center py-3 text-[14px] font-semibold text-[#3DBE6B] hover:bg-[#FAFAFA] transition-colors"
              >
                배송 조회
              </Link>
            </>
          ) : (
            <Link
              href={`/orders/${orderId}`}
              className="block w-full text-center py-3 text-[14px] font-semibold text-[#3DBE6B] hover:bg-[#FAFAFA] transition-colors"
            >
              거래 정보 확인
            </Link>
          )}
        </div>
      </div>
      {/* 타임스탬프 */}
      <div className="flex justify-start mt-1 px-1">
        <span className="text-[10px] text-[#C8C8C8]">{formatMsgTime(msg.createdAt)}</span>
      </div>
    </div>
  )
}

function PaymentCardBody({ meta }: { meta: Record<string, string> }) {
  const deadline = meta.refundDeadline
    ? formatDeadline(meta.refundDeadline)
    : null
  return (
    <div className="space-y-2">
      <p className="text-[15px] font-bold text-[#181818]">결제를 완료했어요.</p>
      <p className="text-[13px] text-[#444444] leading-[20px]">
        안전한 거래가 시작됐어요.<br />
        결제 금액은 상품을 받으실 때까지 결제대행사에서 안전하게 보호되며,
        판매자분이 상품 준비를 시작한 후에는 배송지 변경 혹은 거래 취소가 어렵습니다.
      </p>
      {deadline && (
        <p className="text-[13px] text-[#444444] leading-[20px]">
          ※ 만약 아래 날짜까지 판매자분이 상품 준비를 하지 않으면 자동으로 환불되니 안심하세요.<br />
          <span className="text-[#181818] font-medium">기한: {deadline}</span>
        </p>
      )}
      {(meta.shippingMethod || meta.buyerNote) && (
        <div className="text-[13px] text-[#444444] space-y-0.5 pt-1">
          {meta.shippingMethod && (
            <p>거래방법 : {meta.shippingMethod}</p>
          )}
          {meta.buyerNote && (
            <p>요청사항 : {meta.buyerNote}</p>
          )}
        </div>
      )}
    </div>
  )
}

function PreparingCardBody() {
  return (
    <div className="space-y-2">
      <p className="text-[15px] font-bold text-[#181818]">배송이 곧 시작됩니다!</p>
      <p className="text-[13px] text-[#444444] leading-[20px]">
        판매자분이 상품 준비를 시작했어요. 운송장 번호가 등록되면 알려드릴게요.
      </p>
    </div>
  )
}

function ShippedCardBody() {
  return (
    <div className="space-y-2">
      <p className="text-[15px] font-bold text-[#181818]">운송장 번호가 등록되었어요.</p>
      <p className="text-[13px] text-[#444444] leading-[20px]">
        상품의 배송이 시작되면 배송 조회가 가능해요.
      </p>
    </div>
  )
}

function formatDeadline(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = d.getHours()
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${y}/${mo}/${day} ${h}:${mi}`
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const isThisYear = d.getFullYear() === now.getFullYear()
  return isThisYear
    ? `${d.getMonth() + 1}월 ${d.getDate()}일`
    : `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

function formatMsgTime(date: Date | string): string {
  const d = new Date(date)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = h < 12 ? '오전' : '오후'
  return `${ampm} ${h % 12 || 12}:${m}`
}
