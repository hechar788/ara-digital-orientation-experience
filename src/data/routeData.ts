/**
 * VR Campus Tour Route Data
 *
 * Defines photo sequences and directional connections for navigation between
 * 360° panoramic images in the campus tour. Each route represents a logical
 * path through a building or area with connected photos.
 *
 * @fileoverview Contains route definitions for A Block (floors 1-2) with
 * navigation connections, building context, and access points.
 */

import type { Area, Photo } from '../types/tour'

/**
 * A Block Floor 1 Main Corridor Route
 *
 * Covers the main hallway on the ground floor of A Block, starting from
 * the north entrance and proceeding south through the corridor system.
 *
 * Navigation flow:
 * North Entrance → North Wing → Side Corridor Branch → Middle Sections → South Wing
 *
 * Key features:
 * - Side corridor access at north-3
 * - Stair access to floor 2 at mid-4
 * - Building entrance and exit points
 */
export const aBlockFloor1Area: Area = {
  id: 'a-block-floor-1-main',
  name: 'A Block',
  buildingBlock: 'a',
  floorLevel: 1,
  photos: [
    {
      id: 'a-f1-north-entrance',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_entrance.webp',
      connections: {
        forward: 'a-f1-north-1'
      },
      buildingContext: {
        wing: 'north',
        facilities: ['main entrance', 'information desk']
      }
    },
    {
      id: 'a-f1-north-1',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_1.webp',
      connections: {
        forward: 'a-f1-north-2',
        back: 'a-f1-north-entrance'
      }
    },
    {
      id: 'a-f1-north-2',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_2.webp',
      connections: {
        forward: 'a-f1-north-3',
        back: 'a-f1-north-1',
        right: 'a-f1-north-3-side'
      }
    },
    {
      id: 'a-f1-north-3-side',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_3_side.webp',
      connections: {
        left: 'a-f1-north-2',
        forward: 'a-f1-north-3'
      }
    },
    {
      id: 'a-f1-north-3',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_3.webp',
      connections: {
        forward: 'a-f1-mid-4',
        back: 'a-f1-north-2',
        left: 'a-f1-north-3-side'
      }
    },
    {
      id: 'a-f1-mid-4',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_mid_4.webp',
      connections: {
        forward: 'a-f1-mid-5',
        back: 'a-f1-north-3',
        up: 'a-f2-mid-4'
      },
      hotspots: [
        {
          direction: 'up',
          position: { theta: 90, phi: 45 }  // Example coordinates - adjust based on actual image
        }
      ]
    },
    {
      id: 'a-f1-mid-5',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_mid_5.webp',
      connections: {
        forward: 'a-f1-south',
        back: 'a-f1-mid-4'
      }
    },
    {
      id: 'a-f1-south',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_south.webp',
      connections: {
        back: 'a-f1-mid-5'
      },
      buildingContext: {
        wing: 'south',
        facilities: ['restrooms', 'water fountain']
      }
    }
  ],
  accessibleFromAreas: ['a-block-floor-2-main']
}




/**
 * A Block Floor 2 Main Corridor Route
 *
 * Covers the main hallway on the second floor of A Block, accessible via
 * stairs from floor 1. Follows similar layout to floor 1 but with different
 * room configurations and facilities.
 *
 * Navigation flow:
 * North Wing → Stair Access → Middle Sections → South Wing
 *
 * Key features:
 * - Multiple stair connection points to floor 1
 * - Classroom and office areas
 * - Faculty facilities in south wing
 */
export const aBlockFloor2Area: Area = {
  id: 'a-block-floor-2-main',
  name: 'A Block',
  buildingBlock: 'a',
  floorLevel: 2,
  photos: [
    {
      id: 'a-f2-north-1',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_north_1.webp',
      connections: {
        forward: 'a-f2-north-2'
      },
      buildingContext: {
        wing: 'north',
        facilities: ['classrooms', 'offices']
      }
    },
    {
      id: 'a-f2-north-2',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_north_2.webp',
      connections: {
        forward: 'a-f2-north-stairs-entrance',
        back: 'a-f2-north-1'
      }
    },
    {
      id: 'a-f2-north-stairs-entrance',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_north_stairs_entrance.webp',
      connections: {
        forward: 'a-f2-mid-3',
        back: 'a-f2-north-2',
        down: 'a-f1-mid-4'
      },
      hotspots: [
        {
          direction: 'down',
          position: { theta: 180, phi: 135 }  // Example coordinates - adjust based on actual image
        }
      ]
    },
    {
      id: 'a-f2-mid-3',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_mid_3.webp',
      connections: {
        forward: 'a-f2-mid-4',
        back: 'a-f2-north-stairs-entrance'
      }
    },
    {
      id: 'a-f2-mid-4',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_mid_4.webp',
      connections: {
        forward: 'a-f2-south-5',
        back: 'a-f2-mid-3',
        down: 'a-f1-mid-4'
      },
      hotspots: [
        {
          direction: 'down',
          position: { theta: 270, phi: 120 }  // Example coordinates - adjust based on actual image
        }
      ]
    },
    {
      id: 'a-f2-south-5',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_south_5.webp',
      connections: {
        back: 'a-f2-mid-4'
      },
      buildingContext: {
        wing: 'south',
        facilities: ['classrooms', 'faculty offices']
      }
    }
  ],
  accessibleFromAreas: ['a-block-floor-1-main']
}

// ============================================================================
// Route Collections & Exports
// ============================================================================

/**
 * Collection of all A Block areas (floors 1-2)
 *
 * Contains both floor areas with their complete photo sequences and
 * navigation connections. Used as the primary export for A Block navigation.
 */
export const aBlockAreas: Area[] = [
  aBlockFloor1Area,
  aBlockFloor2Area
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all available areas in the tour system
 *
 * Currently returns A Block areas, but will expand to include N/S Block
 * and X Block areas as they are implemented.
 *
 * @returns Array of all area definitions
 */
export const getAllAreas = (): Area[] => {
  return [...aBlockAreas]
}

/**
 * Find a specific photo by its unique ID across all areas
 *
 * Searches through all area photos to locate a photo by ID. Useful for
 * navigation logic and photo lookups.
 *
 * @param photoId - Unique photo identifier (e.g., "a-f1-north-entrance")
 * @returns Photo object if found, null if not found
 *
 * @example
 * ```typescript
 * const photo = findPhotoById('a-f1-north-entrance')
 * if (photo) {
 *   console.log(`Found photo: ${photo.imageUrl}`)
 * }
 * ```
 */
export const findPhotoById = (photoId: string): Photo | null => {
  for (const area of getAllAreas()) {
    const photo = area.photos.find(p => p.id === photoId)
    if (photo) return photo
  }
  return null
}

/**
 * Get all available navigation directions from a photo location
 *
 * Analyzes a photo's connections object to determine which directional
 * navigation options are available (forward, back, left, right, up, down).
 *
 * @param photoId - Photo ID to check connections for
 * @returns Array of available direction strings
 *
 * @example
 * ```typescript
 * const directions = getAvailableDirections('a-f1-north-2')
 * // Returns: ['forward', 'back', 'right']
 * ```
 */
export const getAvailableDirections = (photoId: string): string[] => {
  const photo = findPhotoById(photoId)
  if (!photo) return []

  return Object.keys(photo.connections).filter(direction =>
    photo.connections[direction as keyof typeof photo.connections]
  )
}