/**
 * X Block Floor 3 Area Definition
 *
 * Defines the main hallway on the third floor of X Block, starting from a
 * west entrance and proceeding through west wing, middle sections, to east wing.
 * Features a side corridor branch accessible from the west wing.
 *
 * @fileoverview Contains route definition for X Block Floor 3 with
 * navigation connections, building context, and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * X Block Floor 3 Main Corridor Route
 *
 * Covers the main hallway on the third floor of X Block, starting from a
 * west entrance and proceeding through west wing, middle sections, to east wing.
 * Features a side corridor branch accessible from the west wing.
 *
 * Navigation flow:
 * West Entry → West Wing → Middle Sections → East Wing
 *
 * Key features:
 * - West entrance access point
 * - Side corridor branch from west-1
 * - Classroom and office areas throughout
 * - Top floor of the building
 */
export const xBlockFloor3Area: Area = {
  id: 'x-block-floor-3-main',
  name: 'X Block',
  buildingBlock: 'x',
  floorLevel: 3,
  photos: [
    {
      id: 'x-f3-west-entry',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_west_entry.webp',
      startingAngle: 347.5,
      directions: {
        back: { connection: 'x-f3-west-1' },
        down: 'x-f2-north-entry'
      },
      buildingContext: {
        wing: 'west',
        facilities: ['entrance', 'elevator access']
      },
      hotspots: [
        {
          direction: 'down',
          position: { x: 0.85, y: -0.5, z: -3.5 }  // Stairs
        }
      ]
    },
    {
      id: 'x-f3-west-1',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_west_1.webp',
      startingAngle: 11.5,
      directions: {
        back: { connection: 'x-f3-west-2' },
        forward: { connection: 'x-f3-west-entry' },
        left: { connection: 'x-f3-west-1-aside' }
      },
      nearbyRooms: [
        {
          roomNumber: 'X302',
          roomType: 'classroom'
        },
        {
          roomNumber: 'X304',
          roomType: 'classroom'
        }
      ]
    },
    {
      id: 'x-f3-west-1-aside',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_west_1_aside.webp',
      directions: {
        back: { connection: 'x-f3-west-1' },
        door: 'x-302-classroom'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 5, y: -0.5, z: 0.4 },
          destination: 'x-303-classroom'
        }
      ],
      nearbyRooms: [
        {
          roomNumber: 'X303',
          roomType: 'classroom'
        },
        {
          roomNumber: 'X305',
          roomType: 'classroom'
        }
      ]
    },
    {
      id: 'x-303-classroom',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x302.webp',
      directions: {
        door: 'x-f3-west-1-aside'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -4.5, y: -0.35, z: -4.9 },
          destination: 'x-f3-west-1-aside'
        }
      ]
    },
    // {
    //   id: 'x-f3-west-2',
    //   imageUrl: '/360_photos_compressed/x_block/floor_3/x_west_2.webp',
    //   directions: {
    //     back: { connection: 'x-f3-mid-3' },
    //     forward: { connection: 'x-f3-west-1' }
    //   },
    //   buildingContext: {
    //     wing: 'west',
    //     facilities: ['classrooms', 'offices']
    //   }
    // },
    {
      id: 'x-f3-west-2',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_mid_3.webp',
      directions: {
        back: { connection: 'x-f3-mid-4' },
        forward: { connection: 'x-f3-west-1' }
      }
    },
    {
      id: 'x-f3-mid-4',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_mid_4.webp',
      startingAngle: 7.5,
      directions: {
        back: { connection: 'x-f3-mid-5' },
        forward: { connection: 'x-f3-west-2' }
      }
    },
    {
      id: 'x-f3-mid-5',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_mid_5.webp',
      directions: {
        back: { connection: 'x-f3-east-6' },
        forward: { connection: 'x-f3-mid-4' }
      }
    },
    {
      id: 'x-f3-east-6',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_east_6.webp',
      directions: {
        back: { connection: 'x-f3-east-7' },
        forward: { connection: 'x-f3-mid-5' }
      },
      nearbyRooms: [
        {
          roomNumber: 'X306',
          roomType: 'classroom'
        },
        {
          roomNumber: 'X308',
          roomType: 'classroom'
        }
      ]
    },
    {
      id: 'x-f3-east-7',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_east_7.webp',
      startingAngle: 80,
      directions: {
        back: { connection: 'x-f3-east-8' },
        forwardLeft: { connection: 'x-f3-east-6' },
        elevator: 'x-elevator-interior'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: -2.5, y: -0.5, z: 0.75 }  // Elevator access point
        }
      ]
    },
    {
      id: 'x-f3-east-8',
      imageUrl: '/360_photos_compressed/x_block/floor_3/x_east_8.webp',
      startingAngle: 90,
      directions: {
        back: { connection: 'x-f3-east-7' }
      },
      nearbyRooms: [
        {
          roomNumber: 'X313',
          roomType: 'classroom'
        }
      ]
    }
  ]
}