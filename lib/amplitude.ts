import * as amplitude from '@amplitude/analytics-browser'

const API_KEY = '9f72df885f746d3fd703c32740715a88'

let initialized = false

export function initAmplitude() {
  if (initialized || typeof window === 'undefined') return
  amplitude.init(API_KEY, { defaultTracking: true })
  initialized = true
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  amplitude.track(eventName, properties)
}

export function identifyUser(userId: string, username?: string) {
  if (typeof window === 'undefined') return
  amplitude.setUserId(userId)
  if (username) {
    const identify = new amplitude.Identify()
    identify.set('username', username)
    amplitude.identify(identify)
  }
}

export function resetUser() {
  if (typeof window === 'undefined') return
  amplitude.reset()
}
