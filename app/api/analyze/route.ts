import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface AnalysisResult {
  grade: 'S' | 'A' | 'B' | 'C' | 'F'
  score: number
  wearScore: number
  appearanceScore: number
  functionalScore: number
  usage: '거의 없음' | '약간' | '보통' | '심함'
  damage: '없음' | '경미' | '중간' | '심각'
  damageParts: string
  functional: '없음' | '있음'
  functionalReason: string
  appearance: string
  comment: string
}

const SYSTEM_PROMPT = `당신은 스포츠 용품 상태를 전문가 수준으로 평가하는 AI입니다.
제공된 이미지를 분석하여 아래 JSON 형식으로만 응답하세요. JSON 외 텍스트는 절대 출력하지 마세요.

응답 형식:
{
  "grade": "S 또는 A 또는 B 또는 C 또는 F",
  "score": 0~100 정수,
  "wearScore": 0~100 정수 (마모도 점수. 낮을수록 마모 심함),
  "appearanceScore": 0~100 정수 (외관 상태 점수. 낮을수록 외관 손상 심함),
  "functionalScore": 0~100 정수 (기능 위험 점수. 낮을수록 기능 문제 심함),
  "usage": "거의 없음 또는 약간 또는 보통 또는 심함",
  "damage": "없음 또는 경미 또는 중간 또는 심각",
  "damageParts": "구체적인 손상 부위 설명. 없으면 '없음'",
  "functional": "없음 또는 있음",
  "functionalReason": "기능적 문제 이유. 없으면 '기능적 이상 없어 보임'",
  "appearance": "외관 상태 한 문장 설명 (스크래치, 오염, 변색 등)",
  "comment": "구매자·판매자를 위한 종합 코멘트 (3줄 이내, 핵심 요약)"
}

등급 기준:
- S (90~100점): 새상품 수준. 사용 흔적 거의 없음. 기능 문제 없음.
- A (75~89점): 사용감 적음. 경미한 외관 손상 가능. 기능 정상.
- B (55~74점): 일반적인 중고 상태. 사용감 존재. 기능 사용 가능.
- C (30~54점): 손상 또는 성능 저하 존재. 관리·수리 필요 가능성 있음.
- F (0~29점): 안전 문제 또는 핵심 기능 손상 존재. 거래 비추천.

판단 기준:
- 스크래치, 마모, 찢어짐, 변형, 오염을 우선 고려
- 기능적 사용 가능 여부를 가장 중요하게 판단
- 사진에 보이지 않는 부분은 추측하지 말 것
- 확신이 낮을 경우 해당 필드 값에 "(추정)" 명시`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const images: { data: string; mediaType: string }[] = body.images ?? []

    if (images.length === 0) {
      return NextResponse.json({ error: '이미지가 없습니다.' }, { status: 400 })
    }

    const imageBlocks: Anthropic.ImageBlockParam[] = images.map((img) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: img.data,
      },
    }))

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks,
            {
              type: 'text',
              text: '위 사진들을 분석해서 스포츠 용품 상태를 평가해주세요.',
            },
          ],
        },
      ],
    })

    const raw = response.content.find((b) => b.type === 'text')
    if (!raw || raw.type !== 'text') {
      return NextResponse.json({ error: '분석 결과를 받지 못했습니다.' }, { status: 500 })
    }

    // JSON 블록이 마크다운 코드펜스로 감싸진 경우 제거
    const cleaned = raw.text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    const result: AnalysisResult = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error('[analyze]', err)
    const msg = err instanceof Error ? err.message : String(err)
    // Anthropic API 키 오류
    if (msg.includes('401') || msg.includes('auth')) {
      return NextResponse.json({ error: 'API 인증 오류가 발생했습니다.' }, { status: 500 })
    }
    // 모델 오류
    if (msg.includes('model')) {
      return NextResponse.json({ error: '모델 오류가 발생했습니다.' }, { status: 500 })
    }
    return NextResponse.json({ error: msg || '분석 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
