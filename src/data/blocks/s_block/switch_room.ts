/**
 * Switch Room Area Definition
 *
 * Defines the switch room located on the fourth floor of S Block's north wing.
 * A network/electrical room accessible from S453 classroom with multiple
 * internal navigation points and a connection to the north corridor.
 *
 * @fileoverview Contains the area definition for the switch room with
 * navigation connections throughout the room and to adjacent areas.
 */

import type { Area } from '../../../types/tour'

/**
 * Switch Room Area
 *
 * A network/electrical switch room on the fourth floor of S Block's north wing.
 * Contains multiple viewpoints throughout the room with connections to
 * S453 classroom and the north corridor.
 *
 * Navigation flow:
 * Switch Room (6 viewpoints) ↔ S453 Classroom (s-f4-inside-453)
 * Switch Room ↔ North Corridor (s-f4-north-8)
 */
export const switchRoomArea: Area = {
  id: 'switch-room',
  name: 'Switch Room',
  buildingBlock: 's',
  floorLevel: 4,
  photos: [
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
      startingAngle: 187.5,
      directions: {
        forward: { connection: 's-f4-switch-3' },
        back: { connection: 's-f4-switch-1' },
        door: 's-f4-inside-453'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 6, y: -0.5, z: -0.75 },
          destination: 's-f4-inside-453'
        }
      ]
    },
    {
      id: 's-f4-switch-3',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_switch_3.webp',
      startingAngle: 95,
      directions: {
        forward: { connection: 's-f4-switch-4' },
        left: { connection: 's-f4-switch-2' },
        door: 's-f4-north-8'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -3.5, y: -0.3, z: 6 },
          destination: 's-f4-north-8'
        }
      ]
    },
    {
      id: 's-f4-switch-4',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_switch_4.webp',
      startingAngle: 190,
      directions: {
        forward: { connection: 's-f4-switch-5' },
        left: { connection: 's-f4-switch-3' },
        door: 's-f4-north-8'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 2.5, y: -0.3, z: 1.175 },
          destination: 's-f4-north-8'
        }
      ]
    },
    {
      id: 's-f4-switch-5',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_switch_5.webp',
      startingAngle: 185,
      directions: {
        forward: { connection: 's-f4-switch-6' },
        back: { connection: 's-f4-switch-4' },
        door: 's-f4-north-8'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 5, y: -0.3, z: 1.25 },
          destination: 's-f4-north-8'
        }
      ]
    },
    {
      id: 's-f4-switch-6',
      imageUrl: '/360_photos_compressed/n_s_block/s_block/floor_4/s_switch_6.webp',
      startingAngle: 102.5,
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
    }
  ]
}
