import { Suspense } from 'react'
import DetailClient from './DetailClient'

export default function DetailPage() {
  return (
    <Suspense>
      <DetailClient />
    </Suspense>
  )
}
