/**
 * Outside Area Definition
 *
 * Defines the exterior campus grounds and pathways connecting the various
 * building blocks. Provides outdoor navigation and orientation for the
 * overall campus layout.
 *
 * @fileoverview Contains route definition for outside areas with
 * navigation connections and building entrance access points.
 */

import type { Area } from '../../../types/tour'

/**
 * Outside Campus Area
 *
 * Covers the exterior campus grounds with pathways and building entrances.
 * Provides outdoor navigation between different building blocks and serves
 * as the primary orientation area for campus visitors.
 *
 * Navigation flow:
 * Building Entrances ↔ Campus Pathways ↔ Outdoor Spaces
 *
 * Key features:
 * - Outdoor pathways connecting building blocks
 * - Multiple building entrance access points
 * - Campus orientation and wayfinding
 * - Exterior architecture views
 */
export const outsideArea: Area = {
  id: 'outside-area',
  name: 'Outside',
  buildingBlock: 'outside',
  floorLevel: 0,
  photos: [
    {
      id: 'outside-x-north-entrance',
      imageUrl: '/360_photos_compressed/outside/outside_x_north_entrance.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-x-north-1' },
        door: 'x-f1-west-12'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 6, y: -0.15, z: 0.7 },
          destination: 'x-f1-west-12'
        }
      ]
    },
    {
      id: 'outside-x-north-1',
      imageUrl: '/360_photos_compressed/outside/outside_x_north_1.webp',
      startingAngle: 270,
      directions: {
        left: { connection: 'outside-x-north-2' },
        back: { connection: 'outside-x-north-entrance' }
      }
    },
    {
      id: 'outside-x-north-2',
      imageUrl: '/360_photos_compressed/outside/outside_x_north_2.webp',
      startingAngle: 185,
      directions: {
        forward: { connection: 'outside-n-north-1' },
        back: { connection: 'outside-x-north-1' }
      }
    },
    {
      id: 'outside-n-north-1',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_1.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-n-north-2' },
        right: { connection: 'outside-n-north-1-aside' },
        forwardLeft: { connection: 'outside-n-north-entrance' },
        back: { connection: 'outside-x-north-2' }
      }
    },
    {
      id: 'outside-n-north-2',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_2.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-north-1' },
        back: { connection: 'outside-n-north-1' }
      }
    },
    {
      id: 'outside-n-north-entrance',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_entrance.webp',
      startingAngle: 190,
      directions: {
        forwardRight: { connection: 'outside-s-north-entrance' },
        back: { connection: 'outside-n-north-1' },
        door: 'n-f1-mid-7'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -5.5, y: -0.3, z: -0.15 },
          destination: 'n-f1-mid-7'
        }
      ]
    },
    {
      id: 'outside-s-north-entrance',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_entrance.webp',
      directions: {
        forward: { connection: 'outside-s-north-1' },
        backRight: { connection: 'outside-n-north-entrance' },
        door: 'n-f1-mid-7'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -5, y: -0.3, z: -0.5 },
          destination: 'n-f1-mid-7'
        }
      ]
    },
    {
      id: 'outside-s-north-1',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_1.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-north-2' },
        back: { connection: 'outside-n-north-2' },
        backLeft: { connection: 'outside-s-north-entrance' }
      }
    },
    {
      id: 'outside-n-north-1-aside',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_1_aside.webp',
      startingAngle: 10,
      directions: {
        forward: { connection: 'outside-n-north-1-aside-1' },
        back: { connection: 'outside-n-north-1' }
      }
    },
    {
      id: 'outside-n-north-1-aside-1',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_1_aside_1.webp',
      startingAngle: 10,
      directions: {
        forward: { connection: 'outside-n-north-1-aside-2' },
        back: { connection: 'outside-n-north-1-aside' }
      }
    },
    {
      id: 'outside-n-north-1-aside-2',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_1_aside_2.webp',
      startingAngle: 0,
      directions: {
        back: { connection: 'outside-n-north-1-aside-1' }
      }
    },
    {
      id: 'outside-s-north-2',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_2.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-north-3' },
        back: { connection: 'outside-s-north-1' }
      }
    },
    {
      id: 'outside-s-north-3',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_3.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-north-4' },
        backLeft: { connection: 'outside-s-north-2' }
      }
    },
    {
      id: 'outside-s-north-4',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_4.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-east-5' },
        back: { connection: 'outside-s-north-3' }
      }
    },
    {
      id: 'outside-s-east-5',
      imageUrl: '/360_photos_compressed/outside/outside_s_east_5.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-east-6' },
        back: { connection: 'outside-s-north-4' }
      }
    },
    {
      id: 'outside-s-east-6',
      imageUrl: '/360_photos_compressed/outside/outside_s_east_6.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-east-7' },
        back: { connection: 'outside-s-east-5' }
      }
    },
    {
      id: 'outside-s-east-7',
      imageUrl: '/360_photos_compressed/outside/outside_s_east_7.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-east-8' },
        back: { connection: 'outside-s-east-6' }
      }
    },
    {
      id: 'outside-s-east-8',
      imageUrl: '/360_photos_compressed/outside/outside_s_east_8.webp',
      startingAngle: 180,
      directions: {
        back: { connection: 'outside-s-east-7' }
      }
    }
  ]
}
