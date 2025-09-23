/**
 * A Block Floor 1 Area Definition
 *
 * Defines the main hallway on the ground floor of A Block, starting from
 * the north entrance and proceeding south through the corridor system.
 *
 * @fileoverview Contains route definition for A Block Floor 1 with
 * navigation connections, building context, and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * A Block Floor 1 Main Corridor Route
 *
 * Covers the main hallway on the ground floor of A Block, starting from
 * the north entrance and proceeding south through the corridor system.
 *
 * Navigation flow:
 * North Entrance → North Wing → Side Corridor Branch → Middle Sections → South Wing
 *
 * Key features:
 * - Side corridor access at north-3
 * - Stair access to floor 2 at mid-4
 * - Building entrance and exit points
 * - Cross-building connection to X Block
 */
export const aBlockFloor1Area: Area = {
  id: 'a-block-floor-1-main',
  name: 'A Block',
  buildingBlock: 'a',
  floorLevel: 1,
  photos: [
    {
      id: 'a-f1-north-entrance',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_entrance.webp',
      orientationOffset: 180,
      connections: {
        forward: 'a-f1-north-1'
      },
      buildingContext: {
        wing: 'north',
        facilities: ['main entrance', 'information desk']
      }
    },
    {
      id: 'a-f1-north-1',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_1.webp',
      orientationOffset: 180,
      connections: {
        forward: 'a-f1-north-2',
        back: 'a-f1-north-entrance'
      }
    },
    {
      id: 'a-f1-north-2',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_2.webp',
      orientationOffset: 180,
      connections: {
        forward: 'a-f1-north-3',
        back: 'a-f1-north-1'
      }
    },
    {
      id: 'a-f1-north-3',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_3.webp',
      orientationOffset: 180,
      connections: {
        forward: 'a-f1-mid-4',
        back: 'a-f1-north-2',
        left: 'a-f1-north-3-side',
        up: 'a-f2-north-stairs-entrance'
      },
      hotspots: [
        {
          direction: 'up',
          position: { theta: 270, phi: 60 }
        }
      ]
    },
    {
      id: 'a-f1-north-3-side',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_3_side.webp',
      orientationOffset: -90,
      connections: {
        back: 'a-f1-north-3',
        up: 'a-f2-north-stairs-entrance'
      },
      hotspots: [
        {
          direction: 'up',
          position: { theta: 90, phi: 55 }
        }
      ]
    },
    {
      id: 'a-f1-mid-4',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_mid_4.webp',
      orientationOffset: 300,
      connections: {
        forward: 'a-f1-mid-5',
        back: 'a-f1-north-3'
      }
    },
    {
      id: 'a-f1-mid-5',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_mid_5.webp',
      connections: {
        forward: 'a-f1-south-6',
        back: 'a-f1-mid-4'
      }
    },
    {
      id: 'a-f1-south-6',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_south_6.webp',
      connections: {
        back: 'a-f1-mid-5',
        forward: 'x-f1-east-1'
      },
      buildingContext: {
        wing: 'south',
        facilities: ['restrooms', 'water fountain']
      }
    }
  ]
}