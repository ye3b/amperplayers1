'use client'

import { useRouter } from 'next/navigation'
import Icon from './Icon'

export default function BackHeader({ title }: { title: string }) {
  const router = useRouter()
  return (
    <div className="flex items-center gap-2 px-[14px] pt-[52px] pb-[12px]">
      <button
        onClick={() => router.back()}
        className="w-[40px] h-[40px] flex items-center justify-center -ml-2"
      >
        <Icon name="arrow-left" size={24} className="text-neutral-900" />
      </button>
      <span className="text-[16px] font-bold text-neutral-900 tracking-[-0.3px]">{title}</span>
    </div>
  )
}
