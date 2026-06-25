'use client'

import { useEffect, useState } from 'react'

export function useImagePreload(urls: string[]): boolean {
  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    if (urls.length === 0) return

    let isCancelled = false

    const images = urls.map((url) => {
      const img = new Image()
      const handleSettled = () => {
        if (!isCancelled) setLoadedCount((count) => count + 1)
      }
      img.onload = handleSettled
      img.onerror = handleSettled
      img.src = url
      return img
    })

    return () => {
      isCancelled = true
      images.forEach((img) => {
        img.onload = null
        img.onerror = null
      })
    }
  }, [urls])

  return urls.length === 0 || loadedCount >= urls.length
}
