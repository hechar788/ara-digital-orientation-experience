/**
 * A Block Floor 2 Area Definition
 *
 * Defines the main hallway on the second floor of A Block, accessible via
 * stairs from floor 1. Follows similar layout to floor 1 but with different
 * room configurations and facilities.
 *
 * @fileoverview Contains route definition for A Block Floor 2 with
 * navigation connections, building context, and access points.
 */

import type { Area } from '../../../types/tour'

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
 * - Cross-building connection to X Block
 */
export const aBlockFloor2Area: Area = {
  id: 'a-block-floor-2-main',
  name: 'A Block',
  buildingBlock: 'a',
  floorLevel: 2,
  photos: [
    {
      id: 'a-f2-north-stairs-entrance',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_north_stairs_entrance.webp',
      directions: {
        forward: { angle: 310, connection: 'a-f2-north-1' },
        down: 'a-f1-north-3'
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: 3.75, y: -1.15, z: -0.85 }
        }
      ]
    },
    {
      id: 'a-f2-north-1',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_north_1.webp',
      directions: {
        forward: { angle: 180, connection: 'a-f2-north-2' },
        back: { angle: 0, connection: 'a-f2-north-stairs-entrance' }
      },
      buildingContext: {
        wing: 'north',
        facilities: ['classrooms', 'offices']
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: 1.5, y: -1.5, z: -4 }
        }
      ]
    },
    {
      id: 'a-f2-north-2',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_north_2.webp',
      startingAngle: 160,
      directions: {
        forward: { angle: 160, connection: 'a-f2-mid-3' },
        back: { angle: 0, connection: 'a-f2-north-1' }
      }
    },
    {
      id: 'a-f2-mid-3',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_mid_3.webp',
      directions: {
        forward: { angle: 180, connection: 'a-f2-mid-4' },
        back: { angle: 0, connection: 'a-f2-north-2' }
      }
    },
    {
      id: 'a-f2-mid-4',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_mid_4.webp',
      directions: {
        forward: { angle: 180, connection: 'a-f2-south-5' },
        back: { angle: 0, connection: 'a-f2-mid-3' },
        down: 'x-f1-east-2'
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: -9.5, y: -0.35, z: -0.25 }
        }
      ]
    },
    {
      id: 'a-f2-south-5',
      imageUrl: '/360_photos_compressed/a_block/floor_2/a_south_5.webp',
      directions: {
        forward: { angle: 180, connection: 'x-f2-east-13' },
        back: { angle: 0, connection: 'a-f2-mid-4' },
        down: 'x-f1-east-2'
      },
      buildingContext: {
        wing: 'south',
        facilities: ['classrooms', 'faculty offices']
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: -7.5, y: -0.45, z: 0.35 }
        }
      ]
    }
  ]
}