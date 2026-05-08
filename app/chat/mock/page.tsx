'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ChatRoomClient from '@/app/(chatroom)/chat/[id]/ChatRoomClient'

const USERS = {
  me: { id: 'me', name: '나 (구매자)', username: 'buyer_me', image: null },
  other: { id: 'other', name: '김민준 (판매자)', username: 'minjun_k', image: null },
}

const now = new Date()
const t = (offsetMin: number) => new Date(now.getTime() - offsetMin * 60 * 1000).toISOString()

function buildMockChat(currentUserId: string) {
  const ME = USERS.me
  const OTHER = USERS.other

  return {
    id: 'mock',
    buyerId: 'me',
    sellerId: 'other',
    product: {
      id: 'p1',
      name: 'Wilson Pro Staff 97 테니스 라켓',
      price: 180000,
      images: '[]',
      status: 'active',
    },
    buyer: ME,
    seller: OTHER,
    messages: [
      { id: '1', type: 'text', metadata: null, content: '안녕하세요! 라켓 아직 판매 중인가요?', createdAt: t(62), senderId: 'me', sender: ME },
      { id: '2', type: 'text', metadata: null, content: '네, 판매 중이에요 😊', createdAt: t(60), senderId: 'other', sender: OTHER },
      { id: '3', type: 'text', metadata: null, content: '상태가 어느 정도인지 여쭤봐도 될까요?', createdAt: t(59), senderId: 'me', sender: ME },
      {
        id: '4',
        type: 'text',
        metadata: null,
        content: '구매한 지 6개월 됐고, 주 1회 정도 사용했어요. 그립감도 아직 좋고 프레임 상태 깨끗합니다.',
        createdAt: t(57),
        senderId: 'other',
        sender: OTHER,
      },
      { id: '5', type: 'text', metadata: null, content: '혹시 직거래 가능하신가요? 강남 쪽에 계신가요?', createdAt: t(50), senderId: 'me', sender: ME },
      { id: '6', type: 'text', metadata: null, content: '저는 성수동인데, 주말에 강남 나올 수 있어요!', createdAt: t(48), senderId: 'other', sender: OTHER },
      { id: '7', type: 'text', metadata: null, content: '가격 조금 더 조정 가능할까요? 15만원에 어떠세요?', createdAt: t(30), senderId: 'me', sender: ME },
      {
        id: '8',
        type: 'text',
        metadata: null,
        content: '음… 배송비 생각하면 조금 어렵고요, 17만원까지는 가능해요.',
        createdAt: t(28),
        senderId: 'other',
        sender: OTHER,
      },
      { id: '9', type: 'text', metadata: null, content: '알겠어요! 그럼 주말에 성수역 근처에서 만날까요?', createdAt: t(10), senderId: 'me', sender: ME },
      {
        id: '10',
        type: 'text',
        metadata: null,
        content: '좋아요 😄 토요일 오후 2시 어떠세요? 성수역 2번 출구 앞에서 만나요!',
        createdAt: t(8),
        senderId: 'other',
        sender: OTHER,
      },
      { id: '11', type: 'text', metadata: null, content: '완벽해요! 그때 뵐게요 🙌', createdAt: t(5), senderId: 'me', sender: ME },
      // 결제 완료
      {
        id: 'sys-1',
        type: 'system_payment',
        metadata: JSON.stringify({
          orderId: 'mock-order-1',
          shippingMethod: '일반택배(선불)',
          buyerNote: '빠른 배송 부탁드리겠습니다 감사합니다:)',
          refundDeadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        content: '결제를 완료했어요.',
        createdAt: t(4),
        senderId: null,
        sender: null,
      },
      // 판매자 상품 준비 시작
      {
        id: 'sys-2',
        type: 'system_preparing',
        metadata: JSON.stringify({ orderId: 'mock-order-1' }),
        content: '배송이 곧 시작됩니다!',
        createdAt: t(3),
        senderId: null,
        sender: null,
      },
      // 운송장 번호 등록
      {
        id: 'sys-3',
        type: 'system_shipped',
        metadata: JSON.stringify({
          orderId: 'mock-order-1',
          trackingNumber: '123456789012',
          trackingCarrier: 'CJ대한통운',
        }),
        content: '운송장 번호가 등록되었어요.',
        createdAt: t(1),
        senderId: null,
        sender: null,
      },
    ],
    order: {
      id: 'mock-order-1',
      status: 'shipped',
      shippingMethod: '일반택배(선불)',
      buyerNote: '빠른 배송 부탁드리겠습니다 감사합니다:)',
      trackingNumber: '123456789012',
      trackingCarrier: 'CJ대한통운',
      refundDeadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: t(4),
    },
  }
}

function MockChatContent() {
  // ?as=other 로 접속하면 판매자 시점
  const searchParams = useSearchParams()
  const currentUserId = searchParams.get('as') === 'other' ? 'other' : 'me'
  const chat = buildMockChat(currentUserId)

  return (
    <div className="relative">
      {/* 테스트 안내 배너 */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="mt-2 bg-[#181818]/80 text-white text-[11px] px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-auto">
          목업 모드 · 지금 보기: <strong>{currentUserId === 'me' ? '구매자' : '판매자'}</strong>
          {' — '}
          <a
            href={currentUserId === 'me' ? '/chat/mock?as=other' : '/chat/mock'}
            className="underline"
          >
            {currentUserId === 'me' ? '판매자로 전환' : '구매자로 전환'}
          </a>
        </div>
      </div>
      <ChatRoomClient chat={chat} currentUserId={currentUserId} />
    </div>
  )
}

export default function MockChatPage() {
  return (
    <Suspense>
      <MockChatContent />
    </Suspense>
  )
}
