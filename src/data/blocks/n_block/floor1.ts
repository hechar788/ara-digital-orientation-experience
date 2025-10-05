/**
 * N Block Floor 1 Area Definition
 *
 * Defines the main hallway on the ground floor of N Block, starting from
 * the entry point and proceeding through the east wing, middle section, and west wing.
 *
 * @fileoverview Contains route definition for N Block Floor 1 with
 * navigation connections, building context, and branch corridors.
 */

import type { Area } from '../../../types/tour'

/**
 * N Block Floor 1 Main Corridor Route
 *
 * Covers the main hallway on the ground floor of N Block, starting from
 * the entry point and proceeding through east, middle, and west sections.
 *
 * Navigation flow:
 * Entry → East Wing → East South Branch → Middle Section → West Wing
 *
 * Key features:
 * - East south corridor branch at n_east_2
 * - Connection between east and west wings through middle section
 * - Dead-end south corridor with return path only
 */
export const nBlockFloor1Area: Area = {
  id: 'n-block-floor-1-main',
  name: 'N Block',
  buildingBlock: 'n',
  floorLevel: 1,
  photos: [
    {
      id: 'n-f1-x-entry',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_x_entry.webp',
      startingAngle: 345,
      directions: {
        forward: { connection: 'n-f1-east-1' },
        back: { connection: 'x-f1-west-12' }
      },
      buildingContext: {
        wing: 'entrance',
        facilities: ['main entrance', 'directory']
      }
    },
    {
      id: 'n-f1-east-1',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_1.webp',
      startingAngle: 17.5,
      directions: {
        forward: { connection: 'n-f1-east-2' },
        back: { connection: 'n-f1-x-entry' }
      }
    },
    {
      id: 'n-f1-east-2',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_2.webp',
      startingAngle: 5,
      directions: {
        forward: { connection: 'n-f1-east-5' },
        back: { connection: 'n-f1-east-1' },
        left: { connection: 'n-f1-east-south-3' }
      }
    },
    {
      id: 'n-f1-east-south-3',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_south_3.webp',
      directions: {
        forward: { connection: 'n-f1-east-south-4' },
        back: { connection: 'n-f1-east-2' }
      }
    },
    {
      id: 'n-f1-east-south-4',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_south_4.webp',
      directions: {
        back: { connection: 'n-f1-east-south-3' }
      },
      buildingContext: {
        wing: 'east',
        facilities: ['offices', 'conference rooms']
      }
    },
    {
      id: 'n-f1-east-5',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_5.webp',
      startingAngle: 0,
      directions: {
        forward: { connection: 'n-f1-east-6' },
        back: { connection: 'n-f1-east-2' }
      }
    },
    {
      id: 'n-f1-east-6',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_6.webp',
      startingAngle: 10,
      directions: {
        forward: { connection: 'n-f1-mid-7' },
        back: { connection: 'n-f1-east-5' }
      }
    },
    {
      id: 'n-f1-mid-7',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_mid_7.webp',
      startingAngle: 8,
      directions: {
        forward: { connection: 'n-f1-west-8' },
        back: { connection: 'n-f1-east-6' },
        elevator: 'ns-elevator-interior',
        door: ['outside-n-north-entrance', 'outside-s-north-entrance']
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: 1, y: -0.5, z: -3 }  // Elevator access point
        },
        {
          direction: 'elevator',
          position: { x: 4.35, y: -0.5, z: -2.5 }  // Elevator access point
        },
        {
          direction: 'door',
          position: { x: 2.25, y: -0.5, z: 4 },
          destination: 'outside-s-north-entrance'
        }
      ],
      buildingContext: {
        wing: 'middle',
        facilities: ['elevators', 'restrooms']
      }
    },
    {
      id: 'n-f1-west-8',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_west_8.webp',
      startingAngle: 2.5,
      directions: {
        back: { connection: 'n-f1-mid-7' },
        forward: { connection: 'n-f1-west-9' }
      }
    },
    {
      id: 'n-f1-west-9',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_west_9.webp',
      startingAngle: 35,
      directions: {
        forward: { connection: 's-f1-north-4' },
        back: { connection: 'n-f1-west-8' }
      },
      buildingContext: {
        wing: 'west',
        facilities: ['classrooms', 'faculty offices']
      }
    }
  ]
}