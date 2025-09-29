/**
 * N/S Block Elevator System Definition
 *
 * Defines the elevator system for the N/S Block complex, providing vertical
 * navigation between floors 1, 2, and 4. The elevator serves as a central
 * hub connecting different levels of both N Block and S Block sections.
 *
 * @fileoverview Contains elevator definition for N/S Block with
 * floor connections, hotspot positioning, and navigation logic.
 */

import type { Elevator } from '../../../types/tour'

/**
 * N/S Block Elevator with Multi-Floor Access
 *
 * Central elevator system serving the N/S Block complex with access to
 * floors 1, 2, and 4. Features modern floor selection interface and
 * connects to major corridor intersections on each floor.
 *
 * Floor connections:
 * - Floor 1: N Block middle section (n_mid_7)
 * - Floor 2: Shared elevator entrance lobby
 * - Floor 4: Future N/S Block upper level (placeholder)
 *
 * Key features:
 * - Multi-floor service across N/S Block complex
 * - Direct access to main corridor intersections
 * - Modern elevator interface with floor selection buttons
 * - Central location for vertical building navigation
 */
export const nsBlockElevator: Elevator = {
  id: 'ns-block-elevator',
  name: 'N/S Block Elevator',
  buildingBlock: 'n', // Primary designation, serves both N and S
  photo: {
    id: 'ns-elevator-interior',
    imageUrl: '/360_photos_compressed/n_s_block/inside_elevator.webp',
    floorConnections: {
      floor1: 'n-f1-mid-7',           // N Block Floor 1 middle section
      floor2: 'n-f2-elevator-entrance', // Shared Floor 2 elevator entrance
      floor4: 'ns-f4-placeholder'     // Future Floor 4 connection
    },
    hotspots: [
      {
        floor: 1,
        position: { x: 5, y: -3.15, z: 4 }    // Floor 1 button (bottom)
      },
      {
        floor: 2,
        position: { x: 5, y: -2, z: 4 }     // Floor 2 button (middle)
      },
      {
        floor: 4,
        position: { x: 5, y: -0.85, z: 4 }     // Floor 4 button (top)
      }
    ]
  }
}