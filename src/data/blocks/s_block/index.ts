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

/**
 * Collection of all S Block areas (floors 1-2)
 *
 * Contains both floor areas with their complete photo sequences and
 * navigation connections. Used as the primary export for S Block navigation.
 */
export const sBlockAreas: Area[] = [
  sBlockFloor1Area,
  sBlockFloor2Area
]

// Re-export individual areas for direct access if needed
export { sBlockFloor1Area } from './floor1'
export { sBlockFloor2Area } from './floor2'