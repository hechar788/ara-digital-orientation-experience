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
      connections: {
        forward: 'x-f1-east-2',
        back: 'a-f1-south-6'
      },
      buildingContext: {
        wing: 'east',
        facilities: ['classrooms', 'offices']
      }
    },
    {
      id: 'x-f1-east-2',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_2.webp',
      connections: {
        forward: 'x-f1-east-3',
        back: 'x-f1-east-1',
        up: 'x-f2-east-13'
      },
      hotspots: [
        {
          direction: 'up',
          position: { theta: 270, phi: 60 }  // Elevator/stairs on the left
        }
      ]
    },
    {
      id: 'x-f1-east-3',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_3.webp',
      connections: {
        forward: 'x-f1-east-4',
        back: 'x-f1-east-2',
        up: 'x-f2-east-13'
      },
      hotspots: [
        {
          direction: 'up',
          position: { theta: 90, phi: 55 }  // Elevator/stairs on the right
        }
      ]
    },
    {
      id: 'x-f1-east-4',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_ 4.webp',
      connections: {
        forward: 'x-f1-mid-5',
        back: 'x-f1-east-3'
      }
    },
    {
      id: 'x-f1-mid-5',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_5.webp',
      connections: {
        forward: 'x-f1-mid-6',
        back: 'x-f1-east-4'
      }
    },
    {
      id: 'x-f1-mid-6',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_6.webp',
      connections: {
        forward: 'x-f1-mid-7',
        back: 'x-f1-mid-5'
      }
    },
    {
      id: 'x-f1-mid-7',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_7.webp',
      connections: {
        forward: 'x-f1-mid-8',
        back: 'x-f1-mid-6'
      }
    },
    {
      id: 'x-f1-mid-8',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_8.webp',
      connections: {
        forward: 'x-f1-west-9',
        back: 'x-f1-mid-7'
      }
    },
    {
      id: 'x-f1-west-9',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_9.webp',
      connections: {
        forward: 'x-f1-west-10',
        back: 'x-f1-mid-8'
      }
    },
    {
      id: 'x-f1-west-10',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_10.webp',
      connections: {
        forward: 'x-f1-west-11',
        back: 'x-f1-west-9'
      }
    },
    {
      id: 'x-f1-west-11',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_11.webp',
      connections: {
        forward: 'x-f1-west-12',
        back: 'x-f1-west-10'
      }
    },
    {
      id: 'x-f1-west-12',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_12.webp',
      connections: {
        back: 'x-f1-west-11'
      },
      buildingContext: {
        wing: 'west',
        facilities: ['classrooms', 'offices', 'restrooms']
      }
    }
  ]
}