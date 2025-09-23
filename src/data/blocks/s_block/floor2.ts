/**
 * S Block Floor 2 Area Definition
 *
 * Defines the main hallway on the second floor of S Block, starting from
 * the middle section and proceeding through a linear corridor progression.
 *
 * @fileoverview Contains route definition for S Block Floor 2 with
 * navigation connections, building context, and elevator access.
 */

import type { Area } from '../../../types/tour'

/**
 * S Block Floor 2 Main Corridor Route
 *
 * Covers the main hallway on the second floor of S Block, starting from
 * the middle section and proceeding through a linear progression.
 *
 * Navigation flow:
 * Middle Section 1 → Middle Sections 2-7
 *
 * Key features:
 * - Connection to shared elevator entrance
 * - Linear corridor layout with multiple sections
 * - Access to classrooms and offices throughout
 * - Second floor elevation with elevator access
 */
export const sBlockFloor2Area: Area = {
  id: 's-block-floor-2-main',
  name: 'S Block',
  buildingBlock: 's',
  floorLevel: 2,
  photos: [
    {
      id: 's-f2-mid-1',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_2/s_mid_1.webp',
      directions: {
        forward: { angle: 0, connection: 's-f2-mid-2' },
        back: { angle: 180, connection: 'n-f2-elevator-entrance' }
      },
      buildingContext: {
        wing: 'middle',
        facilities: ['elevator access', 'classrooms']
      }
    },
    {
      id: 's-f2-mid-2',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_2/s_mid_2.webp',
      directions: {
        forward: { angle: 0, connection: 's-f2-mid-3' },
        back: { angle: 180, connection: 's-f2-mid-1' }
      }
    },
    {
      id: 's-f2-mid-3',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_2/s_mid_3.webp',
      directions: {
        forward: { angle: 0, connection: 's-f2-mid-4' },
        back: { angle: 180, connection: 's-f2-mid-2' }
      }
    },
    {
      id: 's-f2-mid-4',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_2/s_mid_4.webp',
      directions: {
        forward: { angle: 0, connection: 's-f2-south-5' },
        back: { angle: 180, connection: 's-f2-mid-3' }
      }
    },
    {
      id: 's-f2-south-5',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_2/s_south_5.webp',
      directions: {
        forward: { angle: 0, connection: 's-f2-south-6' },
        back: { angle: 180, connection: 's-f2-mid-4' }
      }
    },
    {
      id: 's-f2-south-6',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_2/s_south_6.webp',
      directions: {
        forward: { angle: 0, connection: 's-f2-south-7' },
        back: { angle: 180, connection: 's-f2-south-5' }
      }
    },
    {
      id: 's-f2-south-7',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_2/s_south_7.webp',
      directions: {
        back: { angle: 180, connection: 's-f2-south-6' }
      },
      buildingContext: {
        wing: 'south',
        facilities: ['classrooms', 'offices', 'study areas']
      }
    }
  ]
}