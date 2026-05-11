import { Suspense } from 'react'
import OnboardingSportsClient from './OnboardingSportsClient'

export default function OnboardingSportsPage() {
  return (
    <Suspense>
      <OnboardingSportsClient />
    </Suspense>
  )
}
