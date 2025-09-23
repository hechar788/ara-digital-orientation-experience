/**
 * N Block Floor 2 Area Definition
 *
 * Defines the main hallway on the second floor of N Block, starting from
 * the east section and proceeding through the middle section to the west wing.
 *
 * @fileoverview Contains route definition for N Block Floor 2 with
 * navigation connections, building context, and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * N Block Floor 2 Main Corridor Route
 *
 * Covers the main hallway on the second floor of N Block, starting from
 * the east section and proceeding through middle to west sections.
 *
 * Navigation flow:
 * East Section → Middle Section → West Section (2 photos)
 *
 * Key features:
 * - Linear corridor layout with distinct sections
 * - Access to classrooms and offices throughout
 * - Second floor elevation with stair connections
 */
export const nBlockFloor2Area: Area = {
  id: 'n-block-floor-2-main',
  name: 'N Block',
  buildingBlock: 'n',
  floorLevel: 2,
  photos: [
    {
      id: 'n-f2-east-4',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_2/n_east_4.webp',
      directions: {
        forward: { angle: 0, connection: 'n-f2-mid-3' },
        back: { angle: 180, connection: 'x-f2-north-entry' }
      },
      buildingContext: {
        wing: 'east',
        facilities: ['classrooms', 'offices']
      }
    },
    {
      id: 'n-f2-mid-3',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_2/n_mid_3.webp',
      directions: {
        forward: { angle: 0, connection: 'n-f2-west-2' },
        back: { angle: 180, connection: 'n-f2-east-4' }
      },
      buildingContext: {
        wing: 'middle',
        facilities: ['elevators', 'restrooms']
      }
    },
    {
      id: 'n-f2-west-2',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_2/n_west_2.webp',
      directions: {
        forward: { angle: 0, connection: 'n-f2-west-1' },
        back: { angle: 180, connection: 'n-f2-mid-3' }
      }
    },
    {
      id: 'n-f2-west-1',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_2/n_west_1.webp',
      directions: {
        forward: { angle: 0, connection: 'n-f2-elevator-entrance' },
        back: { angle: 180, connection: 'n-f2-west-2' }
      },
      buildingContext: {
        wing: 'west',
        facilities: ['classrooms', 'faculty offices']
      }
    },
    {
      id: 'n-f2-elevator-entrance',
      imageUrl: '/360_photos_compressed/n_s_block/n_s_2nd_floor_elevators_entrance.webp',
      directions: {
        forward: { angle: 0, connection: 's-f2-mid-1' },
        back: { angle: 180, connection: 'n-f2-west-1' },
        elevator: 'ns-block-elevator'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { theta: 180, phi: 85 }  // Central elevator access
        }
      ],
      buildingContext: {
        wing: 'central',
        facilities: ['elevators', 'wayfinding', 'accessible access']
      }
    }
  ]
}