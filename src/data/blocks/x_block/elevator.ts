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
        position: { x: 3.193, y: -1.653, z: 8.826 }   // Floor 1 button (lower right on panel)
      },
      {
        floor: 2,
        position: { x: 0, y: 0, z: 9.5 }    // Floor 2 button (center of panel)
      },
      {
        floor: 3,
        position: { x: -3.193, y: 1.653, z: 8.826 }   // Floor 3 button (upper left on panel)
      }
    ]
  }
}