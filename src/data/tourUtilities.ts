/**
 * VR Campus Tour Data
 *
 * Central access point for all tour area data from building blocks.
 * Aggregates areas from all building data files into a single collection.
 *
 * @fileoverview Exports all tour areas for use throughout the application.
 */

import { aBlockAreas } from './blocks/a_block'
import { xBlockAreas } from './blocks/x_block'
import { nBlockAreas } from './blocks/n_block'
import { sBlockAreas } from './blocks/s_block'
import { nsBlockElevator } from './blocks/n_s_shared/elevator'

/**
 * Get all available areas in the tour systemRGo
 *
 * Collects and returns all area definitions from all building blocks
 * and elevator systems. As new building areas are added, import them
 * and include in the array.
 *
 * @returns Array of all area definitions and elevators
 */
export const getAllAreas = (): any[] => {
  return [
    ...aBlockAreas,
    ...xBlockAreas,
    ...nBlockAreas,
    ...sBlockAreas,
    nsBlockElevator
  ]
}

