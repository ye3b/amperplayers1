'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from '@/components/ui/Icon'

const NAV_ITEMS = [
  { href: '/', icon: 'home-04' as const, label: '홈' },
  { href: '/products', icon: 'search-01' as const, label: '검색' },
  { href: '/sell', icon: null, label: '' }, // 가운데 + 버튼
  { href: '/chat', icon: 'message-circle' as const, label: '채팅' },
  { href: '/profile', icon: 'user-profile-03' as const, label: '마이' },
]

export default function BottomNav() {
  const pathname = usePathname()

  // 상품 상세 페이지는 자체 footer 사용
  if (/^\/products\/[^/]+$/.test(pathname)) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[78px] bg-white border-t border-gray-100 flex items-center justify-center px-2 pb-3 gap-7 z-50">
      {NAV_ITEMS.map((item, i) => {
        // 가운데 + 버튼
        if (item.icon === null) {
          return (
            <Link
              key="add"
              href={item.href}
              className="flex-shrink-0 w-14 h-14 bg-dark rounded-full flex items-center justify-center -mt-2"
            >
              <Icon name="circle-plus" size={24} className="text-white" />
            </Link>
          )
        }

        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-1 px-3 py-1 w-12 h-[50px]"
          >
            <Icon
              name={item.icon}
              size={24}
              className={isActive ? 'text-dark' : 'text-gray-light'}
            />
            <span
              className="text-[10px] leading-[14px] tracking-[0.25px] font-normal"
              style={{ color: isActive ? '#181818' : '#9E9E9E' }}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
