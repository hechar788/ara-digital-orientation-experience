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
      startingAngle: 0,
      directions: {
        right: { connection: 'x-f1-east-2' },
        back: { connection: 'a-f1-south-6' }
      },
      buildingContext: {
        wing: 'east',
        facilities: ['classrooms', 'offices']
      }
    },
    {
      id: 'x-f1-east-2',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_2.webp',
      startingAngle: 25,
      directions: {
        forward: { connection: 'x-f1-east-3' },
        backRight: { connection: 'x-f1-east-1' },
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
      startingAngle: 25,
      directions: {
        forward: { connection: 'x-f1-east-4' },
        back: { connection: 'x-f1-east-2' },
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
      startingAngle: 25,
      directions: {
        forward: { connection: 'x-f1-mid-5' },
        back: { connection: 'x-f1-east-3' },
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
      startingAngle: 20,
      directions: {
        forward: { connection: 'x-f1-mid-6' },
        back: { connection: 'x-f1-east-4' }
      }
    },
    {
      id: 'x-f1-mid-6',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_6.webp',
      startingAngle: 15,
      directions: {
        back: { connection: 'x-f1-mid-5' },
        forward: { connection: 'x-f1-mid-7' },
        right: { connection: 'x-f1-mid-6-library' },
        left: { connection: 'x-f1-mid-6-aside' },
        elevator: 'x-elevator-interior',
        door: 'library-f1-entrance'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: -0.75, y: -0.5, z: -9 }  // Elevator
        },
        {
          direction: 'door',
          position: { x: -4.5, y: -0.15, z: 6.5 },
          destination: 'library-f1-entrance'
        }
      ]
    },
    {
      id: 'x-f1-mid-6-library',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_6_aside.webp',
      startingAngle: 90,
      directions: {
        back: { connection: 'x-f1-mid-6' },
        door: 'library-f1-entrance'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -2, y: -0.15, z: 1.35 },
          destination: 'library-f1-entrance'
        }
      ]
    },
    {
      id: 'x-f1-mid-6-aside',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_6_aside_1.webp',
      startingAngle: 280,
      directions: {
        back: { connection: 'x-f1-mid-6' },
        elevator: 'x-elevator-interior'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: -4, y: -1, z: 0 }  // Elevator
        }
      ]
    },
    {
      id: 'x-f1-mid-7',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_7.webp',
      startingAngle: 10,
      directions: {
        forward: { connection: 'x-f1-mid-8' },
        back: { connection: 'x-f1-mid-6' },
        elevator: 'x-elevator-interior'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: -6, y: -0.35, z: -8 }  // Elevator
        }
      ]
    },
    {
      id: 'x-f1-mid-8',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_8.webp',
      directions: {
        forward: { connection: 'x-f1-west-9' },
        back: { connection: 'x-f1-mid-7' }
      }
    },
    {
      id: 'x-f1-west-9',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_9.webp',
      directions: {
        forward: { connection: 'x-f1-west-10' },
        back: { connection: 'x-f1-mid-8' }
      }
    },
    {
      id: 'x-f1-west-10',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_10.webp',
      directions: {
        forward: { connection: 'x-f1-west-11' },
        back: { connection: 'x-f1-west-9' }
      }
    },
    {
      id: 'x-f1-west-11',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_11.webp',
      startingAngle: 0,
      directions: {
        back: { connection: 'x-f1-west-10' },
        forward: { connection: 'x-f1-west-12' }
      }
    },
    {
      id: 'x-f1-west-12',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_12.webp',
      startingAngle: 0,
      directions: {
        forwardLeft: { connection: 'n-f1-x-entry' },
        back: { connection: 'x-f1-west-11' },
        up: 'x-f2-north-entry',
        door: 'outside-x-north-entrance'
      },
      buildingContext: {
        wing: 'west',
        facilities: ['classrooms', 'offices', 'restrooms']
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: 1.95, y: -0.15, z: -5.5 }  // Stairs
        },
        {
          direction: 'door',
          position: { x: 4, y: -0.5, z: -0.275 },
          destination: 'outside-x-north-entrance'
        }
      ]
    }
  ]
}