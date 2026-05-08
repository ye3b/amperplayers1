import webpush from 'web-push'
import { prisma } from './prisma'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

type NotificationKey = 'chat' | 'transaction' | 'wishlist' | 'newProduct' | 'marketing'

interface PushPayload {
  title: string
  body: string
  url?: string
}

export async function sendPushToUser(
  userId: string,
  key: NotificationKey,
  payload: PushPayload,
) {
  // 알림 설정 확인
  const settings = await prisma.notificationSettings.findUnique({ where: { userId } })
  // 설정이 없으면 기본값(true) 적용. false면 발송 안 함
  if (settings && !settings[key]) return

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } })
  if (subscriptions.length === 0) return

  const body = JSON.stringify(payload)

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        )
      } catch (err: unknown) {
        // 구독이 만료된 경우 DB에서 제거
        if (
          err instanceof Error &&
          'statusCode' in err &&
          ((err as { statusCode: number }).statusCode === 404 ||
            (err as { statusCode: number }).statusCode === 410)
        ) {
          await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } })
        }
      }
    }),
  )
}
