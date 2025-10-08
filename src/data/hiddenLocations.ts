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
 * Architecture:
 * - Centralized: All race data in one file
 * - Injected at runtime: PanoramicHotspots filters by currentPhoto.id
 * - State-driven: Found locations tracked in useRaceState hook
 *
 * To add a hidden location:
 * 1. Choose a photo ID from tour data
 * 2. Determine 3D position (x, y, z) on sphere
 * 3. Add entry to array below with unique id, name, description
 */
export const hiddenLocations: HiddenLocationHotspot[] = [
  {
    id: 'dean-office',
    name: "Dean's Office",
    description: 'The administrative heart of the campus',
    photoId: 'n-f1-mid-7', // Temporary - update with actual photo
    position: { x: 3, y: 0, z: 2 } // Temporary - update with actual coordinates
  },
  {
    id: 'library-study-room',
    name: 'Secret Study Room',
    description: 'A quiet sanctuary for focused learning',
    photoId: 'library-f1-main',
    position: { x: -2, y: 0.5, z: 3 }
  },
  {
    id: 'gym-equipment',
    name: 'Gym Equipment Storage',
    description: 'Where all the athletic gear is kept',
    photoId: 'gym-main',
    position: { x: 4, y: -0.5, z: 1 }
  },
  {
    id: 'rooftop-access',
    name: 'Rooftop Access Point',
    description: 'The gateway to stunning campus views',
    photoId: 'x-f3-north-1',
    position: { x: -3, y: 1, z: -2 }
  },
  {
    id: 'science-lab',
    name: 'Advanced Science Lab',
    description: 'Where scientific discoveries are made',
    photoId: 's-f4-mid-2',
    position: { x: 2, y: 0, z: -3 }
  },
  {
    id: 'art-studio',
    name: 'Creative Arts Studio',
    description: 'A space for artistic expression and creation',
    photoId: 'a-f2-north-1',
    position: { x: -4, y: 0.5, z: 0 }
  },
  {
    id: 'computer-lab',
    name: 'Innovation Computer Lab',
    description: 'Cutting-edge technology for student projects',
    photoId: 'x-f2-mid-3',
    position: { x: 1, y: 0, z: 4 }
  },
  {
    id: 'student-lounge-hidden',
    name: 'Hidden Student Lounge',
    description: 'A cozy retreat for student relaxation',
    photoId: 'student-lounge-main',
    position: { x: 0, y: -0.5, z: -4 }
  },
  {
    id: 'music-practice',
    name: 'Music Practice Room',
    description: 'Where melodies come to life',
    photoId: 'w-f2-mid-2',
    position: { x: -1, y: 0.5, z: 3 }
  },
  {
    id: 'historic-plaque',
    name: 'Historic Campus Plaque',
    description: 'A piece of campus history preserved in time',
    photoId: 'outside-main-entrance',
    position: { x: 3, y: -1, z: -1 }
  }
]

/**
 * Total number of hidden locations available in the race
 */
export const TOTAL_HIDDEN_LOCATIONS = hiddenLocations.length

/**
 * Get hidden locations for a specific photo ID
 *
 * Filters the complete list of hidden locations to only those
 * that should be rendered in the specified photo.
 *
 * @param photoId - ID of the current photo
 * @returns Array of hidden locations for this photo
 *
 * @example
 * ```typescript
 * const locations = getHiddenLocationsForPhoto('n-f1-mid-7')
 * // Returns: [{ id: 'dean-office', ... }]
 * ```
 */
export function getHiddenLocationsForPhoto(photoId: string): HiddenLocationHotspot[] {
  return hiddenLocations.filter(location => location.photoId === photoId)
}
