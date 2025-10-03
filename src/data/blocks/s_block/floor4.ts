/**
 * S Block Floor 4 Area Definition
 *
 * Defines the main hallway on the fourth floor of S Block, featuring
 * elevator access and corridor sections connecting north to south.
 *
 * @fileoverview Contains route definition for S Block Floor 4 with
 * navigation connections, building context, and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * S Block Floor 4 Main Corridor Route
 *
 * Covers the main hallway on the fourth floor of S Block, featuring
 * elevator access and corridor sections connecting north to south.
 *
 * Navigation flow:
 * Elevator → Middle Sections → Corner → North Wing
 *
 * Key features:
 * - Elevator access to lower floors
 * - Corner section with directional change
 * - North wing corridor access
 * - Multiple middle sections
 */
export const sBlockFloor4Area: Area = {
  id: 's-block-floor-4-main',
  name: 'S Block',
  buildingBlock: 's',
  floorLevel: 4,
  photos: [
    {
      id: 's-f4-elevator-1',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_elevator_1.webp',
      startingAngle: 240,
      directions: {
        forwardRight: { connection: 's-f4-mid-2' },
        elevator: 'ns-elevator-interior'
      },
      buildingContext: {
        wing: 'middle',
        facilities: ['elevator']
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: -3, y: -1, z: 1.85 }  // Elevator access point
        },
        {
          direction: 'elevator',
          position: { x: -2.25, y: -1, z: -3 }  // Elevator access point
        }
      ]
    },
    {
      id: 's-f4-mid-2',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_mid_2.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 's-f4-mid-3' },
        back: { connection: 's-f4-elevator-1' },
        elevator: 'ns-elevator-interior'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: 4.5, y: -0.6, z: 4.5 }  // Elevator access point
        },
        {
          direction: 'elevator',
          position: { x: 8.75, y: -0.5, z: 4.85 }  // Elevator access point
        }
      ]
    },
    {
      id: 's-f4-mid-3',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_mid_3.webp',
      startingAngle: 190,
      directions: {
        forward: { connection: 's-f4-mid-4' },
        back: { connection: 's-f4-mid-2' }
      }
    },
    {
      id: 's-f4-mid-4',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_mid_4.webp',
      startingAngle: 165,
      directions: {
        forward: { connection: 's-f4-corner-5' },
        back: { connection: 's-f4-mid-3' }
      }
    },
    {
      id: 's-f4-corner-5',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_corner_5.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 's-f4-north-6' },
        left: { connection: 's-f4-mid-4' }
      },
      buildingContext: {
        wing: 'corner',
        facilities: ['corridor intersection']
      }
    },
    {
      id: 's-f4-north-6',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_north_6.webp',
      startingAngle: 190,
      directions: {
        forward: { connection: 's-f4-north-7' },
        back: { connection: 's-f4-corner-5' }
      },
      buildingContext: {
        wing: 'north',
        facilities: ['classrooms', 'offices']
      }
    },
    {
      id: 's-f4-north-7',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_north_7.webp',
      startingAngle: 190,
      directions: {
        forward: { connection: 's-f4-north-8' },
        back: { connection: 's-f4-north-6' },
        door: 's-f4-inside-453'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -2.5, y: -0.5, z: 2.5 },
          destination: 's-f4-inside-453'
        }
      ]
    },
    {
      id: 's-f4-inside-453',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_inside_453.webp',
      startingAngle: 0,
      directions: {
        door: ['s-f4-north-7', 's-f4-switch-1']
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -1.35, y: -0.35, z: 4.5 },
          destination: 's-f4-north-7'
        },
        {
          direction: 'door',
          position: { x: 4.75, y: -0.5, z: -5.5 },
          destination: 's-f4-switch-1'
        }
      ]
    },
    {
      id: 's-f4-switch-1',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_switch_1.webp',
      startingAngle: 190,
      directions: {
        forward: { connection: 's-f4-switch-2' },
        left: { connection: 's-f4-switch-6' },
        door: 's-f4-inside-453'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 0.2, y: -0.5, z: -2 },
          destination: 's-f4-inside-453'
        }
      ]
    },
    {
      id: 's-f4-switch-2',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_switch_2.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 's-f4-switch-3' },
        back: { connection: 's-f4-switch-1' },
        door: 's-f4-inside-453'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 6, y: -0.5, z: -0.75 },  // TODO: Set correct position
          destination: 's-f4-inside-453'
        }
      ]
    },
    {
      id: 's-f4-switch-3',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_switch_3.webp',
      startingAngle: 90,
      directions: {
        forward: { connection: 's-f4-switch-4' },
        left: { connection: 's-f4-switch-2' },
        door: 's-f4-north-8'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -3.5, y: -0.3, z: 6 },  // TODO: Set correct position
          destination: 's-f4-north-8'
        }
      ]
    },
    {
      id: 's-f4-switch-4',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_switch_4.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 's-f4-switch-5' },
        left: { connection: 's-f4-switch-3' },
        door: 's-f4-north-8'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 2.5, y: -0.3, z: 1.175 },  // TODO: Set correct position
          destination: 's-f4-north-8'
        }
      ]
    },
    {
      id: 's-f4-switch-5',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_switch_5.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 's-f4-switch-6' },
        back: { connection: 's-f4-switch-4' },
        door: 's-f4-north-8'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 5, y: -0.3, z: 1.25 },  // TODO: Set correct position
          destination: 's-f4-north-8'
        }
      ]
    },
    {
      id: 's-f4-switch-6',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_switch_6.webp',
      startingAngle: 100,
      directions: {
        left: { connection: 's-f4-switch-5' },
        forward: { connection: 's-f4-switch-1' },
        door: ['s-f4-inside-453', 's-f4-north-8']
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -1.7, y: -0.3, z: 6 },
          destination: 's-f4-inside-453'
        },
        {
          direction: 'door',
          position: { x: 7.25, y: -0.285, z: 2 },
          destination: 's-f4-north-8'
        }
      ]
    },
    {
      id: 's-f4-north-8',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_north_8.webp',
      startingAngle: 180,
      directions: {
        back: { connection: 's-f4-north-7' },
        door: 's-f4-switch-4'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -1.1, y: -0.35, z: 3 },  // TODO: Set correct position for switch-4
          destination: 's-f4-switch-4'
        }
      ]
    }
  ]
}