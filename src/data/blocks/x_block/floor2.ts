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
        back: { angle: 290, connection: 'x-f2-west-1' },
        forward: { angle: 180, connection: 'n-f2-east-4' }
      },
      buildingContext: {
        wing: 'north',
        facilities: ['entrance', 'information desk']
      }
    },
    {
      id: 'x-f2-west-1',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_1.webp',
      startingAngle: 0,
      directions: {
        back: { angle: 0, connection: 'x-f2-west-2' },
        forward: { angle: 90, connection: 'x-f2-north-entry' }
      }
    },
    {
      id: 'x-f2-west-2',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_2.webp',
      directions: {
        back: { angle: 0, connection: 'x-f2-west-3' },
        forward: { angle: 180, connection: 'x-f2-west-1' }
      }
    },
    {
      id: 'x-f2-west-3',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_3.webp',
      directions: {
        back: { angle: 0, connection: 'x-f2-west-4' },
        forward: { angle: 180, connection: 'x-f2-west-2' }
      }
    },
    {
      id: 'x-f2-west-4',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_4.webp',
      directions: {
        back: { angle: 0, connection: 'x-f2-west-5' },
        forward: { angle: 180, connection: 'x-f2-west-3' }
      }
    },
    {
      id: 'x-f2-west-5',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_5.webp',
      startingAngle: 180,
      directions: {
        back: { angle: 0, connection: 'x-f2-west-6' },
        forward: { angle: 180, connection: 'x-f2-west-4' },
        left: { angle: 90, connection: 'x-f2-west-5-aside' }
      }
    },
    {
      id: 'x-f2-west-5-aside',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_5_aside.webp',
      directions: {
        back: { angle: 180, connection: 'x-f2-west-5' }
      }
    },
    {
      id: 'x-f2-west-6',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_west_6.webp',
      directions: {
        back: { angle: 0, connection: 'x-f2-mid-7' },
        forward: { angle: 180, connection: 'x-f2-west-5' }
      },
      buildingContext: {
        wing: 'west',
        facilities: ['classrooms', 'offices', 'restrooms']
      }
    },
    {
      id: 'x-f2-mid-7',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_mid_7.webp',
      directions: {
        back: { angle: 0, connection: 'x-f2-mid-10' },
        forward: { angle: 180, connection: 'x-f2-west-6' },
        left: { angle: 270, connection: 'x-f2-mid-8' },
        elevator: 'x-block-elevator'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { theta: 180, phi: 80 }  // Elevator access point
        }
      ]
    },
    {
      id: 'x-f2-mid-8',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_mid_8.webp',
      directions: {
        forward: { angle: 0, connection: 'x-f2-north-9' },
        back: { angle: 180, connection: 'x-f2-mid-7' }
      }
    },
    {
      id: 'x-f2-north-9',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_north_9.webp',
      directions: {
        back: { angle: 250, connection: 'x-f2-mid-8' }
      }
    },
    {
      id: 'x-f2-mid-10',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_mid_10.webp',
      directions: {
        back: { angle: 0, connection: 'x-f2-east-11' },
        forward: { angle: 180, connection: 'x-f2-mid-7' }
      }
    },
    {
      id: 'x-f2-east-11',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_east_11.webp',
      directions: {
        back: { angle: 0, connection: 'x-f2-east-12' },
        forward: { angle: 180, connection: 'x-f2-mid-10' }
      }
    },
    {
      id: 'x-f2-east-12',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_east_12.webp',
      startingAngle: 180,
      directions: {
        back: { angle: 0, connection: 'x-f2-east-13' },
        forward: { angle: 180, connection: 'x-f2-east-11' }
      }
    },
    {
      id: 'x-f2-east-13',
      imageUrl: '/360_photos_compressed/x_block/floor_2/x_east_13.webp',
      startingAngle: 270,
      directions: {
        forward: { angle: 270, connection: 'x-f2-east-12' },
        back: { angle: 0, connection: 'a-f2-south-5' },
        down: 'x-f1-east-2'
      },
      hotspots: [
        {
          direction: 'down',
          position: { theta: 270, phi: 120 }  // Stairs going down on the left
        }
      ],
      buildingContext: {
        wing: 'east',
        facilities: ['classrooms', 'offices']
      }
    }
  ]
}