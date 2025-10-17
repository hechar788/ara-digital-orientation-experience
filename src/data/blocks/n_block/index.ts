/**
 * N Block Area Collection
 *
 * Aggregates all N Block floor areas for export to the tour system.
 * Imports individual floor definitions and combines them into a single collection.
 *
 * @fileoverview Exports all N Block areas for use throughout the application.
 */

import type { Area } from '../../../types/tour'
import { nBlockFloor1Area } from './floor1'
import { nBlockFloor2Area } from './floor2'
import { sandysOfficeArea } from './sandys_office'

/**
 * Collection of all N Block areas (floors 1-2 and offices)
 *
 * Contains both floor areas with their complete photo sequences and
 * navigation connections, plus individual office areas.
 * Used as the primary export for N Block navigation.
 */
export const nBlockAreas: Area[] = [
  nBlockFloor1Area,
  nBlockFloor2Area,
  sandysOfficeArea
]

// Re-export individual areas for direct access if needed
export { nBlockFloor1Area } from './floor1'
export { nBlockFloor2Area } from './floor2'
export { sandysOfficeArea } from './sandys_office'