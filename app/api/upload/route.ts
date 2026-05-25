import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const UT_FALLBACK_URLS = [
  'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800',
  'https://images.unsplash.com/photo-1562077772-3bd90403f7f0?w=800',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
]

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { images } = await req.json() as { images: { data: string; mediaType: string }[] }
  if (!images?.length) return NextResponse.json({ error: '이미지가 없습니다.' }, { status: 400 })

  // Cloudinary 키 없으면 UT용 폴백 URL 반환
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    const urls = images.map((_, i) => UT_FALLBACK_URLS[i % UT_FALLBACK_URLS.length])
    return NextResponse.json({ urls })
  }

  try {
    const urls = await Promise.all(
      images.map(({ data, mediaType }) =>
        new Promise<string>((resolve, reject) => {
          cloudinary.uploader.upload(
            `data:${mediaType};base64,${data}`,
            { folder: 'amp-products', resource_type: 'image' },
            (err, result) => {
              if (err || !result) reject(err ?? new Error('업로드 실패'))
              else resolve(result.secure_url)
            },
          )
        })
      )
    )
    return NextResponse.json({ urls })
  } catch (err) {
    console.error('[upload]', err)
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    return NextResponse.json({ error: `업로드 실패: ${msg}` }, { status: 500 })
  }
}
