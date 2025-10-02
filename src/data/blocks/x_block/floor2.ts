/**
 * X Block Floor 2 Area Definition
 *
 * Defines the main hallway on the second floor of X Block, featuring a
 * north entrance and similar east-to-west corridor layout as floor 1.
 * Includes multiple wing sections with classroom and office access.
 *
 * @fileoverview Contains route definition for X Block Floor 2 with
 * navigation connections, building context, and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * X Block Floor 2 Main Corridor Route
 *
 * Covers the main hallway on the second floor of X Block, featuring a
 * north entrance and similar east-to-west corridor layout as floor 1.
 * Includes multiple wing sections with classroom and office access.
 *
 * Navigation flow:
 * North Entry → West Wing → Middle Sections → East Wing (with side corridor)
 *
 * Key features:
 * - North entrance access point
 * - Extended west wing with side corridor branch
 * - Classroom and office areas throughout
 * - Connection points to other floors via elevator/stairs
 * - Cross-building connection to A Block
 */
export const xBlockFloor2Area: Area = {
  id: 'x-block-floor-2-main',
  name: 'X Block',
  buildingBlock: 'x',
  floorLevel: 2,
  photos: [
    {
      id: 'x-f2-north-entry',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_n_entry.webp',
      startingAngle: 180,
      directions: {
        forwardLeft: { connection: 'x-f2-west-1' },
        forward: { connection: 'n-f2-east-4' },
        down: 'x-f1-west-12',
        up: 'x-f3-west-entry'
      },
      buildingContext: {
        wing: 'north',
        facilities: ['entrance', 'information desk']
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: 0.6, y: 0, z: 4.75}  // Stairs
        },
        {
          direction: 'down',
          position: { x: 2.25, y: -1, z: 4.5 }  // Stairs
        }
      ]
    },
    {
      id: 'x-f2-west-1',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_1.webp',
      startingAngle: 0,
      directions: {
        forward: { connection: 'x-f2-west-2' },
        right: { connection: 'x-f2-north-entry' }
      }
    },
    {
      id: 'x-f2-west-2',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_2.webp',
      directions: {
        forward: { connection: 'x-f2-west-3' },
        back: { connection: 'x-f2-west-1' }
      }
    },
    {
      id: 'x-f2-west-3',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_3.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'x-f2-west-4' },
        back: { connection: 'x-f2-west-2' },
        right: { connection: 'x-f2-west-3-aside' }
      }
    },
    {
      id: 'x-f2-west-3-aside',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_3_aside.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'x-f2-west-3' }
      }
    },
    {
      id: 'x-f2-west-4',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_4.webp',
      directions: {
        forward: { connection: 'x-f2-west-5' },
        back: { connection: 'x-f2-west-3' }
      }
    },
    {
      id: 'x-f2-west-5',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_5.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'x-f2-west-6' },
        back: { connection: 'x-f2-west-4' },
        right: { connection: 'x-f2-west-5-aside' }
      }
    },
    {
      id: 'x-f2-west-5-aside',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_5_aside.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'x-f2-west-5' }
      }
    },
    {
      id: 'x-f2-west-6',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_6.webp',
      directions: {
        forward: { connection: 'x-f2-mid-7' },
        back: { connection: 'x-f2-west-5' }
      },
      buildingContext: {
        wing: 'west',
        facilities: ['classrooms', 'offices', 'restrooms']
      }
    },
    {
      id: 'x-f2-mid-7',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_mid_7.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'x-f2-mid-10' },
        back: { connection: 'x-f2-west-6' },
        right: { connection: 'x-f2-mid-7-aside' },
        left: { connection: 'x-f2-mid-8' },
        elevator: 'x-elevator-interior'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: 3, y: -0.75, z: 7 }  // Elevator access point
        }
      ]
    },
    {
      id: 'x-f2-mid-7-aside',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_mid_7_aside.webp',
      startingAngle: 180,
      directions: {
        left: { connection: 'x-f2-mid-7-aside-1' },
        right: { connection: 'x-f2-mid-7' },
        elevator: 'x-elevator-interior'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: -3.5, y: -0.85, z: 0.5}  // Elevator
        }
      ]
    },
    {
      id: 'x-f2-mid-7-aside-1',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_mid_7_aside_1.webp',
      directions: {
        forward: { connection: 'x-f2-mid-7-aside' }
      }
    },
    {
      id: 'x-f2-mid-8',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_mid_8.webp',
      directions: {
        forward: { connection: 'x-f2-north-9' },
        back: { connection: 'x-f2-mid-7' }
      }
    },
    {
      id: 'x-f2-north-9',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_north_9.webp',
      directions: {
        backLeft: { connection: 'x-f2-mid-8' },
        forward: { connection: 'x-f2-north-9-aside' },
        door: 'library-f2-aside-1'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -3, y: -0.15, z: 0.5 },
          destination: 'library-f2-aside-1'
        }
      ]
    },
    {
      id: 'x-f2-north-9-aside',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_north_9_aside.webp',
      startingAngle: 160,
      directions: {
        backLeft: { connection: 'x-f2-north-9' }
      }
    },
    {
      id: 'x-f2-mid-10',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_mid_10.webp',
      directions: {
        forward: { connection: 'x-f2-east-11' },
        back: { connection: 'x-f2-mid-7' }
      }
    },
    {
      id: 'x-f2-east-11',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_east_11.webp',
      directions: {
        forward: { connection: 'x-f2-east-12' },
        back: { connection: 'x-f2-mid-10' }
      }
    },
    {
      id: 'x-f2-east-12',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_east_12.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'x-f2-east-13' },
        back: { connection: 'x-f2-east-11' },
        down: 'x-f1-east-2'
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: 5, y: -0.5, z: 1.65 }  // Stairs going down on the left
        }
      ]
    },
    {
      id: 'x-f2-east-13',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_east_13.webp',
      startingAngle: 245,
      directions: {
        forwardRight: { connection: 'x-f2-east-12' },
        backLeft: { connection: 'a-f2-south-5' },
        down: 'x-f1-east-2'
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: -3.25, y: -0.75, z: -1 }  // Stairs going down on the left
        }
      ],
      buildingContext: {
        wing: 'east',
        facilities: ['classrooms', 'offices']
      }
    }
  ]
}