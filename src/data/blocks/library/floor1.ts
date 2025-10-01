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
        door: 'x-f1-mid-6-library'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 0, y: -0.35, z: 3 },  // TODO: Set correct position
          destination: 'x-f1-mid-6-library'
        }
      ]
    }
  ]
}
