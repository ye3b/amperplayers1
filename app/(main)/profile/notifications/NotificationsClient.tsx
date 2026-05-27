'use client'

import { useState, useEffect, useCallback } from 'react'
import BackHeader from '@/components/ui/BackHeader'
import Icon from '@/components/ui/Icon'

interface NotificationSettings {
  chat: boolean
  transaction: boolean
  wishlist: boolean
  newProduct: boolean
  marketing: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
  chat: true,
  transaction: true,
  wishlist: true,
  newProduct: false,
  marketing: false,
}

const GROUPS = [
  {
    title: '거래 알림',
    items: [
      { key: 'chat' as const,        label: '채팅 메시지',    desc: '새 채팅 메시지가 오면 알려드려요' },
      { key: 'transaction' as const, label: '거래 상태 변경', desc: '결제·배송·완료 등 거래 상태가 바뀔 때 알려드려요' },
    ],
  },
  {
    title: '관심 알림',
    items: [
      { key: 'wishlist' as const,   label: '관심 상품 변동', desc: '찜한 상품의 가격이나 상태가 바뀌면 알려드려요' },
      { key: 'newProduct' as const, label: '새 상품 등록',   desc: '내 종목의 새 상품이 등록되면 알려드려요' },
    ],
  },
  {
    title: '혜택 알림',
    items: [
      { key: 'marketing' as const,  label: '이벤트·혜택',   desc: '프로모션, 이벤트 소식을 알려드려요' },
    ],
  },
]

async function registerPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const reg = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  const existing = await reg.pushManager.getSubscription()
  if (existing) return existing

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
  })
  return sub
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export default function NotificationsClient() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)

  // 초기화: 알림 설정 + 권한 상태 로드
  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported')
    } else {
      setPermission(Notification.permission)
    }

    fetch('/api/push/settings')
      .then((r) => r.json())
      .then((data) => setSettings({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => {})
      .finally(() => setMounted(true))
  }, [])

  // 브라우저 권한 + 구독 등록
  const enablePush = useCallback(async () => {
    const sub = await registerPush()
    if (!sub) {
      setPermission(Notification.permission as NotificationPermission)
      return
    }
    setPermission('granted')
    const json = sub.toJSON()
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
    })
  }, [])

  // 토글 → DB 저장
  const toggle = useCallback(async (key: keyof NotificationSettings) => {
    if (permission !== 'granted') {
      await enablePush()
      return
    }

    const next = { ...settings, [key]: !settings[key] }
    setSettings(next)

    setSaving(true)
    try {
      await fetch('/api/push/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
    } finally {
      setSaving(false)
    }
  }, [settings, permission, enablePush])

  const notSupported = permission === 'unsupported'
  const denied = permission === 'denied'

  return (
    <div className="min-h-screen bg-white">

      <BackHeader title="알림 설정" />
      {saving && <p className="px-4 -mt-[8px] mb-[4px] text-[11px] text-[#9E9E9E]">저장 중…</p>}

      {/* 권한 배너 */}
      {mounted && !notSupported && permission !== 'granted' && (
        <div className="mx-[14px] mb-[8px] rounded-[12px] bg-[#F8F8F8] px-[14px] py-[12px] flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-[#181818]">
              {denied ? '알림이 차단되어 있어요' : '알림을 허용해주세요'}
            </p>
            <p className="text-[11px] text-[#9E9E9E] mt-[2px]">
              {denied
                ? '브라우저 설정에서 알림 권한을 허용해주세요'
                : '중요한 거래 소식을 놓치지 않도록 알림을 켜보세요'}
            </p>
          </div>
          {!denied && (
            <button
              onClick={enablePush}
              className="flex-shrink-0 px-[12px] h-[32px] rounded-[8px] bg-[#181818] text-[12px] font-bold text-white"
            >
              허용
            </button>
          )}
        </div>
      )}

      {/* 설정 그룹 */}
      <div className="px-4 flex flex-col gap-[24px] mt-[8px]">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-[0.5px] mb-[8px]">
              {group.title}
            </p>
            <div className="flex flex-col gap-[2px]">
              {group.items.map((item) => {
                const on = mounted && settings[item.key]
                const disabled = notSupported || denied
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-[14px] border-b border-[#F5F5F5]"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className={`text-[14px] font-semibold leading-[22px] ${disabled ? 'text-[#C8C8C8]' : 'text-[#181818]'}`}>
                        {item.label}
                      </p>
                      <p className="text-[12px] text-[#9E9E9E] leading-[18px] mt-[1px]">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => !disabled && toggle(item.key)}
                      disabled={disabled}
                      className={`relative w-[46px] h-[26px] rounded-full transition-colors duration-200 flex-shrink-0
                        ${on && !disabled ? 'bg-[#181818]' : 'bg-[#E0E0E0]'}`}
                      aria-label={item.label}
                    >
                      <span
                        className={`absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform duration-200
                          ${on && !disabled ? 'translate-x-[20px]' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="px-4 mt-[28px] text-[11px] text-[#C8C8C8] leading-[18px]">
        {notSupported
          ? '이 브라우저는 푸시 알림을 지원하지 않아요.'
          : '기기의 알림 권한이 허용되어 있어야 푸시 알림을 받을 수 있어요.'}
      </p>
    </div>
  )
}
