import { useEffect, useState } from 'react'

/**
 * Detects whether the current device primarily uses touch input
 *
 * Queries common touch heuristics (pointer media query, touch events,
 * and navigator touch points) to determine whether the user is likely
 * on a touch-capable device. Useful for tailoring onboarding copy to
 * mobile or tablet experiences.
 *
 * @returns Boolean indicating if the device reports touch capabilities
 *
 * @example
 * ```typescript
 * const isTouchDevice = useIsTouchDevice()
 * if (isTouchDevice) {
 *   renderMobileTooltip()
 * }
 * ```
 */
export const useIsTouchDevice = (): boolean => {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const hasTouchSupport =
      window.matchMedia?.('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0

    setIsTouch(hasTouchSupport)
  }, [])

  return isTouch
}

