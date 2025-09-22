/**
 * A Block Area Collection
 *
 * Aggregates all A Block floor areas for export to the tour system.
 * Imports individual floor definitions and combines them into a single collection.
 *
 * @fileoverview Exports all A Block areas for use throughout the application.
 */

import type { Area } from '../../../types/tour'
import { aBlockFloor1Area } from './floor1'
import { aBlockFloor2Area } from './floor2'

/**
 * Collection of all A Block areas (floors 1-2)
 *
 * Contains both floor areas with their complete photo sequences and
 * navigation connections. Used as the primary export for A Block navigation.
 */
export const aBlockAreas: Area[] = [
  aBlockFloor1Area,
  aBlockFloor2Area
]

// Re-export individual areas for direct access if needed
export { aBlockFloor1Area } from './floor1'
export { aBlockFloor2Area } from './floor2'