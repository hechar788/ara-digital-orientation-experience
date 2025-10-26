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
        },
        {
          direction: 'information',
          position: { x: 4.0, y: -0.75, z: -2.55 },
          title: "Sandy's Office - Computing Administrator",
          description: "Sandy is the Computing Administrator who helps students with:\n\n• Timetable clashes and schedule conflicts\n• Course enrollments and registration\n• Picking electives for your degree\n• Cross-crediting and transfer credits\n• Administrative matters for computing courses\n\nSandy can also assist in liaising with lecturers, finding lecturer offices, checking if lecturers are on campus, and finding out when they might be available.\n\nLocation: N Block, Floor 1, West Wing"
        }
      ],
      buildingContext: {
        wing: 'west',
        facilities: ['office']
      }
    }
  ]
}
