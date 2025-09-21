/**
 * X Block Area Collection
 *
 * Aggregates all X Block floor areas for export to the tour system.
 * Imports individual floor definitions and combines them into a single collection.
 *
 * @fileoverview Exports all X Block areas for use throughout the application.
 */

import type { Area } from '../../../types/tour'
import { xBlockFloor1Area } from './floor1'
import { xBlockFloor2Area } from './floor2'
import { xBlockFloor3Area } from './floor3'

/**
 * Collection of all X Block areas (floors 1-3)
 *
 * Contains all floor areas with complete photo sequences and navigation
 * connections. Used as the primary export for X Block navigation.
 */
export const xBlockAreas: Area[] = [
  xBlockFloor1Area,
  xBlockFloor2Area,
  xBlockFloor3Area
]

// Re-export individual areas for direct access
export { xBlockFloor1Area } from './floor1'
export { xBlockFloor2Area } from './floor2'
export { xBlockFloor3Area } from './floor3'