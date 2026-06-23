'use client'

import { useCallback, useEffect, useState } from 'react'

type Tilt = { x: number; y: number }

type DeviceOrientationEventStatic = {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

type UseDeviceTilt = {
  tilt: Tilt | null
  needsPermission: boolean
  requestPermission: () => Promise<void>
}

export function useDeviceTilt(): UseDeviceTilt {
  const [tilt, setTilt] = useState<Tilt | null>(null)
  const [granted, setGranted] = useState(false)

  const isSupported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
  const needsPermission =
    isSupported &&
    typeof (window.DeviceOrientationEvent as unknown as DeviceOrientationEventStatic).requestPermission ===
      'function'

  useEffect(() => {
    if (!isSupported || (needsPermission && !granted)) return

    function handleOrientation(event: DeviceOrientationEvent) {
      if (event.beta === null || event.gamma === null) return
      setTilt({
        x: Math.max(-1, Math.min(1, event.gamma / 45)),
        y: Math.max(-1, Math.min(1, (event.beta - 45) / 45)),
      })
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [isSupported, needsPermission, granted])

  const requestPermission = useCallback(async () => {
    if (!needsPermission) {
      setGranted(true)
      return
    }
    try {
      const requestFn = (window.DeviceOrientationEvent as unknown as DeviceOrientationEventStatic)
        .requestPermission
      const response = await requestFn?.()
      setGranted(response === 'granted')
    } catch {
      setGranted(false)
    }
  }, [needsPermission])

  return { tilt, needsPermission, requestPermission }
}
