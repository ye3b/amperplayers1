import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as typeof session.user & { id: string }).id
  const { data, mediaType } = await req.json() as { data: string; mediaType: string }
  if (!data || !mediaType) return NextResponse.json({ error: '이미지가 없습니다.' }, { status: 400 })

  try {
    const url = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:${mediaType};base64,${data}`,
        { folder: 'amp-profiles', resource_type: 'image' },
        (err, result) => {
          if (err || !result) reject(err ?? new Error('업로드 실패'))
          else resolve(result.secure_url)
        },
      )
    })

    await prisma.user.update({ where: { id: userId }, data: { image: url } })
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[profile-image]', err)
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    return NextResponse.json({ error: `업로드 실패: ${msg}` }, { status: 500 })
  }
}
