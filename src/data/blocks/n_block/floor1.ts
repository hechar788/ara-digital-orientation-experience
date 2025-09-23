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
      connections: {
        forward: 'n-f1-east-1',
        back: 'x-f1-west-12'
      },
      buildingContext: {
        wing: 'entrance',
        facilities: ['main entrance', 'directory']
      }
    },
    {
      id: 'n-f1-east-1',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_1.webp',
      connections: {
        forward: 'n-f1-east-2',
        back: 'n-f1-x-entry'
      }
    },
    {
      id: 'n-f1-east-2',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_2.webp',
      connections: {
        forward: 'n-f1-east-5',
        back: 'n-f1-east-1',
        left: 'n-f1-east-south-3'
      }
    },
    {
      id: 'n-f1-east-south-3',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_south_3.webp',
      connections: {
        forward: 'n-f1-east-south-4',
        back: 'n-f1-east-2'
      }
    },
    {
      id: 'n-f1-east-south-4',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_south_4.webp',
      connections: {
        back: 'n-f1-east-south-3'
      },
      buildingContext: {
        wing: 'east',
        facilities: ['offices', 'conference rooms']
      }
    },
    {
      id: 'n-f1-east-5',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_5.webp',
      connections: {
        forward: 'n-f1-east-6',
        back: 'n-f1-east-2'
      }
    },
    {
      id: 'n-f1-east-6',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_east_6.webp',
      connections: {
        forward: 'n-f1-mid-7',
        back: 'n-f1-east-5'
      }
    },
    {
      id: 'n-f1-mid-7',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_mid_7.webp',
      connections: {
        forward: 'n-f1-west-8',
        back: 'n-f1-east-6',
        elevator: 'ns-block-elevator'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { theta: 90, phi: 80 }  // Elevator access point
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
      connections: {
        forward: 'n-f1-west-9',
        back: 'n-f1-mid-7'
      }
    },
    {
      id: 'n-f1-west-9',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/n_west_9.webp',
      connections: {
        back: 'n-f1-west-8',
        forward: 's-f1-north-4'
      },
      buildingContext: {
        wing: 'west',
        facilities: ['classrooms', 'faculty offices']
      }
    }
  ]
}