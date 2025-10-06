/**
 * S Block Area Collection
 *
 * Aggregates all S Block floor areas for export to the tour system.
 * Imports individual floor definitions and combines them into a single collection.
 *
 * @fileoverview Exports all S Block areas for use throughout the application.
 */

import type { Area } from '../../../types/tour'
import { sBlockFloor1Area } from './floor1'
import { sBlockFloor2Area } from './floor2'
import { sBlockFloor4Area } from './floor4'
import { s453ClassroomArea } from './s453_classroom'
import { switchRoomArea } from './switch_room'

/**
 * Collection of all S Block areas (floors 1, 2, 4, and rooms)
 *
 * Contains all floor areas with their complete photo sequences and
 * navigation connections, plus individual room areas.
 * Used as the primary export for S Block navigation.
 */
export const sBlockAreas: Area[] = [
  sBlockFloor1Area,
  sBlockFloor2Area,
  sBlockFloor4Area,
  s453ClassroomArea,
  switchRoomArea
]

// Re-export individual areas for direct access if needed
export { sBlockFloor1Area } from './floor1'
export { sBlockFloor2Area } from './floor2'
export { sBlockFloor4Area } from './floor4'
export { s453ClassroomArea } from './s453_classroom'
export { switchRoomArea } from './switch_room'