import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    // grade가 있는 상품 중 metadata에 comment가 없는 상품들 조회
    const products = await prisma.product.findMany({
      where: { grade: { not: null }, score: { not: null } },
      select: { id: true, images: true, metadata: true },
    })

    const toUpdate = products.filter((p) => {
      if (!p.metadata) return true
      try {
        const meta = JSON.parse(p.metadata)
        return !meta.comment
      } catch {
        return true
      }
    })

    if (toUpdate.length === 0) {
      return NextResponse.json({ message: '업데이트할 상품이 없습니다.', updated: 0 })
    }

    let updated = 0
    const baseUrl = req.nextUrl.origin

    for (const product of toUpdate) {
      try {
        // 이미지 URL에서 base64로 변환
        const imageUrls: string[] = JSON.parse(product.images)
        if (imageUrls.length === 0) continue

        const images = await Promise.all(
          imageUrls.slice(0, 3).map(async (url) => {
            const res = await fetch(url)
            const buffer = await res.arrayBuffer()
            const data = Buffer.from(buffer).toString('base64')
            const contentType = res.headers.get('content-type') || 'image/jpeg'
            return { data, mediaType: contentType }
          })
        )

        // 기존 analyze API 호출
        const analyzeRes = await fetch(`${baseUrl}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images }),
        })

        if (!analyzeRes.ok) continue
        const result = await analyzeRes.json()

        // 기존 metadata 유지하면서 AI 분석 필드 추가
        let existingMeta: Record<string, unknown> = {}
        if (product.metadata) {
          try { existingMeta = JSON.parse(product.metadata) } catch { /* ignore */ }
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

        updated++
      } catch (e) {
        console.error(`[reanalyze] 상품 ${product.id} 실패:`, e)
      }
    }

    return NextResponse.json({ message: `${updated}개 상품 업데이트 완료`, updated })
  } catch (err) {
    console.error('[reanalyze]', err)
    return NextResponse.json({ error: '재분석 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
