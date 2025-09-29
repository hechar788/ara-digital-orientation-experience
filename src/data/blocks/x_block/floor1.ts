/**
 * X Block Floor 1 Area Definition
 *
 * Defines the main hallway on the ground floor of X Block, connecting the
 * east wing through the middle section to the west wing. The corridor
 * provides access to classrooms, offices, and other facilities.
 *
 * @fileoverview Contains route definition for X Block Floor 1 with
 * navigation connections, building context, and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * X Block Floor 1 Main Corridor Route
 *
 * Covers the main hallway on the ground floor of X Block, connecting the
 * east wing through the middle section to the west wing. The corridor
 * provides access to classrooms, offices, and other facilities.
 *
 * Navigation flow:
 * East Wing → Middle Sections → West Wing
 *
 * Key features:
 * - Multi-wing layout with distinct sections
 * - Classroom and office access throughout
 * - Connection points to other floors via elevator
 * - Cross-building connection to A Block
 */
export const xBlockFloor1Area: Area = {
  id: 'x-block-floor-1-main',
  name: 'X Block',
  buildingBlock: 'x',
  floorLevel: 1,
  photos: [
    {
      id: 'x-f1-east-1',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_1.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 90, connection: 'x-f1-east-2' },
        back: { angle: 180, connection: 'a-f1-south-6' }
      },
      buildingContext: {
        wing: 'east',
        facilities: ['classrooms', 'offices']
      }
    },
    {
      id: 'x-f1-east-2',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_2.webp',
      startingAngle: 15,
      directions: {
        forward: { angle: 0, connection: 'x-f1-east-3' },
        back: { angle: 180, connection: 'x-f1-east-1' },
        up: 'x-f2-east-13'
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: 2, y: 0, z: -3.5 }  // Stairs
        }
      ]
    },
    {
      id: 'x-f1-east-3',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_3.webp',
      startingAngle: 10,
      directions: {
        forward: { angle: 0, connection: 'x-f1-east-4' },
        back: { angle: 180, connection: 'x-f1-east-2' },
        up: 'x-f2-east-13'
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: -4, y: -0.15, z: -4.25 }  // Stairs
        }
      ]
    },
    {
      id: 'x-f1-east-4',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_4.webp',
      directions: {
        forward: { angle: 0, connection: 'x-f1-mid-5' },
        back: { angle: 180, connection: 'x-f1-east-3' },
        up: 'x-f2-east-13'
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: -5.25, y: -0.35, z: -7.5 }  // Stairs
        }
      ]
    },
    {
      id: 'x-f1-mid-5',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_5.webp',
      directions: {
        forward: { angle: 0, connection: 'x-f1-mid-6' },
        back: { angle: 180, connection: 'x-f1-east-4' }
      }
    },
    {
      id: 'x-f1-mid-6',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_6.webp',
      directions: {
        forward: { angle: 0, connection: 'x-f1-mid-7' },
        back: { angle: 180, connection: 'x-f1-mid-5' },
        elevator: 'x-elevator-interior'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: -0.5, y: -0.25, z: -7 }  // Elevator
        }
      ]
    },
    {
      id: 'x-f1-mid-7',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_7.webp',
      directions: {
        forward: { angle: 0, connection: 'x-f1-mid-8' },
        back: { angle: 180, connection: 'x-f1-mid-6' }
      }
    },
    {
      id: 'x-f1-mid-8',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_8.webp',
      directions: {
        forward: { angle: 0, connection: 'x-f1-west-9' },
        back: { angle: 180, connection: 'x-f1-mid-7' }
      }
    },
    {
      id: 'x-f1-west-9',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_9.webp',
      directions: {
        forward: { angle: 345, connection: 'x-f1-west-10' },
        back: { angle: 180, connection: 'x-f1-mid-8' }
      }
    },
    {
      id: 'x-f1-west-10',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_10.webp',
      directions: {
        forward: { angle: 0, connection: 'x-f1-west-11' },
        back: { angle: 180, connection: 'x-f1-west-9' }
      }
    },
    {
      id: 'x-f1-west-11',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_11.webp',
      startingAngle: 180,
      directions: {
        forward: { angle: 0, connection: 'x-f1-west-12' },
        back: { angle: 180, connection: 'x-f1-west-10' }
      }
    },
    {
      id: 'x-f1-west-12',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_12.webp',
      startingAngle: 320,
      directions: {
        forward: { angle: 325, connection: 'n-f1-x-entry' },
        back: { angle: 180, connection: 'x-f1-west-11' },
        up: 'x-f2-north-entry'
      },
      buildingContext: {
        wing: 'west',
        facilities: ['classrooms', 'offices', 'restrooms']
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: 1.65, y: -0.15, z: -4.5 }  // Stairs
        }
      ]
    }
  ]
}