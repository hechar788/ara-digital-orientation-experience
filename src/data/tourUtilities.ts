/**
 * VR Campus Tour Data
 *
 * Central access point for all tour area data from building blocks.
 * Aggregates areas from all building data files into a single collection.
 *
 * @fileoverview Exports all tour areas for use throughout the application.
 */

import type { Area } from '../types/tour'
import { aBlockAreas } from './blocks/aBlock'
import { xBlockAreas } from './blocks/xBlock'

/**
 * Get all available areas in the tour system
 *
 * Collects and returns all area definitions from all building blocks.
 * As new building areas are added, import them and include in the array.
 *
 * @returns Array of all area definitions
 */
export const getAllAreas = (): Area[] => {
  return [
    ...aBlockAreas,
    ...xBlockAreas
    // Add other building areas here as they're implemented:
    // ...nBlockAreas,
    // ...sBlockAreas
  ]
}