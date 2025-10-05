/**
 * W Block Gym Area Definition
 *
 * Defines the gymnasium facility in W Block.
 *
 * @fileoverview Contains route definition for W Block Gym with
 * navigation connections and facility access points.
 */

import type { Area } from '../../../types/tour'

/**
 * W Block Gymnasium Floor 1 Area
 *
 * Covers the ground floor gymnasium facility with sports and fitness amenities.
 *
 * Navigation flow:
 * Gym Entry ↔ Main W Block Corridor ↔ Gym Center ↔ Floor 2 Overlook
 *
 * Key features:
 * - Gymnasium facilities
 * - Sports equipment and courts
 * - Fitness amenities
 * - Stairs access to floor 2
 */
export const wBlockGymFloor1Area: Area = {
  id: 'w-block-gym-floor-1',
  name: 'The Recreation Centre',
  buildingBlock: 'w',
  floorLevel: 1,
  photos: [
    {
      id: 'w-gym-entry',
      imageUrl: '/360_photos_compressed/w_block/gym/floor_1/w_gym_entry.webp',
      startingAngle: 220,
      directions: {
        forward: { connection: 'w-gym-center' },
        door: 'w-f1-main-3',
        up: 'w-gym-overlook'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 3.5, y: -0.2, z: 1.5 },
          destination: 'w-f1-main-3'
        },
        {
          direction: 'door',
          position: { x: 3.5, y: -0.2, z: -1 },
          destination: 'w-f1-main-3'
        },
        {
          direction: 'up',
          position: { x: -0.65, y: 0, z: -4 },
          destination: 'w-gym-overlook'
        }
      ],
      buildingContext: {
        wing: 'gym',
        facilities: ['gymnasium', 'sports courts', 'fitness equipment']
      }
    },
    {
      id: 'w-gym-center',
      imageUrl: '/360_photos_compressed/w_block/gym/floor_1/w_gym_center.webp',
      startingAngle: 300,
      directions: {
        back: { connection: 'w-gym-entry' },
        up: 'w-gym-overlook'
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: -3.45, y: 0.15, z: 9 },
          destination: 'w-gym-overlook'
        }
      ]
    }
  ]
}

/**
 * W Block Gymnasium Floor 2 Area
 *
 * Covers the upper level gym overlook area.
 *
 * Navigation flow:
 * Floor 2 Overlook ↔ Floor 1 Gym Entry
 *
 * Key features:
 * - Gymnasium overlook
 * - View of courts below
 * - Stairs access to floor 1
 */
export const wBlockGymFloor2Area: Area = {
  id: 'w-block-gym-floor-2',
  name: 'The Recreation Centre',
  buildingBlock: 'w',
  floorLevel: 2,
  photos: [
    {
      id: 'w-gym-overlook',
      imageUrl: '/360_photos_compressed/w_block/gym/floor_2/w_gym_overlook.webp',
      startingAngle: 345,
      directions: {
        forward: { connection: 'w-gym-overlook-1' },
        back: { connection: 'w-f2-3'},
        down: 'w-gym-entry'
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: -0.6, y: -0.5, z: -2 },
          destination: 'w-gym-entry'
        }
      ],
      buildingContext: {
        wing: 'gym',
        facilities: ['gymnasium overlook', 'viewing area']
      }
    },
    {
      id: 'w-gym-overlook-1',
      imageUrl: '/360_photos_compressed/w_block/gym/floor_2/w_gym_overlook_1.webp',
      startingAngle: 0,
      directions: {
        back: { connection: 'w-gym-overlook' },
        down: 'w-gym-entry'
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: -7, y: -0.5, z: -1.5 },
          destination: 'w-gym-entry'
        }
      ]
    }
  ]
}
