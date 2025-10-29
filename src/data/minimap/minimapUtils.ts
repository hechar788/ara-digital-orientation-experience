/**
 * Minimap coordinate utilities
 *
 * Convenience helpers that expose the minimap coordinate catalogue and
 * provide ergonomic wrappers for resolving coordinates in the UI layer.
 *
 * @fileoverview Helper functions for working with minimap location data.
 */

import {
  getMinimapCoordinate as getCoordinateInternal,
  listUnmappedPhotoIds as listUnmappedInternal,
  MINIMAP_LOCATIONS,
  MINIMAP_LOCATION_ENTRIES
} from './minimapLocations'
import type { MinimapCoordinate, MinimapLocationEntry } from './minimapLocations'

/**
 * Resolved minimap coordinate wrapper.
 *
 * Returned by {@link resolveMinimapCoordinate} to bundle the photo identifier
 * with the optional coordinate payload.
 *
 * @property photoId - Photo identifier that was requested
 * @property coordinate - Coordinate value when available, otherwise null
 */
export interface ResolvedMinimapCoordinate {
  photoId: string
  coordinate: MinimapCoordinate | null
}

/**
 * Resolve the minimap coordinate for a given photo.
 *
 * @param photoId - Photo identifier to resolve
 * @returns Object containing the requested photo ID and its coordinate (if present)
 *
 * @example
 * ```typescript
 * const { coordinate } = resolveMinimapCoordinate('a-f1-north-entrance')
 * if (coordinate) {
 *   console.log(coordinate.x, coordinate.y)
 * }
 * ```
 */
export function resolveMinimapCoordinate(photoId: string): ResolvedMinimapCoordinate {
  return {
    photoId,
    coordinate: getCoordinateInternal(photoId)
  }
}

/**
 * Convenience wrapper for retrieving a minimap coordinate by photo ID.
 *
 * Delegates to the underlying catalogue so consumers do not need to import
 * from multiple modules.
 *
 * @param photoId - Photo identifier to look up
 * @returns Minimap coordinate when available, otherwise null
 */
export function getMinimapCoordinate(photoId: string): MinimapCoordinate | null {
  return getCoordinateInternal(photoId)
}

/**
 * Convenience wrapper that lists photo IDs lacking coordinate assignments.
 *
 * Helpful during implementation to quickly locate photos that still need
 * their minimap positions defined.
 *
 * @returns Array of photo identifiers without coordinates
 */
export function listUnmappedPhotoIds(): string[] {
  return listUnmappedInternal()
}

/**
 * Minimap coordinate lookup table keyed by photo ID.
 *
 * Re-exported to keep all minimap helpers accessible from a single module.
 */
export const MINIMAP_COORDINATE_LOOKUP: Record<string, MinimapCoordinate> = MINIMAP_LOCATIONS

/**
 * Array of minimap catalogue entries pairing photo IDs with coordinates.
 *
 * Useful for iterating through every photo in the dataset.
 */
export const MINIMAP_COORDINATE_ENTRIES: MinimapLocationEntry[] = MINIMAP_LOCATION_ENTRIES

/**
 * Re-export of the minimap coordinate type for downstream consumers.
 */
export type { MinimapCoordinate } from './minimapLocations'

/**
 * Re-export of the minimap location entry type for downstream consumers.
 */
export type { MinimapLocationEntry } from './minimapLocations'
