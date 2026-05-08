'use client'

import { useState } from 'react'

export interface TabItem {
  label: string
  emoji?: string
  value: string
}

interface TabProps {
  items: TabItem[]
  value?: string
  onChange?: (value: string) => void
}

export default function Tab({ items, value, onChange }: TabProps) {
  const [selected, setSelected] = useState(value ?? items[0]?.value)

  const handleClick = (v: string) => {
    setSelected(v)
    onChange?.(v)
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {items.map((item) => {
        const isSelected = (value ?? selected) === item.value
        return (
          <button
            key={item.value}
            onClick={() => handleClick(item.value)}
            className={`
              flex items-center gap-1 px-3 py-2 rounded-[80px] transition-colors
              ${isSelected
                ? 'bg-dark text-[#F8F8F8]'
                : 'bg-[#F8F8F8] text-gray'
              }
            `}
          >
            {item.emoji && (
              <span className="text-xs leading-[18px]">{item.emoji}</span>
            )}
            <span
              className={`
                text-xs leading-5 tracking-[-1px]
                ${isSelected ? 'font-bold uppercase' : 'font-medium'}
              `}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
