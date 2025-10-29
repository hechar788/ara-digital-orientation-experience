/**
 * Minimap coordinate catalogue
 *
 * Centralises minimap coordinates for every photo in the tour dataset.
 * Each entry is keyed by the photo identifier and stores a normalised
 * x/y pair that maps to the minimap artwork (0-1 range, origin top-left).
 *
 * @fileoverview Generates a minimap lookup table for tour photo coordinates.
 */

import type { Area, Elevator } from '../../types/tour'
import { getAllAreas } from '../blockUtils'

/**
 * Coordinate value expressed as a fraction of the minimap's width or height.
 *
 * Values should fall between 0 (origin/top-left) and 1 (max width/height).
 * Temporary `null` values indicate the coordinate still needs to be supplied.
 *
 * @typedef NormalizedCoordinate
 */
export type NormalizedCoordinate = number

/**
 * Represents the minimap coordinate for a specific photo.
 *
 * Coordinates use a normalised space in relation to the minimap artwork.
 * Null values signal that coordinates are pending and should be populated later.
 *
 * @property x - Horizontal position ranging from 0 to 1 (null when unset)
 * @property y - Vertical position ranging from 0 to 1 (null when unset)
 */
export interface MinimapCoordinate {
  x: NormalizedCoordinate | null
  y: NormalizedCoordinate | null
}

/**
 * Entry describing a photo and its associated minimap coordinate.
 *
 * Provides a convenient iterable structure for rendering overlays or
 * performing validation across all photos in the tour dataset.
 *
 * @property photoId - Unique tour photo identifier
 * @property coordinate - Normalised minimap coordinate for the photo
 */
export interface MinimapLocationEntry {
  photoId: string
  coordinate: MinimapCoordinate
}

/**
 * Manually curated minimap coordinate overrides.
 *
 * Populate this object with precise coordinates as they are determined.
 * Any missing entries automatically fall back to `{ x: null, y: null }`.
 *
 * @example
 * ```typescript
 * export const MANUAL_MINIMAP_COORDINATES: Partial<Record<string, MinimapCoordinate>> = {
 *   'a-f1-north-entrance': { x: 0.42, y: 0.18 }
 * }
 * ```
 */
/**
 * Editable minimap coordinate table.
 *
 * Update the `x` and `y` values (0 to 1 range) as you map each photo.
 * Leave entries as null until a coordinate has been confirmed.
 */
export const MANUAL_MINIMAP_COORDINATES: Partial<Record<string, MinimapCoordinate>> = {
  'a-block-floor-1-main': { x: 0.5, y: 0.5 },
  'a-block-floor-2-main': { x: null, y: null },
  'a-f1-north-entrance': { x: 0.538, y: 0.525 },
  'a-f1-north-1': { x: 0.538, y: 0.555 },
  'a-f1-north-2': { x: 0.538, y: 0.585 },
  'a-f1-north-3': { x: 0.538, y: 0.615 },
  'a-f1-north-3-side': { x: 0.55, y: 0.615 },
  'a-f1-mid-4': { x: 0.538, y: 0.645 },
  'a-f1-mid-5': { x: 0.538, y: 0.675 },
  'a-f1-south-6': { x: 0.538, y: 0.705 },
  'a-f2-north-stairs-entrance': { x: 0.55, y: 0.585 },
  'a-f2-north-1': { x: 0.56, y: 0.6 },
  'a-f2-north-2': { x: 0.54, y: 0.625 },
  'a-f2-mid-3': { x: 0.54, y: 0.645 },
  'a-f2-mid-4': { x: 0.54, y: 0.675 },
  'a-f2-south-5': { x: 0.54, y: 0.705 },
  'library-f1-entrance': { x: 0.495, y: 0.69 },
  'library-f1-1': { x: 0.495, y: 0.66 },
  'library-f1-2': { x: 0.495, y: 0.64 },
  'library-f1-3': { x: 0.495, y: 0.62 },
  'library-f1-4': { x: 0.495, y: 0.59 },
  'library-f1-5': { x: 0.495, y: 0.56 },
  'library-f1-6': { x: 0.51, y: 0.56 },
  'library-f1-7': { x: 0.51, y: 0.58 },
  'library-f2-1': { x: null, y: null },
  'library-f2-2': { x: null, y: null },
  'library-f2-aside': { x: null, y: null },
  'library-f2-aside-1': { x: null, y: null },
  'library-f2-aside-3': { x: null, y: null },
  'library-f2-aside-4': { x: null, y: null },
  'library-f2-entrance-aside': { x: null, y: null },
  'library-floor-1-main': { x: null, y: null },
  'library-floor-2-main': { x: null, y: null },
  'n-block-floor-1-main': { x: null, y: null },
  'n-block-floor-2-main': { x: null, y: null },
  'n-f1-east-1': { x: 0.405, y: 0.735 },

  'n-f1-east-2': { x: 0.3815, y: 0.735 },
  'n-f1-east-south-3': { x: 0.3815, y: 0.75 },
  'n-f1-east-south-4': { x: 0.3815, y: 0.77 },

  'n-f1-east-5': { x: 0.365, y: 0.735 },
  'n-f1-east-6': { x: 0.355, y: 0.735 },
  'n-f1-mid-7': { x: 0.325, y: 0.735 },
  'n-f1-west-8': { x: 0.305, y: 0.735 },
  'n-f1-west-9': { x: 0.285, y: 0.735 },
  'n-f1-sandys-office': { x: 0.28, y: 0.7425 },

  'n-f2-elevator-entrance': { x: 0.32, y: 0.73 },
  'n-f2-west-1': { x: 0.34, y: 0.73 },
  'n-f2-west-2': { x: 0.36, y: 0.73 },
  'n-f2-mid-3': { x: 0.38, y: 0.73 },
  'n-f2-east-4': { x: 0.4, y: 0.73 },

  'ns-elevator-interior': { x: null, y: null },

  'outside-a-east-1': { x: 0.6725, y: 0.5 },
  'outside-a-east-2': { x: 0.6725, y: 0.515 },
  'outside-a-east-3': { x: 0.6725, y: 0.54 },
  'outside-a-east-4': { x: 0.6525, y: 0.6075 },
  'outside-a-east-5': { x: 0.6525, y: 0.6125 },
  'outside-a-east-6': { x: 0.6525, y: 0.625 },
  'outside-a-north-1': { x: 0.54, y: 0.465 },
  'outside-a-north-2': { x: 0.57, y: 0.465 },
  'outside-a-north-3': { x: 0.605, y: 0.465 },
  'outside-a-north-4': { x: 0.65, y: 0.465 },
  'outside-area': { x: null, y: null },
  'outside-cafeteria-1': { x: null, y: null },
  'outside-cafeteria-2': { x: null, y: null },
  'outside-cafeteria-3': { x: null, y: null },
  'outside-cafeteria-4': { x: null, y: null },
  'outside-cafeteria-5': { x: null, y: null },
  'outside-cafeteria-6': { x: null, y: null },
  'outside-cafeteria-6-aside': { x: null, y: null },
  'outside-cafeteria-7': { x: null, y: null },
  'outside-cafeteria-8': { x: null, y: null },
  'outside-g-mid-1': { x: 0.3575, y: 0.4875 },
  'outside-g-mid-2': { x: 0.3615, y: 0.4875 },
  'outside-g-mid-3': { x: 0.375, y: 0.4875 },
  'outside-g-mid-4': { x: 0.41, y: 0.4875 },
  'outside-g-mid-5': { x: 0.425, y: 0.465 },
  'outside-n-north-1': { x: 0.3575, y: 0.665 },
  'outside-n-north-1-aside': { x: 0.3575, y: 0.635  },
  'outside-n-north-1-aside-1': { x: 0.3575, y: 0.605 },
  'outside-n-north-1-aside-2': { x: 0.3575, y: 0.555 },
  'outside-n-north-2': { x: 0.335, y: 0.665 },
  'outside-n-north-entrance': { x: 0.335, y: 0.69 },
  'outside-s-east-5': { x: 0.195, y: 0.705 },
  'outside-s-east-6': { x: 0.185, y: 0.73 },
  'outside-s-east-7': { x: 0.165, y: 0.755 },
  'outside-s-east-8': { x: 0.15, y: 0.8 },
  'outside-s-east-9': { x: 0.1, y: 0.875 },
  'outside-s-north-1': { x: 0.315, y: 0.665 },
  'outside-s-north-1-aside': { x: 0.2875, y: 0.63 },
  'outside-s-north-1-aside-1': { x: 0.2675, y: 0.6 },
  'outside-s-north-1-aside-2': { x: 0.235, y: 0.55 },
  'outside-s-north-2': { x: 0.285, y: 0.665 },
  'outside-s-north-3': { x: 0.26, y: 0.665 },
  'outside-s-north-4': { x: 0.205, y: 0.69 },
  'outside-s-north-entrance': { x: 0.31, y: 0.69 },
  'outside-t-mid-1': { x: 0.24, y: 0.475 },
  'outside-t-mid-2': { x: 0.265, y: 0.485 },
  'outside-t-mid-3': { x: 0.29, y: 0.485 },
  'outside-tm-1': { x: 0.4475, y: 0.465 },
  'outside-tm-2': { x: 0.465, y: 0.465 },
  'outside-tm-3': { x: 0.5, y: 0.465 },
  'outside-u-mid-1': { x: 0.225, y: 0.65 },
  'outside-u-mid-2': { x: 0.215, y: 0.615 },
  'outside-u-mid-3': { x: 0.215, y: 0.57 },
  'outside-u-mid-4': { x: 0.215, y: 0.535 },
  'outside-u-mid-5': { x: 0.225, y: 0.5 },
  'outside-w-entrance': { x: 0.7, y: 0.355 },
  'outside-w-west-1': { x: 0.665, y: 0.435 },
  'outside-w-west-2': { x: 0.6715, y: 0.355 },
  'outside-w-west-3': { x: 0.6715, y: 0.3 },
  'outside-w-west-4': { x: 0.6715, y: 0.25 },
  'outside-w-west-5': { x: 0.6715, y: 0.2 },

  'outside-x-north-entrance': { x: 0.42, y: 0.695 },
  'outside-x-north-1': { x: 0.415, y: 0.67 },
  'outside-x-north-2': { x: 0.39, y: 0.665 },

  'outside-x-south-entrance': { x: null, y: null },

  's-f1-north-4': { x: 0.25, y: 0.65 },
  's-f1-mid-3': { x: 0.26, y: 0.765 },
  's-f1-south-2': { x: 0.26, y: 0.79 },
  's-f1-south-entrance': { x: 0.26, y: 0.825 },

  's-f2-mid-1': { x: 0.3, y: 0.73 },
  's-f2-mid-2': { x: 0.28, y: 0.73 },
  's-f2-mid-3': { x: 0.27, y: 0.73 },
  's-f2-mid-4': { x: 0.255, y: 0.73 },
  's-f2-south-5': { x: 0.255, y: 0.75 },
  's-f2-south-6': { x: 0.255, y: 0.775 },
  's-f2-south-7': { x: 0.255, y: 0.8 },

  's-f4-corner-5': { x: null, y: null },
  's-f4-mid-2': { x: null, y: null },
  's-f4-mid-3': { x: null, y: null },
  's-f4-mid-4': { x: null, y: null },
  's-f4-north-6': { x: null, y: null },
  's-f4-north-7': { x: null, y: null },
  's-f4-north-8': { x: null, y: null },
  's-f4-switch-2': { x: null, y: null },
  's-f4-switch-3': { x: null, y: null },
  's-f4-switch-4': { x: null, y: null },
  's-f4-switch-5': { x: null, y: null },
  's-f4-switch-6': { x: null, y: null },
  's453-classroom': { x: null, y: null },
  'sandys-office': { x: null, y: null },
  'student-lounge-area': { x: null, y: null },
  'student-lounge-madras-street-entrance': { x: null, y: null },
  'switch-room': { x: null, y: null },
  'w-f1-main-entrance': { x: 0.73, y: 0.355 },
  'w-f1-main-1': { x: 0.735, y: 0.315 },
  'w-f1-main-2': { x: 0.735, y: 0.300 },
  'w-f1-main-3': { x: 0.735, y: 0.290 },
  'w-f1-main-3-aside': { x: null, y: null },
  'w-f1-main-3-aside-1': { x: null, y: null },
  'w-f1-main-3-aside-2': { x: null, y: null },
  'w-f2-entry': { x: 0.725, y: 0.3 },
  'w-f2-1': { x: 0.725, y: 0.295 },
  'w-f2-2': { x: 0.725, y: 0.285 },
  'w-f2-3': { x: 0.725, y: 0.275 },
  'w-f2-4': { x: 0.71, y: 0.275 },
  'w-f2-5': { x: 0.71, y: 0.265 },
  'w-f2-6': { x: 0.71, y: 0.230 },
  'w-f2-7': { x: 0.71, y: 0.2 },
  'w-gym-entry': { x: 0.735, y: 0.280 },
  'w-gym-center': { x: 0.75, y: 0.225 },
  'w-gym-overlook': { x: 0.745, y: 0.285 },
  'w-gym-overlook-1': { x: 0.76, y: 0.285 },
  'x-elevator-interior': { x: 0.495, y: 0.745 },
  'x-f1-east-1': { x: 0.538, y: 0.73 },
  'x-f1-east-2': { x: 0.528, y: 0.735 },
  'x-f1-east-3': { x: 0.518, y: 0.735 },
  'x-f1-east-4': { x: 0.508, y: 0.735 },
  'x-f1-mid-5': { x: 0.498, y: 0.735 },

  'x-f1-mid-6': { x: 0.488, y: 0.735 },
  'x-f1-mid-6-aside': { x: 0.488, y: 0.745 },
  'x-f1-mid-6-library': { x: 0.488, y: 0.71 },

  'x-f1-mid-7': { x: 0.478, y: 0.735 },
  'x-f1-mid-8': { x: 0.468, y: 0.735 },
  'x-f1-west-9': { x: 0.458, y: 0.735 },
  'x-f1-west-10': { x: 0.448, y: 0.735 },
  'x-f1-west-11': { x: 0.438, y: 0.735 },
  'x-f1-west-12': { x: 0.428, y: 0.735 },
  'n-f1-x-entry': { x: 0.42, y: 0.735 },

  'x-f2-east-13': { x: 0.54, y: 0.74 },
  'x-f2-east-12': { x: 0.53, y: 0.74 },
  'x-f2-east-11': { x: 0.52, y: 0.74 },
  'x-f2-mid-10': { x: 0.51, y: 0.74 },
  'x-f2-mid-7': { x: 0.5, y: 0.74 },
  'x-f2-mid-7-aside': { x: 0.5, y: 0.75 },
  'x-f2-mid-7-aside-1': { x: 0.5075, y: 0.7525 },
  'x-f2-mid-8': { x: 0.5, y: 0.73 },
  'x-f2-north-9': { x: 0.5, y: 0.72 },
  'x-f2-north-9-aside': { x: 0.495, y: 0.72 },
  'x-f2-west-6': { x: 0.49, y: 0.74 },
  'x-f2-west-5': { x: 0.48, y: 0.74 },
  'x-f2-west-5-aside': { x: 0.48, y: 0.75 },
  'x-f2-west-4': { x: 0.47, y: 0.74 },
  'x-f2-west-3': { x: 0.46, y: 0.74 },
  'x-f2-west-3-aside': { x: 0.46, y: 0.75 },
  'x-f2-west-2': { x: 0.45, y: 0.74 },
  'x-f2-west-1': { x: 0.44, y: 0.74 },
  'x-f2-north-entry': { x: 0.42, y: 0.73 },
  


  'x-f3-west-entry': { x: 0.42, y: 0.73 },

  'x-f3-west-1': { x: 0.43, y: 0.73 },
  'x-f3-west-1-aside': { x: 0.43, y: 0.7425 },
  'x-303-classroom': { x: 0.435, y: 0.75 },

  'x-f3-west-2': { x: 0.44, y: 0.73 },
  'x-f3-mid-4': { x: 0.45, y: 0.73 },
  'x-f3-mid-5': { x: 0.46, y: 0.73 },
  'x-f3-east-6': { x: 0.47, y: 0.73 },
  'x-f3-east-7': { x: 0.48, y: 0.735 },
  'x-f3-east-8': { x: 0.48, y: 0.745 },
  
  
  
}

/**
 * Collect every tour photo identifier from area and elevator definitions.
 *
 * @returns Sorted array of unique tour photo identifiers
 */
function collectPhotoIds(): string[] {
  const photoIds = new Set<string>()
  const allAreas = getAllAreas()

  allAreas.forEach(areaOrElevator => {
    if (isArea(areaOrElevator)) {
      areaOrElevator.photos.forEach(photo => {
        photoIds.add(photo.id)
      })
    } else {
      photoIds.add(areaOrElevator.photo.id)
    }
  })

  return Array.from(photoIds).sort((a, b) => a.localeCompare(b))
}

/**
 * Type guard to determine if the supplied value is an Area.
 *
 * @param value - Area or Elevator instance from the tour dataset
 * @returns True when the value is an Area, false when it is an Elevator
 */
function isArea(value: Area | Elevator): value is Area {
  return (value as Area).photos !== undefined
}

/**
 * Sorted list of every tour photo identifier.
 *
 * Useful for bulk-editing coordinates or building debugging tools.
 */
export const MINIMAP_PHOTO_IDS: readonly string[] = collectPhotoIds()

/**
 * Complete collection of minimap catalogue entries.
 *
 * Combines the generated photo identifiers with manually defined coordinates,
 * defaulting to null coordinate placeholders when values are missing.
 */
export const MINIMAP_LOCATION_ENTRIES: MinimapLocationEntry[] = MINIMAP_PHOTO_IDS.map(photoId => ({
  photoId,
  coordinate: MANUAL_MINIMAP_COORDINATES[photoId] ?? { x: null, y: null }
}))

/**
 * Record of minimap coordinates keyed by photo identifier.
 *
 * Enables fast lookups when rendering markers or resolving the user's location.
 */
export const MINIMAP_LOCATIONS: Record<string, MinimapCoordinate> = Object.fromEntries(
  MINIMAP_LOCATION_ENTRIES.map(entry => [entry.photoId, entry.coordinate])
) as Record<string, MinimapCoordinate>

/**
 * Retrieve the minimap coordinate for a photo when available.
 *
 * @param photoId - Unique photo identifier to query
 * @returns Coordinate object when both axes are present, otherwise null
 *
 * @example
 * ```typescript
 * const coordinate = getMinimapCoordinate('a-f1-north-entrance')
 * if (coordinate) {
 *   console.log(coordinate.x, coordinate.y)
 * }
 * ```
 */
export function getMinimapCoordinate(photoId: string): MinimapCoordinate | null {
  const coordinate = MINIMAP_LOCATIONS[photoId]

  if (!coordinate || coordinate.x === null || coordinate.y === null) {
    return null
  }

  return coordinate
}

/**
 * Produce a list of photo identifiers that still need coordinates.
 *
 * @returns Array of photo IDs with null coordinate placeholders
 *
 * @example
 * ```typescript
 * const todo = listUnmappedPhotoIds()
 * console.log(`Photos needing coordinates: ${todo.length}`)
 * ```
 */
export function listUnmappedPhotoIds(): string[] {
  return MINIMAP_LOCATION_ENTRIES
    .filter(entry => entry.coordinate.x === null || entry.coordinate.y === null)
    .map(entry => entry.photoId)
}
