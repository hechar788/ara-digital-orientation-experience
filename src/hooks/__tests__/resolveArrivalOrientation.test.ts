import { describe, expect, it } from 'vitest'
import { resolveArrivalOrientation } from '../useTourNavigation'

describe('resolveArrivalOrientation', () => {
  it('keeps the movement heading when available', () => {
    const result = resolveArrivalOrientation({
      navigationAngle: undefined,
      postArrivalAngle: undefined,
      movementAngle: 450,
      fallbackAngle: 0
    })
    expect(result).toBe(90)
  })

  it('uses the upcoming heading when movement data is missing', () => {
    const result = resolveArrivalOrientation({
      navigationAngle: -45,
      postArrivalAngle: undefined,
      movementAngle: undefined,
      fallbackAngle: 0
    })
    expect(result).toBe(315)
  })

  it('prefers the post-arrival suggestion when navigation angle is unavailable', () => {
    const result = resolveArrivalOrientation({
      navigationAngle: undefined,
      postArrivalAngle: 720,
      movementAngle: 200,
      fallbackAngle: 0
    })
    expect(result).toBe(0)
  })

  it('falls back to the provided default when no angles are available', () => {
    const result = resolveArrivalOrientation({
      navigationAngle: undefined,
      postArrivalAngle: undefined,
      movementAngle: undefined,
      fallbackAngle: -45
    })
    expect(result).toBe(315)
  })
})
