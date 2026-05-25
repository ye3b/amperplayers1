'use client'

import { useEffect } from 'react'

type Props = {
  title: string
  content: string
  onClose: () => void
}

export default function TermsModal({ title, content, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] bg-white rounded-t-2xl flex flex-col"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-[17px] font-bold text-neutral-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-neutral-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="text-[13px] leading-[22px] text-neutral-500 whitespace-pre-line">
            {content}
          </p>
        </div>

        <div className="px-5 py-4 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="w-full h-[50px] rounded-xl bg-neutral-900 text-white text-[15px] font-bold"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}