import { Suspense } from 'react'
import OnboardingLevelClient from './OnboardingLevelClient'

export default function OnboardingLevelPage() {
  return (
    <Suspense>
      <OnboardingLevelClient />
    </Suspense>
  )
}
