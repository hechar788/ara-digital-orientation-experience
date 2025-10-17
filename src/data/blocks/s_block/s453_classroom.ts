/**
 * S453 Classroom Area Definition
 *
 * Defines the S453 classroom located on the fourth floor of S Block's north wing.
 * Accessible from the main north corridor (s-f4-north-7) and has a door connection
 * to the switch room (s-f4-switch-1).
 *
 * @fileoverview Contains the area definition for S453 classroom with
 * navigation connections to the corridor and switch room.
 */

import type { Area } from '../../../types/tour'

/**
 * S453 Classroom Area
 *
 * A classroom space on the fourth floor of S Block's north wing.
 * Connected to both the main corridor and the switch room via door hotspots.
 *
 * Navigation flow:
 * Classroom ↔ North Corridor (s-f4-north-7)
 * Classroom ↔ Switch Room (s-f4-switch-1)
 */
export const s453ClassroomArea: Area = {
  id: 's453-classroom',
  name: 'S453 Classroom',
  buildingBlock: 's',
  floorLevel: 4,
  photos: [
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
      ],
      buildingContext: {
        wing: 'north',
        facilities: ['classroom']
      }
    }
  ]
}
