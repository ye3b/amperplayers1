'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SPORTS_TABS, FieldDef } from './formConfig'
import { sellStore } from '@/lib/sellStore'

const SPORT_LABELS: Record<string, string> = {
  golf: '골프', soccer: '축구', baseball: '야구',
running: '러닝', cycling: '자전거', basketball: '농구',
}

export default function DetailClient() {
  const router = useRouter()
  const params = useSearchParams()
  const sport = params.get('sport') ?? ''
  const tabs = SPORTS_TABS[sport] ?? []

  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? '')
  // formData[tabId][fieldId] = value
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({})

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const getValue = (fieldId: string) => formData[activeTabId]?.[fieldId] ?? ''
  const getMulti  = (fieldId: string) => {
    const v = getValue(fieldId)
    return v ? v.split(',') : []
  }

  const setValue = (fieldId: string, value: string) =>
    setFormData((prev) => ({
      ...prev,
      [activeTabId]: { ...(prev[activeTabId] ?? {}), [fieldId]: value },
    }))

  const toggleMulti = (fieldId: string, option: string) => {
    const cur = getMulti(fieldId)
    const next = cur.includes(option) ? cur.filter((v) => v !== option) : [...cur, option]
    setValue(fieldId, next.join(','))
  }

  const handleNext = () => {
    // 스토어에 저장
    sellStore.sport = sport
    sellStore.productType = activeTabId
    sellStore.formData = formData[activeTabId] ?? {}
    router.push(`/sell/price?sport=${sport}&tab=${activeTabId}`)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex-shrink-0 px-4 pt-2 pb-4">
        <h1 className="text-[24px] font-bold tracking-[-0.5px] text-neutral-900 mb-1">
          {SPORT_LABELS[sport] ?? sport} 용품 정보
        </h1>
        <p className="text-[14px] text-neutral-400">판매할 제품 카테고리를 선택하세요</p>
      </div>

      {/* 탭 바 */}
      <div className="flex-shrink-0">
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex-shrink-0 pb-3 px-3 text-[14px] font-semibold border-b-2 transition-colors
                  ${isActive ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400'}`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 폼 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {activeTab?.fields.map((field) => (
          <FieldRenderer
            key={`${activeTabId}-${field.id}`}
            field={field}
            value={getValue(field.id)}
            multiValue={getMulti(field.id)}
            onChange={(v) => setValue(field.id, v)}
            onToggleMulti={(v) => toggleMulti(field.id, v)}
          />
        ))}
      </div>

      {/* 다음 버튼 */}
      <div className="flex-shrink-0 px-4 pb-12 pt-4">
        <button
          onClick={handleNext}
          className="w-full h-[56px] rounded-xl bg-neutral-900 text-primary text-[15px] font-bold tracking-[-0.25px] active:scale-[0.98] transition-all"
        >
          다음
        </button>
      </div>
    </div>
  )
}

function FieldRenderer({
  field, value, multiValue, onChange, onToggleMulti,
}: {
  field: FieldDef
  value: string
  multiValue: string[]
  onChange: (v: string) => void
  onToggleMulti: (v: string) => void
}) {
  const isRequired = field.type !== 'slider' && field.type !== 'multiselect' && (field as { required?: boolean }).required

  return (
    <div>
      <label className="block text-[14px] font-semibold text-neutral-900 mb-2.5">
        {field.label}
        {isRequired && <span className="text-error ml-0.5">*</span>}
      </label>

      {field.type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full h-[48px] bg-neutral-100 rounded-xl px-4 text-[15px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
        />
      )}

      {field.type === 'number' && (
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="flex-1 h-[48px] bg-neutral-100 rounded-xl px-4 text-[15px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
          />
          {field.unit && (
            <span className="text-[14px] font-semibold text-neutral-400">{field.unit}</span>
          )}
        </div>
      )}

      {field.type === 'radio' && (
        <div className="flex flex-wrap gap-2">
          {field.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(value === opt ? '' : opt)}
              className={`h-[36px] px-4 rounded-full text-[13px] font-medium transition-colors
                ${value === opt ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {field.type === 'select' && (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[48px] bg-neutral-100 rounded-xl px-4 pr-10 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 appearance-none"
          >
            <option value="">선택하세요</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
              <path d="M1 1l5 5 5-5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      {field.type === 'multiselect' && (
        <div className="flex flex-wrap gap-2">
          {field.options.map((opt) => {
            const selected = multiValue.includes(opt)
            return (
              <button
                key={opt}
                onClick={() => onToggleMulti(opt)}
                className={`h-[36px] px-4 rounded-full text-[13px] font-medium transition-colors
                  ${selected ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {field.type === 'slider' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] text-neutral-400">{field.min}{field.unit}</span>
            <span className="text-[20px] font-bold text-neutral-900">
              {value || '50'}<span className="text-[14px] text-neutral-400 ml-0.5">{field.unit}</span>
            </span>
            <span className="text-[12px] text-neutral-400">{field.max}{field.unit}</span>
          </div>
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={value || '50'}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[4px] rounded-full appearance-none cursor-pointer accent-neutral-900 bg-neutral-100"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-neutral-300">아직 안 됨</span>
            <span className="text-[11px] text-neutral-300">완전히 됨</span>
          </div>
        </div>
      )}
    </div>
  )
}
