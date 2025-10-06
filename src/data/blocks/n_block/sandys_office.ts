/**
 * Sandy's Office Area Definition
 *
 * Defines Sandy's office located on the first floor of N Block's west wing.
 * Accessible from the main west corridor (n-f1-west-9).
 *
 * @fileoverview Contains the area definition for Sandy's office with
 * navigation connection back to the main corridor.
 */

import type { Area } from '../../../types/tour'

/**
 * Sandy's Office Area
 *
 * A single office space on the first floor of N Block's west wing.
 * Connected to the main corridor via door hotspot.
 *
 * Navigation flow:
 * Office ↔ N Block West Corridor (n-f1-west-9)
 */
export const sandysOfficeArea: Area = {
  id: 'sandys-office',
  name: 'Sandys Office',
  buildingBlock: 'n',
  floorLevel: 1,
  photos: [
    {
      id: 'n-f1-sandys-office',
      imageUrl: '/360_photos_compressed/n_s_block/n_block/floor_1/sandys_office.webp',
      directions: {
        door: 'n-f1-west-9'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -3.5, y: -0.45, z: 0.5 },
          destination: 'n-f1-west-9'
        }
      ],
      buildingContext: {
        wing: 'west',
        facilities: ['office']
      }
    }
  ]
}
