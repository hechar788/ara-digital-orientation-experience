/**
 * W Block Area Collection
 *
 * Aggregates all W Block floor areas for export to the tour system.
 * Imports individual floor definitions and combines them into a single collection.
 *
 * @fileoverview Exports all W Block areas for use throughout the application.
 */

import type { Area } from '../../../types/tour'
import { wBlockFloor1Area } from './floor1'
import { wBlockFloor2Area } from './floor2'
import { wBlockGymFloor1Area, wBlockGymFloor2Area } from './gym'

/**
 * Collection of all W Block areas (floor 1, gym floor 1, and gym floor 2)
 *
 * Contains floor area and gymnasium areas with complete photo sequences and
 * navigation connections. Used as the primary export for W Block navigation.
 */
export const wBlockAreas: Area[] = [
  wBlockFloor1Area,
  wBlockGymFloor1Area,
  wBlockGymFloor2Area,
  wBlockFloor2Area
]

// Re-export individual areas for direct access if needed
export { wBlockFloor1Area } from './floor1'
export { wBlockFloor2Area } from './floor2'
export { wBlockGymFloor1Area, wBlockGymFloor2Area } from './gym'

