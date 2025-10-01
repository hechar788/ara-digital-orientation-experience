/**
 * Library Area Collection
 *
 * Aggregates all Library floor areas for export to the tour system.
 * Imports individual floor definitions.
 *
 * @fileoverview Exports all Library areas for use throughout the application.
 */

import type { Area } from '../../../types/tour'
import { libraryFloor1Area } from './floor1'

/**
 * Collection of all Library areas
 *
 * Contains all floor areas with complete photo sequences and navigation
 * connections. Used as the primary export for Library navigation.
 */
export const libraryAreas: [Area] = [
  libraryFloor1Area
]

// Re-export individual areas for direct access
export { libraryFloor1Area } from './floor1'
