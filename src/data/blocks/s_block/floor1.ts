/**
 * S Block Floor 1 Area Definition
 *
 * Defines the main hallway on the ground floor of S Block, starting from
 * the north section and proceeding through the middle section to the south entrance.
 *
 * @fileoverview Contains route definition for S Block Floor 1 with
 * navigation connections, building context, and entrance points.
 */

import type { Area } from '../../../types/tour'

/**
 * S Block Floor 1 Main Corridor Route
 *
 * Covers the main hallway on the ground floor of S Block, starting from
 * the north section and proceeding through middle to south entrance.
 *
 * Navigation flow:
 * North Section → Middle Section → South Section → South Entrance
 *
 * Key features:
 * - Connection to N Block from north section
 * - Main south entrance/exit point
 * - Central corridor layout with distinct sections
 */
export const sBlockFloor1Area: Area = {
  id: 's-block-floor-1-main',
  name: 'S Block',
  buildingBlock: 's',
  floorLevel: 1,
  photos: [
    {
      id: 's-f1-north-4',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_1/s_north_4.webp',
      directions: {
        forward: { connection: 's-f1-mid-3' },
        back: { connection: 'n-f1-west-9' }
      },
      buildingContext: {
        wing: 'north',
        facilities: ['connection to N Block', 'offices']
      }
    },
    {
      id: 's-f1-mid-3',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_1/s_mid_3.webp',
      startingAngle: 10,
      directions: {
        forward: { connection: 's-f1-south-2' },
        back: { connection: 's-f1-north-4' }
      },
      buildingContext: {
        wing: 'middle',
        facilities: ['elevators', 'restrooms']
      }
    },
    {
      id: 's-f1-south-2',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_1/s_south_2.webp',
      startingAngle: 5,
      directions: {
        forward: { connection: 's-f1-south-entrance' },
        back: { connection: 's-f1-mid-3' }
      }
    },
    {
      id: 's-f1-south-entrance',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_1/s_south_entrance.webp',
      directions: {
        back: { connection: 's-f1-south-2' }
      },
      buildingContext: {
        wing: 'south',
        facilities: ['main entrance', 'information desk', 'exit']
      }
    }
  ]
}