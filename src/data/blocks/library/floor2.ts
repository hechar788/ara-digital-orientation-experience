/**
 * Library Floor 2 Area Definition
 *
 * Defines the second floor area of the Library.
 *
 * @fileoverview Contains route definition for Library Floor 2 with
 * navigation connections and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * Library Floor 2 Route
 *
 * Covers the second floor area of the Library.
 *
 * Key features:
 * - Second floor access
 * - Study areas and collections
 */
export const libraryFloor2Area: Area = {
  id: 'library-floor-2-main',
  name: 'Library',
  buildingBlock: 'x',
  floorLevel: 2,
  photos: [
    {
      id: 'library-f2-entrance',
      imageUrl: '/360_photos_compressed/library/library_floor2_entrance.webp',
      startingAngle: 0,
      directions: {
        forward: { angle: 0, connection: 'library-f2-1' },
        right: { angle: 105, connection: 'library-f2-aside' },
        left: { angle: 270, connection: 'library-f2-entrance-aside' },
        down: 'library-f1-1'
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: -3, y: -0.5, z: 0.35 }  // Stairs
        }
      ]
    },
    {
      id: 'library-f2-entrance-aside',
      imageUrl: '/360_photos_compressed/library/library_floor2_entrance_aside.webp',
      directions: {
        back: { angle: 180, connection: 'library-f2-entrance' }
      }
    },
    {
      id: 'library-f2-aside',
      imageUrl: '/360_photos_compressed/library/library_floor2_aside.webp',
      directions: {
        forward: { angle: 0, connection: 'library-f2-aside-1' },
        back: { angle: 90, connection: 'library-f2-entrance' }
      }
    },
    {
      id: 'library-f2-aside-1',
      imageUrl: '/360_photos_compressed/library/library_floor2_aside_1.webp',
      directions: {
        forward: { angle: 320, connection: 'library-f2-aside-3' },
        back: { angle: 230, connection: 'library-f2-aside' },
        door: 'x-f2-north-9'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 2, y: -0.15, z: 3 },
          destination: 'x-f2-north-9'
        }
      ]
    },
    {
      id: 'library-f2-aside-3',
      imageUrl: '/360_photos_compressed/library/library_floor2_aside_3.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'library-f2-aside-4' },
        back: { angle: 90, connection: 'library-f2-aside-1' }
      }
    },
    {
      id: 'library-f2-aside-4',
      imageUrl: '/360_photos_compressed/library/library_floor2_aside_4.webp',
      startingAngle: 180,
      directions: {
        left: { angle: 90, connection: 'library-f2-entrance' },
        back: { angle: 0, connection: 'library-f2-aside-3' }
      }
    },
    {
      id: 'library-f2-1',
      imageUrl: '/360_photos_compressed/library/library_floor2_1.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'library-f2-2' },
        back: { angle: 0, connection: 'library-f2-entrance' }
      }
    },
    {
      id: 'library-f2-2',
      imageUrl: '/360_photos_compressed/library/library_floor2_2.webp',
      startingAngle: 180,
      directions: {
        back: { angle: 90, connection: 'library-f2-1' }
      }
    }
  ]
}
