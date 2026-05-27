'use client'

import Link from 'next/link'
import Icon from '@/components/ui/Icon'

interface User {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

interface ChatItem {
  id: string
  updatedAt: Date
  product: { id: string; name: string; price: number; images: string }
  buyer: User
  seller: User
  messages: { content: string; createdAt: Date }[]
}

interface Props {
  chats: ChatItem[]
  currentUserId: string
}

export default function ChatListClient({ chats, currentUserId }: Props) {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-4 pt-6 pb-4 border-b border-[#F0F0F0]">
        <h1 className="text-[20px] font-bold text-[#181818] tracking-[-0.5px]">채팅</h1>
      </div>

      {/* 채팅 목록 */}
      {chats.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {chats.map((chat) => (
            <ChatRow key={chat.id} chat={chat} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChatRow({ chat, currentUserId }: { chat: ChatItem; currentUserId: string }) {
  const isBuyer = chat.buyer.id === currentUserId
  const counterpart = isBuyer ? chat.seller : chat.buyer
  const counterpartName = counterpart.name || counterpart.username || '알 수 없음'

  const lastMessage = chat.messages[0]
  const images: string[] = JSON.parse(chat.product.images)
  const thumbUrl = images[0] ?? null

  return (
    <Link
      href={`/chat/${chat.id}`}
      className="flex items-center gap-3 px-4 py-4 border-b border-[#F7F7F7] active:bg-[#F7F7F7] transition-colors"
    >
      {/* 상품 이미지 */}
      <div className="relative flex-shrink-0">
        {/* 상대방 아바타 */}
        <div className="w-12 h-12 rounded-full bg-[#E8E8E8] overflow-hidden flex items-center justify-center">
          {counterpart.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={counterpart.image} alt={counterpartName} className="w-full h-full object-cover" />
          ) : (
            <Icon name="user-profile-03" size={24} className="text-[#9E9E9E]" />
          )}
        </div>
        {/* 상품 썸네일 배지 */}
        {thumbUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl}
            alt={chat.product.name}
            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-md object-cover border-2 border-white"
          />
        )}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[14px] font-semibold text-[#181818] truncate">{counterpartName}</span>
          {lastMessage && (
            <span className="text-[11px] text-[#9E9E9E] flex-shrink-0 ml-2">
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="text-[13px] text-[#9E9E9E] truncate">
          {lastMessage ? lastMessage.content : '대화를 시작해보세요'}
        </p>
        <p className="text-[11px] text-[#C8C8C8] truncate mt-0.5">{chat.product.name}</p>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
        <Icon name="message-circle" size={28} className="text-[#C8C8C8]" />
      </div>
      <p className="text-[15px] font-semibold text-[#181818] mb-1">아직 채팅이 없어요</p>
      <p className="text-[13px] text-[#9E9E9E]">관심 상품의 판매자에게<br />채팅을 보내보세요</p>
    </div>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return '방금'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  const days = Math.floor(diff / 86400)
  if (days < 7) return `${days}일 전`
  return `${d.getMonth() + 1}/${d.getDate()}`
}
