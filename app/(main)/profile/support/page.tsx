'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'

const FAQS = [
  {
    category: '거래',
    items: [
      {
        q: '판매자가 배송을 안 보내요.',
        a: '결제 후 3영업일 이내에 발송되지 않으면 채팅창에서 취소를 요청할 수 있어요. 판매자가 응답하지 않으면 고객센터로 문의해 주세요.',
      },
      {
        q: '상품이 설명과 달라요.',
        a: '상품 수령 후 24시간 이내에 채팅으로 판매자에게 먼저 문의해 주세요. 합의가 어려울 경우 고객센터에서 중재해 드려요.',
      },
      {
        q: '환불은 어떻게 하나요?',
        a: '거래완료 처리 전까지 채팅에서 반품 요청이 가능해요. 거래완료 후에는 판매자와 직접 합의가 필요해요.',
      },
      {
        q: '결제 후 취소하고 싶어요.',
        a: '판매자가 배송 준비 전이라면 채팅에서 취소 요청이 가능해요. 이미 발송된 경우엔 반품 절차를 진행해야 해요.',
      },
    ],
  },
  {
    category: '계정',
    items: [
      {
        q: '비밀번호를 잊어버렸어요.',
        a: '로그인 화면 하단의 "비밀번호 찾기"를 통해 가입 시 등록한 이메일로 재설정 링크를 받을 수 있어요.',
      },
      {
        q: '휴대폰 번호를 변경하고 싶어요.',
        a: '마이페이지 → 계정 관리에서 본인 인증 후 변경 가능해요.',
      },
      {
        q: '계정을 탈퇴하고 싶어요.',
        a: '마이페이지 → 계정 관리 → 회원 탈퇴에서 진행할 수 있어요. 탈퇴 시 모든 거래 내역과 데이터가 삭제돼요.',
      },
    ],
  },
  {
    category: '상품 등록',
    items: [
      {
        q: 'AI 진단 등급은 어떻게 결정되나요?',
        a: '상품 사진을 AI가 분석해 상태를 S~F등급으로 자동 산정해요. 등록 전 사진을 밝고 선명하게 찍으면 더 정확한 등급을 받을 수 있어요.',
      },
      {
        q: '등록한 상품을 수정하고 싶어요.',
        a: '마이페이지 → 판매 목록에서 상품을 선택한 뒤 수정할 수 있어요. 거래 진행 중인 상품은 일부 항목만 수정 가능해요.',
      },
    ],
  },
]

const CONTACT_ITEMS = [
  {
    icon: 'message-circle' as const,
    title: '1:1 채팅 문의',
    desc: '평일 10:00 – 18:00',
    action: () => alert('채팅 문의 기능은 준비 중이에요.'),
  },
  {
    icon: 'share' as const,
    title: '이메일 문의',
    desc: 'support@players.kr',
    action: () => { window.location.href = 'mailto:support@players.kr' },
  },
]

export default function SupportPage() {
  const router = useRouter()
  const [openIdx, setOpenIdx] = useState<string | null>(null)

  const toggle = (key: string) => setOpenIdx((prev) => (prev === key ? null : key))

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* 헤더 */}
      <div className="bg-white flex items-center gap-2 px-[14px] pt-[52px] pb-[12px]">
        <button onClick={() => router.back()} className="w-[40px] h-[40px] flex items-center justify-center -ml-2">
          <Icon name="arrow-left" size={24} className="text-[#181818]" />
        </button>
        <span className="text-[20px] font-bold text-[#181818] tracking-[-0.5px]">고객센터</span>
      </div>

      {/* 문의 수단 */}
      <div className="bg-white mt-2 px-5 py-4">
        <p className="text-[13px] font-bold text-[#181818] mb-3">문의하기</p>
        <div className="flex gap-3">
          {CONTACT_ITEMS.map((item) => (
            <button
              key={item.title}
              onClick={item.action}
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-[12px] border border-[#F0F0F0] bg-[#FAFAFA]"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-[#181818] flex items-center justify-center">
                <Icon name={item.icon} size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#181818]">{item.title}</p>
                <p className="text-[11px] text-[#9E9E9E] mt-0.5">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 공지 */}
      <div className="bg-white mt-2 px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold text-[#181818]">공지사항</p>
          <span className="text-[11px] text-[#9E9E9E]">준비 중</span>
        </div>
        <p className="text-[12px] text-[#C8C8C8] mt-3 pb-1">등록된 공지사항이 없어요.</p>
      </div>

      {/* FAQ */}
      <div className="mt-2">
        <div className="bg-white px-5 pt-4 pb-2">
          <p className="text-[13px] font-bold text-[#181818]">자주 묻는 질문</p>
        </div>
        {FAQS.map((section) => (
          <div key={section.category} className="bg-white mt-[1px]">
            <div className="px-5 py-3 border-b border-[#F5F5F5]">
              <span className="text-[11px] font-bold text-[#9E9E9E] uppercase tracking-wide">{section.category}</span>
            </div>
            {section.items.map((item, i) => {
              const key = `${section.category}-${i}`
              const isOpen = openIdx === key
              return (
                <div key={key} className="border-b border-[#F5F5F5]">
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-[13px] font-medium text-[#181818] leading-[20px] flex-1 pr-3">{item.q}</span>
                    <div className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4">
                      <p className="text-[12px] text-[#555] leading-[20px] bg-[#F8F8F8] rounded-[10px] px-4 py-3">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* 버전 */}
      <div className="px-5 py-6 text-center">
        <p className="text-[11px] text-[#C8C8C8]">Players v1.0.0</p>
      </div>
    </div>
  )
}
