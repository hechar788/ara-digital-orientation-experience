/**
 * Hidden Location Definitions for The Amazing Race
 *
 * Centralized repository of all hidden locations for race mode.
 * Each location references a specific photoId for runtime injection,
 * maintaining clean separation from tour navigation data.
 *
 * Hidden locations are filtered by current photo ID and only rendered
 * during race mode. Once found, they are tracked in race state and
 * removed from rendering.
 *
 * @fileoverview Hidden location hotspot definitions for race game mode
 */

import type { HiddenLocationHotspot } from '../types/tour'

/**
 * Array of all hidden locations for The Amazing Race
 *
 * These locations are strategically distributed across different buildings
 * and floors to encourage campus exploration during race mode.
 *
 * Each hidden location can appear in multiple photos, representing different
 * vantage points of the same location. Once found in any photo, the location
 * is marked as discovered and won't appear in other photos.
 *
 * Architecture:
 * - Centralized: All race data in one file
 * - Injected at runtime: PanoramicHotspots filters by currentPhoto.id
 * - State-driven: Found locations tracked in useRaceState hook
 * - Multi-appearance: Same location visible from multiple photos
 *
 * To add a hidden location:
 * 1. Choose unique ID, name, and description
 * 2. Add appearance entries with photoId and position (x, y, z) on sphere
 * 3. Can add multiple appearances for the same location in different photos
 */
export const hiddenLocations: HiddenLocationHotspot[] = [
  {
    id: 'library-study-room',
    name: 'The Pod',
    description: 'A quiet computing sanctuary for focused learning.',
    appearances: [
      {
        photoId: 'library-f1-7',
        position: { x: 4.5, y: -0.5, z: 3 }
      },
      {
        photoId: 'library-f1-6',
        position: { x: -4.5, y: -0.5, z: 2 }
      }
    ]
  },
  {
    id: 'rec-centre-hidden',
    name: 'The Recreation Centre',
    description: 'Home of the athletes and sporting enthusiasts.',
    appearances: [
      {
        photoId: 'gym-main',
        position: { x: 4, y: -0.5, z: 1 }
      }
    ]
  },
  {
    id: 'bird-statue',
    name: 'The Bird Statue... ?',
    description: 'What a hoot! Now thats chirp-tacular!',
    appearances: [
      {
        photoId: 'outside-s-north-1',
        position: { x: -5.35, y: 1.75, z: -5 }
      },
      {
        photoId: 'outside-s-north-1-aside',
        position: { x: -3.5, y: 4, z: -0.5 }
      },
      {
        photoId: 'outside-s-north-1-aside-1',
        position: { x: 6, y: 2, z: 0.65 }
      }
    ]
  },
  {
    id: 'student-lounge-hidden',
    name: 'Student Lounge',
    description: 'A cozy retreat for student relaxation',
    appearances: [
      {
        photoId: 'student-lounge-main',
        position: { x: 0, y: -0.5, z: -4 }
      }
    ]
  }
]

/**
 * Total number of hidden locations available in the race
 */
export const TOTAL_HIDDEN_LOCATIONS = hiddenLocations.length

/**
 * Hidden location with resolved position for a specific photo
 *
 * Flattened structure used by rendering system, containing the location
 * metadata along with the specific position for the current photo.
 *
 * @property id - Unique identifier for the hidden location
 * @property name - Display name for the location
 * @property description - Descriptive text about the location
 * @property position - 3D position specific to this photo view
 */
export interface HiddenLocationForPhoto {
  id: string
  name: string
  description: string
  position: {
    x: number
    y: number
    z: number
  }
}

/**
 * Get hidden locations visible in a specific photo
 *
 * Filters the complete list of hidden locations to only those with
 * appearances in the specified photo, and returns them with the
 * position specific to that photo view.
 *
 * @param photoId - ID of the current photo
 * @returns Array of hidden locations visible in this photo with resolved positions
 *
 * @example
 * ```typescript
 * const locations = getHiddenLocationsForPhoto('library-f1-main')
 * // Returns: [{ id: 'library-study-room', name: '...', position: { x, y, z } }]
 * ```
 */
export function getHiddenLocationsForPhoto(photoId: string): HiddenLocationForPhoto[] {
  const result: HiddenLocationForPhoto[] = []

  for (const location of hiddenLocations) {
    // Find if this location has an appearance in the current photo
    const appearance = location.appearances.find(app => app.photoId === photoId)

    if (appearance) {
      // Add the location with its position specific to this photo
      result.push({
        id: location.id,
        name: location.name,
        description: location.description,
        position: appearance.position
      })
    }
  }

  return result
}
