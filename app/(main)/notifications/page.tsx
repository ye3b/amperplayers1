'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'

interface Notification {
  id: string
  type: 'wishlist' | 'chat' | 'order'
  message: string
  productName: string
  image: string | null
  createdAt: string
  link: string
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-[14px] pt-[52px] pb-[12px]">
        <button onClick={() => router.back()} className="w-[40px] h-[40px] flex items-center justify-center -ml-2">
          <Icon name="arrow-left" size={24} className="text-[#181818]" />
        </button>
        <span className="text-[20px] font-bold text-[#181818] tracking-[-0.5px]">알림</span>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-6 h-6 border-2 border-[#181818] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Icon name="bell" size={40} className="text-[#E8E8E8] mb-3" />
          <p className="text-[13px] text-[#9E9E9E]">아직 알림이 없어요</p>
        </div>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li key={n.id}>
              <Link
                href={n.link}
                className="flex items-center gap-3 px-5 py-4 border-b border-[#F5F5F5] active:bg-[#F8F8F8]"
              >
                <div className="w-[48px] h-[48px] rounded-[10px] bg-[#F5F5F5] flex-shrink-0 overflow-hidden">
                  {n.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon
                        name={n.type === 'wishlist' ? 'heart' : n.type === 'chat' ? 'message-circle' : 'box'}
                        size={20}
                        className="text-[#C8C8C8]"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#181818] leading-[18px]">{n.message}</p>
                  <p className="text-[12px] text-[#9E9E9E] mt-0.5 truncate">{n.productName}</p>
                  <p className="text-[11px] text-[#C8C8C8] mt-0.5">{formatTime(new Date(n.createdAt))}</p>
                </div>
                <Icon name="right" size={14} className="text-[#C8C8C8] flex-shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
