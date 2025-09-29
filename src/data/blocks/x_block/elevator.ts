/**
 * X Block Elevator System Definition
 *
 * Defines the elevator that serves all three floors of X Block, providing
 * vertical navigation between floors with an intuitive floor selection interface.
 *
 * @fileoverview Contains elevator definition for X Block with floor connections
 * and interactive hotspots for floor selection buttons.
 */

import type { Elevator } from '../../../types/tour'

/**
 * X Block Elevator System
 *
 * Central elevator serving all three floors of X Block. Users can access the
 * elevator from key locations on each floor and select their destination floor
 * using interactive floor selection buttons positioned on the elevator panel.
 *
 * Connected floors:
 * - Floor 1: x-f1-mid-6 (middle corridor near elevator)
 * - Floor 2: x-f2-mid-7 (middle corridor intersection)
 * - Floor 3: x-f3-east-7 (east wing corridor)
 *
 * Navigation flow:
 * Floor Photo → Click Elevator Hotspot → Elevator Interior → Click Floor Button → Destination Floor
 */
export const xBlockElevator: Elevator = {
  id: 'x-block-elevator',
  name: 'X Block Elevator',
  buildingBlock: 'x',
  photo: {
    id: 'x-elevator-interior',
    imageUrl: '/360_photos_compressed/x_block/x_elevator.webp',
    floorConnections: {
      floor1: 'x-f1-mid-6',
      floor2: 'x-f2-mid-7',
      floor3: 'x-f3-east-7'
    },
    hotspots: [
      {
        floor: 1,
        position: { x: 5, y: -3.15, z: 7 }   // Floor 1 button (bottom)
      },
      {
        floor: 2,
        position: { x: 5, y: -2, z: 7 }    // Floor 2 button (middle)
      },
      {
        floor: 3,
        position: { x: 5, y: -0.85, z: 7 }    // Floor 3 button (top)
      }
    ]
  }
}