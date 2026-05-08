import { Suspense } from 'react'
import LevelSelectClient from './LevelSelectClient'

export default function LevelSelectPage() {
  return (
    <Suspense>
      <LevelSelectClient />
    </Suspense>
  )
}
