/**
 * Outside Area Collection
 *
 * Aggregates all outside campus areas for export to the tour system.
 * Imports individual outdoor area definitions.
 *
 * @fileoverview Exports all outside areas for use throughout the application.
 */

import type { Area } from '../../../types/tour'
import { outsideArea } from './outside'

/**
 * Collection of all outside areas
 *
 * Contains all outdoor campus areas with complete photo sequences and
 * navigation connections. Used as the primary export for outside navigation.
 */
export const outsideAreas: Area[] = [
  outsideArea
]

// Re-export individual area for direct access
export { outsideArea } from './outside'
