'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initAmplitude, trackEvent } from '@/lib/amplitude'

function AmplitudeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    initAmplitude()
  }, [])

  useEffect(() => {
    trackEvent('Page Viewed', { path: pathname })
  }, [pathname])

  return <>{children}</>
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AmplitudeProvider>{children}</AmplitudeProvider>
    </SessionProvider>
  )
}
