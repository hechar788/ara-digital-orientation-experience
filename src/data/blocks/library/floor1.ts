/**
 * Library Floor 1 Area Definition
 *
 * Defines the main entrance area on the first floor of the Library.
 *
 * @fileoverview Contains route definition for Library Floor 1 with
 * navigation connections and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * Library Floor 1 Main Entrance Route
 *
 * Covers the main entrance area on the first floor of the Library.
 *
 * Key features:
 * - Main entrance access
 * - Connection to X Block
 */
export const libraryFloor1Area: Area = {
  id: 'library-floor-1-main',
  name: 'Library',
  buildingBlock: 'x',
  floorLevel: 1,
  photos: [
    {
      id: 'library-f1-entrance',
      imageUrl: '/360_photos_compressed/library/library_floor1_entrance.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'library-f1-1' },
        door: 'x-f1-mid-6-library',
        up: 'library-f2-entrance'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 0, y: -0.35, z: 3 },
          destination: 'x-f1-mid-6-library'
        },
        {
          direction: 'up',
          position: { x: -5, y: 0, z: 5 }  // Stairs
        }
      ]
    },
    {
      id: 'library-f1-1',
      imageUrl: '/360_photos_compressed/library/library_floor1_1.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'library-f1-2' },
        back: { angle: 0, connection: 'library-f1-entrance' },
        door: 'x-f1-mid-6-library',
        up: 'library-f2-entrance'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 3.75, y: -0.35, z: 2.5 },
          destination: 'x-f1-mid-6-library'
        },
        {
          direction: 'up',
          position: { x: -2, y: 0, z: 4 }  // Stairs
        }
      ]
    },
    {
      id: 'library-f1-2',
      imageUrl: '/360_photos_compressed/library/library_floor1_2.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'library-f1-3' },
        back: { angle: 0, connection: 'library-f1-1' }
      }
    },
    {
      id: 'library-f1-3',
      imageUrl: '/360_photos_compressed/library/library_floor1_3.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'library-f1-4' },
        back: { angle: 0, connection: 'library-f1-2' }
      }
    },
    {
      id: 'library-f1-4',
      imageUrl: '/360_photos_compressed/library/library_floor1_4.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'library-f1-5' },
        right: { angle: 270, connection: 'library-f1-7' },
        back: { angle: 0, connection: 'library-f1-3' }
      }
    },
    {
      id: 'library-f1-5',
      imageUrl: '/360_photos_compressed/library/library_floor1_5.webp',
      startingAngle: 180,
      directions: {
        right: { angle: 270, connection: 'library-f1-6' },
        back: { angle: 0, connection: 'library-f1-4' }
      }
    },
    {
      id: 'library-f1-6',
      imageUrl: '/360_photos_compressed/library/library_floor1_6.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'library-f1-7' },
        back: { angle: 270, connection: 'library-f1-5' }
      }
    },
    {
      id: 'library-f1-7',
      imageUrl: '/360_photos_compressed/library/library_floor1_7.webp',
      startingAngle: 180,
      directions: {
        right: { angle: 270, connection: 'library-f1-4' },
        back: { angle: 0, connection: 'library-f1-6' }
      }
    }
  ]
}
