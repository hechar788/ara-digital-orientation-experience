/**
 * X Block Floor 3 Area Definition
 *
 * Defines the main hallway on the third floor of X Block, starting from a
 * west entrance and proceeding through west wing, middle sections, to east wing.
 * Features a side corridor branch accessible from the west wing.
 *
 * @fileoverview Contains route definition for X Block Floor 3 with
 * navigation connections, building context, and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * X Block Floor 3 Main Corridor Route
 *
 * Covers the main hallway on the third floor of X Block, starting from a
 * west entrance and proceeding through west wing, middle sections, to east wing.
 * Features a side corridor branch accessible from the west wing.
 *
 * Navigation flow:
 * West Entry → West Wing → Middle Sections → East Wing
 *
 * Key features:
 * - West entrance access point
 * - Side corridor branch from west-1
 * - Classroom and office areas throughout
 * - Top floor of the building
 */
export const xBlockFloor3Area: Area = {
  id: 'x-block-floor-3-main',
  name: 'X Block',
  buildingBlock: 'x',
  floorLevel: 3,
  photos: [
    {
      id: 'x-f3-west-entry',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_west_entry.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'x-f3-west-1' },
        down: 'x-f2-north-entry'
      },
      buildingContext: {
        wing: 'west',
        facilities: ['entrance', 'elevator access']
      }
    },
    {
      id: 'x-f3-west-1',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_west_1.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'x-f3-west-2' },
        back: { angle: 0, connection: 'x-f3-west-entry' },
        left: { angle: 270, connection: 'x-f3-west-1-aside' }
      }
    },
    {
      id: 'x-f3-west-1-aside',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_west_1_aside.webp',
      directions: {
        back: { angle: 180, connection: 'x-f3-west-1' }
      }
    },
    {
      id: 'x-f3-west-2',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_west_2.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'x-f3-mid-3' },
        back: { angle: 0, connection: 'x-f3-west-1' }
      },
      buildingContext: {
        wing: 'west',
        facilities: ['classrooms', 'offices']
      }
    },
    {
      id: 'x-f3-mid-3',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_mid_3.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'x-f3-mid-4' },
        back: { angle: 0, connection: 'x-f3-west-2' }
      }
    },
    {
      id: 'x-f3-mid-4',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_mid_4.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'x-f3-mid-5' },
        back: { angle: 0, connection: 'x-f3-mid-3' }
      }
    },
    {
      id: 'x-f3-mid-5',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_mid_5.webp',
      startingAngle: 180,      
      directions: {
        forward: { angle: 180, connection: 'x-f3-east-6' },
        back: { angle: 0, connection: 'x-f3-mid-4' }
      }
    },
    {
      id: 'x-f3-east-6',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_east_6.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 180, connection: 'x-f3-east-7' },
        back: { angle: 0, connection: 'x-f3-mid-5' }
      }
    },
    {
      id: 'x-f3-east-7',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_east_7.webp',
      directions: {
        forward: { angle: 270, connection: 'x-f3-east-8' },
        back: { angle: 80, connection: 'x-f3-east-6' },
        elevator: 'x-block-elevator'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { theta: 45, phi: 85 }  // Elevator access point
        }
      ]
    },
    {
      id: 'x-f3-east-8',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_east_8.webp',
      directions: {
        back: { angle: 270, connection: 'x-f3-east-7' }
      },
      buildingContext: {
        wing: 'east',
        facilities: ['classrooms', 'offices', 'study areas']
      }
    }
  ]
}