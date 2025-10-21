import type { DirectionType, Photo } from '../../types/tour'
import { DIRECTION_ANGLES } from '../../types/tour'
import { ARROW_OVERRIDES } from './directionOverrides'

const HORIZONTAL_DIRECTIONS: DirectionType[] = [
  'forward',
  'forwardRight',
  'right',
  'backRight',
  'back',
  'backLeft',
  'left',
  'forwardLeft'
]

const VERTICAL_DIRECTIONS: DirectionType[] = ['up', 'down', 'elevator', 'door']
const FLOOR_DIRECTIONS: DirectionType[] = ['floor1', 'floor2', 'floor3', 'floor4']

function findOverrideAngle(photo: Photo, direction: DirectionType): number | undefined {
  const override = ARROW_OVERRIDES.find(entry => entry.matches(photo, direction))
  return override?.angle
}

/**
 * Resolve the absolute angle for a navigation direction within a photo.
 *
 * Applies explicit overrides when available and falls back to the
 * startingAngle + DIRECTION_ANGLES offset otherwise.
 */
export function getDirectionAngle(photo: Photo, direction: DirectionType): number {
  const override = findOverrideAngle(photo, direction)
  if (override !== undefined) {
    return override
  }
  const startingAngle = photo.startingAngle ?? 0
  const offset = DIRECTION_ANGLES[direction] ?? 0
  return (startingAngle + offset) % 360
}

/**
 * Determine whether a direction represents horizontal movement.
 */
export function isHorizontalDirection(direction: DirectionType): boolean {
  return HORIZONTAL_DIRECTIONS.includes(direction)
}

/**
 * Determine whether a direction represents vertical movement.
 */
export function isVerticalDirection(direction: DirectionType): boolean {
  return VERTICAL_DIRECTIONS.includes(direction)
}

/**
 * Identify which direction from a photo leads to the specified target photo.
 */
export function findDirectionToTarget(photo: Photo, targetPhotoId: string): DirectionType | null {
  for (const direction of HORIZONTAL_DIRECTIONS) {
    const directionData = photo.directions[direction]
    if (typeof directionData === 'object' && directionData !== null && 'connection' in directionData) {
      if ((directionData as { connection: string }).connection === targetPhotoId) {
        return direction
      }
    }
  }

  for (const direction of VERTICAL_DIRECTIONS) {
    const directionData = photo.directions[direction]
    if (!directionData) continue
    if (Array.isArray(directionData)) {
      if (directionData.includes(targetPhotoId)) {
        return direction
      }
    } else if (directionData === targetPhotoId) {
      return direction
    }
  }

  for (const direction of FLOOR_DIRECTIONS) {
    const directionData = photo.directions[direction]
    if (directionData === targetPhotoId) {
      return direction
    }
  }

  return null
}
