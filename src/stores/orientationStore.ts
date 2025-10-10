/**
 * Orientation mode exploration state store
 *
 * Manages persistent campus exploration during normal orientation/tour mode.
 * Discoveries tracked here persist across all mode switches and provide a
 * permanent record of genuine campus exploration.
 *
 * This store is completely independent from race mode tracking.
 *
 * @fileoverview TanStack Store for orientation mode area discoveries
 */

import { Store } from '@tanstack/store'

/**
 * Orientation exploration state interface
 *
 * Tracks areas discovered during normal campus orientation.
 * This state is persistent and survives mode switches.
 *
 * @property discoveredAreas - Set of area IDs visited during orientation
 */
export interface OrientationState {
  discoveredAreas: Set<string>
}

/**
 * Orientation store instance
 *
 * Global state for tracking campus exploration during orientation mode.
 * State persists across mode switches and component remounts.
 */
export const orientationStore = new Store<OrientationState>({
  discoveredAreas: new Set<string>()
})

/**
 * Add a discovered area to orientation exploration
 *
 * Records that the user has visited a specific area during normal campus
 * orientation. This discovery persists indefinitely and provides a permanent
 * record of exploration progress.
 *
 * @param areaId - Unique identifier of the area being discovered
 *
 * @example
 * ```typescript
 * addOrientationDiscovery('a-block-floor-1-main')
 * addOrientationDiscovery('library-entrance')
 * ```
 */
export function addOrientationDiscovery(areaId: string): void {
  const currentState = orientationStore.state
  const newDiscoveredAreas = new Set(currentState.discoveredAreas)
  newDiscoveredAreas.add(areaId)

  orientationStore.setState(() => ({
    discoveredAreas: newDiscoveredAreas
  }))
}

/**
 * Get the count of areas discovered in orientation mode
 *
 * Returns the number of unique areas visited during normal campus orientation.
 * This count persists across all mode switches.
 *
 * @returns Number of orientation discoveries
 *
 * @example
 * ```typescript
 * const count = getOrientationDiscoveriesCount()
 * console.log(`Orientation areas discovered: ${count}`)
 * ```
 */
export function getOrientationDiscoveriesCount(): number {
  return orientationStore.state.discoveredAreas.size
}

/**
 * Check if an area has been discovered in orientation mode
 *
 * Determines whether the user has visited a given area during normal
 * campus orientation.
 *
 * @param areaId - Unique identifier of the area to check
 * @returns True if area was discovered in orientation mode, false otherwise
 *
 * @example
 * ```typescript
 * if (hasOrientationDiscovery('library-entrance')) {
 *   console.log('You have explored this area in orientation mode')
 * }
 * ```
 */
export function hasOrientationDiscovery(areaId: string): boolean {
  return orientationStore.state.discoveredAreas.has(areaId)
}

/**
 * Get all discovered area IDs
 *
 * Returns the complete set of area IDs discovered during orientation.
 * Useful for advanced analytics or export functionality.
 *
 * @returns Set of discovered area IDs
 *
 * @example
 * ```typescript
 * const areas = getOrientationDiscoveries()
 * console.log('Visited areas:', Array.from(areas))
 * ```
 */
export function getOrientationDiscoveries(): Set<string> {
  return new Set(orientationStore.state.discoveredAreas)
}
