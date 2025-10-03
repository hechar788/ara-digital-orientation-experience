/**
 * Student Lounge Area Collection
 *
 * Defines the student lounge area for the campus tour.
 * This standalone facility provides student amenities and social spaces.
 *
 * @fileoverview Exports student lounge area for use throughout the application.
 */

import type { Area } from '../../../types/tour'

/**
 * Student Lounge Area
 *
 * A dedicated student facility featuring social spaces, study areas, and amenities.
 * Connected to the exterior campus via Madras Street entrance and accessible from
 * the cafeteria area.
 *
 * Navigation flow:
 * Outside Cafeteria ↔ Student Lounge Interior
 *
 * Key features:
 * - Student social spaces
 * - Study and collaboration areas
 * - Food and beverage facilities
 * - Madras Street access
 */
export const studentLoungeArea: Area = {
  id: 'student-lounge-area',
  name: 'Student Lounge',
  buildingBlock: 'lounge',
  floorLevel: 1,
  photos: [
    {
      id: 'inside-student-lounge',
      imageUrl: '/360_photos_compressed/student_lounge/inside_student_lounge.webp',
      startingAngle: 180,
      directions: {
        door: 'outside-cafeteria-3'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 4.5, y: -0.25, z: -0.15 },
          destination: 'outside-cafeteria-3'
        }
      ],
      buildingContext: {
        wing: 'main',
        facilities: ['student lounge', 'social spaces', 'study areas']
      }
    }
  ]
}

/**
 * Collection of all Student Lounge areas
 *
 * Contains the student lounge interior with navigation connections.
 * Used as the primary export for Student Lounge navigation.
 */
export const studentLoungeAreas: Area[] = [
  studentLoungeArea
]
