import { readFileSync } from 'fs'
// .env 수동 로드
const envContent = readFileSync(new URL('../.env', import.meta.url), 'utf-8')
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
}
import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

async function main() {
  const products = await prisma.product.findMany({
    where: { grade: { not: null }, score: { not: null } },
    select: { id: true, name: true, images: true, metadata: true },
  })

  const toUpdate = products.filter((p) => {
    if (!p.metadata) return true
    try {
      const meta = JSON.parse(p.metadata)
      return !meta.comment
    } catch { return true }
  })

  console.log(`재분석 대상: ${toUpdate.length}개 상품`)

  let updated = 0
  for (const product of toUpdate) {
    try {
      const imageUrls = JSON.parse(product.images)
      if (imageUrls.length === 0) {
        console.log(`  [SKIP] ${product.name} - 이미지 없음`)
        continue
      }

      console.log(`  [분석중] ${product.name}...`)

      // 이미지 URL → base64
      const images = await Promise.all(
        imageUrls.slice(0, 3).map(async (url) => {
          const res = await fetch(url)
          const buffer = await res.arrayBuffer()
          const data = Buffer.from(buffer).toString('base64')
          const contentType = res.headers.get('content-type') || 'image/jpeg'
          return { type: 'image', source: { type: 'base64', media_type: contentType, data } }
        })
      )

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            ...images,
            { type: 'text', text: '위 사진들을 분석해서 스포츠 용품 상태를 평가해주세요.' },
          ],
        }],
      })

      const raw = response.content.find((b) => b.type === 'text')
      if (!raw || raw.type !== 'text') {
        console.log(`  [FAIL] ${product.name} - 응답 없음`)
        continue
      }

      const cleaned = raw.text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      const result = JSON.parse(cleaned)

      // 기존 metadata 병합
      let existingMeta = {}
      if (product.metadata) {
        try { existingMeta = JSON.parse(product.metadata) } catch {}
      }

      const newMeta = {
        ...existingMeta,
        wearScore: result.wearScore,
        appearanceScore: result.appearanceScore,
        functionalScore: result.functionalScore,
        usage: result.usage,
        damage: result.damage,
        damageParts: result.damageParts,
        functional: result.functional,
        functionalReason: result.functionalReason,
        appearance: result.appearance,
        comment: result.comment,
      }

      await prisma.product.update({
        where: { id: product.id },
        data: {
          grade: result.grade,
          score: result.score,
          metadata: JSON.stringify(newMeta),
        },
      })

      console.log(`  [OK] ${product.name} → ${result.grade}급 (${result.score}점)`)
      updated++
    } catch (e) {
      console.error(`  [ERROR] ${product.name}:`, e.message)
    }
  }

  console.log(`\n완료: ${updated}/${toUpdate.length}개 업데이트`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
