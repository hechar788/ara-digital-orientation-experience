import type { DirectionType, Photo } from '../../types/tour'

export interface ArrowOverride {
  matches(photo: Photo, direction: DirectionType): boolean
  angle: number
}

/**
 * Explicit angle overrides for arrows whose visual orientation differs from
 * the default startingAngle + offset calculation.
 */
export const ARROW_OVERRIDES: ArrowOverride[] = [
  {
    matches: (photo, direction) =>
      photo.id === 'w-f1-main-entrance' && direction === 'forwardLeft',
    angle: 155
  },
  {
    matches: (photo, direction) =>
      photo.id === 'w-f1-main-2' && direction === 'door',
    angle: 330
  },
  {
    matches: (photo, direction) =>
      photo.id === 'w-f1-main-3' && direction === 'door',
    angle: 330
  },
  {
    matches: (photo, direction) =>
      photo.id === 'w-gym-entry' && direction === 'door',
    angle: 150
  },
  {
    matches: (photo, direction) =>
      photo.id === 'w-gym-entry' && direction === 'forward',
    angle: 220
  }
]
