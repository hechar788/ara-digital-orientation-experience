import { describe, expect, it } from 'vitest'
import { getDirectionAngle } from '../directionUtils'
import { findPhotoById } from '../../../data/blockUtils'

describe('getDirectionAngle', () => {
  it('applies the forward override for w-gym-entry', () => {
    const photo = findPhotoById('w-gym-entry')
    expect(photo).not.toBeNull()
    expect(getDirectionAngle(photo!, 'forward')).toBe(0)
  })

  it('applies the door override for w-gym-entry', () => {
    const photo = findPhotoById('w-gym-entry')
    expect(photo).not.toBeNull()
    expect(getDirectionAngle(photo!, 'door')).toBe(150)
  })
})
