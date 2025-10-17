/**
 * W Block Floor 1 Area Definition
 *
 * Defines the main entrance and ground floor of W Block.
 *
 * @fileoverview Contains route definition for W Block Floor 1 with
 * navigation connections, building context, and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * W Block Floor 1 Main Entrance Route
 *
 * Covers the main entrance on the ground floor of W Block.
 *
 * Navigation flow:
 * Main Entrance ↔ Exterior Campus
 *
 * Key features:
 * - Building main entrance
 * - Connection to outside areas
 */
export const wBlockFloor1Area: Area = {
  id: 'w-block-floor-1-main',
  name: 'W Block',
  buildingBlock: 'w',
  floorLevel: 1,
  photos: [
    {
      id: 'w-f1-main-entrance',
      imageUrl: '/360_photos_compressed/w_block/floor_1/w_main_entrance.webp',
      startingAngle: 200,
      directions: {
        forwardLeft: { connection: 'w-f1-main-1' },
        door: 'outside-w-entrance'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 1.75, y: -0.15, z: 1.25 },
          destination: 'outside-w-entrance'
        }
      ],
      buildingContext: {
        wing: 'main',
        facilities: ['main entrance']
      }
    },
    {
      id: 'w-f1-main-1',
      imageUrl: '/360_photos_compressed/w_block/floor_1/w_main_1.webp',
      startingAngle: 170,
      directions: {
        forward: { connection: 'w-f1-main-2' },
        back: { connection: 'w-f1-main-entrance' },
        up: 'w-f2-entry'
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: 0.35, y: 0, z: 3 },
          destination: 'w-f2-entry'
        }
      ]
    },
    {
      id: 'w-f1-main-2',
      imageUrl: '/360_photos_compressed/w_block/floor_1/w_main_2.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'w-f1-main-3' },
        back: { connection: 'w-f1-main-1' },
        door: 'w-gym-entry',
        up: 'w-f2-entry'
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: 5.75, y: 0.1, z: 2.15 },
          destination: 'w-f2-entry'
        },
        {
          direction: 'door',
          position: { x: -8, y: -0.5, z: -0.225 },
          destination: 'w-gym-entry'
        },
        {
          direction: 'door',
          position: { x: -8, y: -0.5, z: -1.85 },
          destination: 'w-gym-entry'
        }
      ]
    },
    {
      id: 'w-f1-main-3',
      imageUrl: '/360_photos_compressed/w_block/floor_1/w_main_3.webp',
      startingAngle: 180,
      directions: {
        forwardLeft: { connection: 'w-f1-main-3-aside' },
        back: { connection: 'w-f1-main-2' },
        door: 'w-gym-entry'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -4.5, y: -0.25, z: -0.225 },
          destination: 'w-gym-entry'
        },
        {
          direction: 'door',
          position: { x: -4.5, y: -0.25, z: -2.5 },
          destination: 'w-gym-entry'
        }
      ]
    },
    {
      id: 'w-f1-main-3-aside',
      imageUrl: '/360_photos_compressed/w_block/floor_1/w_main_3_aside.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'w-f1-main-3-aside-1' },
        back: { connection: 'w-f1-main-3' }
      }
    },
    {
      id: 'w-f1-main-3-aside-1',
      imageUrl: '/360_photos_compressed/w_block/floor_1/w_main_3_aside_1.webp',
      startingAngle: 185,
      directions: {
        forward: { connection: 'w-f1-main-3-aside-2' },
        back: { connection: 'w-f1-main-3-aside' }
      }
    },
    {
      id: 'w-f1-main-3-aside-2',
      imageUrl: '/360_photos_compressed/w_block/floor_1/w_main_3_aside_2.webp',
      startingAngle: 185,
      directions: {
        back: { connection: 'w-f1-main-3-aside-1' }
      }
    }
  ]
}
