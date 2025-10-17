/**
 * W Block Floor 2 Area Definition
 *
 * Defines the second floor of W Block.
 *
 * @fileoverview Contains route definition for W Block Floor 2 with
 * navigation connections, building context, and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * W Block Floor 2 Main Corridor Route
 *
 * Covers the main corridor on the second floor of W Block.
 *
 * Navigation flow:
 * Floor 2 Entry ↔ Floor 2 Corridor ↔ Floor 1 Main
 *
 * Key features:
 * - Second floor corridor access
 * - Stairs connection to floor 1
 */
export const wBlockFloor2Area: Area = {
  id: 'w-block-floor-2-main',
  name: 'W Block',
  buildingBlock: 'w',
  floorLevel: 2,
  photos: [
    {
      id: 'w-f2-entry',
      imageUrl: '/360_photos_compressed/w_block/floor_2/w_floor_2_entry.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'w-f2-1' },
        down: 'w-f1-main-1'
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: 0, y: -0.5, z: 2.5 },
          destination: 'w-f1-main-1'
        }
      ]
    },
    {
      id: 'w-f2-1',
      imageUrl: '/360_photos_compressed/w_block/floor_2/w_floor_2_1.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'w-f2-2' },
        back: { connection: 'w-f2-entry' },
        down: 'w-f1-main-1'
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: 6, y: -0.25, z: 2 },
          destination: 'w-f1-main-1'
        }
      ]
    },
    {
      id: 'w-f2-2',
      imageUrl: '/360_photos_compressed/w_block/floor_2/w_floor_2_2.webp',
      startingAngle: 182.5,
      directions: {
        forward: { connection: 'w-f2-3' },
        back: { connection: 'w-f2-1' }
      }
    },
    {
      id: 'w-f2-3',
      imageUrl: '/360_photos_compressed/w_block/floor_2/w_floor_2_3.webp',
      startingAngle: 275,
      directions: {
        back: { connection: 'w-f2-2' },
        left: { connection: 'w-f2-4' },
        right: { connection: 'w-gym-overlook' }
      }
    },
    {
      id: 'w-f2-4',
      imageUrl: '/360_photos_compressed/w_block/floor_2/w_floor_2_4.webp',
      startingAngle: 185,
      directions: {
        right: { connection: 'w-f2-3' },
        forward: { connection: 'w-f2-5' }
      },
      nearbyRooms: [
        {
          roomNumber: 'W209',
          roomType: 'classroom'
        }
      ]
    },
    {
      id: 'w-f2-5',
      imageUrl: '/360_photos_compressed/w_block/floor_2/w_floor_2_5.webp',
      startingAngle: 182.5,
      directions: {
        back: { connection: 'w-f2-4' },
        forward: { connection: 'w-f2-6' }
      },
      nearbyRooms: [
        {
          roomNumber: 'W210',
          roomType: 'classroom'
        }
      ]
    },
    {
      id: 'w-f2-6',
      imageUrl: '/360_photos_compressed/w_block/floor_2/w_floor_2_6.webp',
      startingAngle: 190,
      directions: {
        back: { connection: 'w-f2-5' },
        forward: { connection: 'w-f2-7' }
      },
      nearbyRooms: [
        {
          roomNumber: 'W211',
          roomType: 'classroom'
        }
      ]
    },
    {
      id: 'w-f2-7',
      imageUrl: '/360_photos_compressed/w_block/floor_2/w_floor_2_7.webp',
      startingAngle: 190,
      directions: {
        back: { connection: 'w-f2-6' },
      },
      nearbyRooms: [
        {
          roomNumber: 'W212',
          roomType: 'classroom'
        }
      ]
    }
  ]
}
