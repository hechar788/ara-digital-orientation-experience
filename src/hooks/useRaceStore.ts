/**
 * React hook for subscribing to race store state
 *
 * Provides reactive access to race mode progress state with automatic
 * component re-renders when race progress changes.
 *
 * @fileoverview Custom React hook for race store integration
 */

import { useStore } from '@tanstack/react-store'
import {
  raceStore,
  addRaceAreaDiscovery,
  addRaceHiddenLocation,
  resetRace,
  getRaceAreasCount,
  getRaceHiddenLocationsCount,
  hasRaceAreaDiscovery,
  hasRaceHiddenLocation,
  getRaceDiscoveries,
  getRaceHiddenLocations
} from '../stores/raceStore'

/**
 * Return type for the useRaceStore hook
 *
 * Provides reactive state values and action functions for managing
 * race mode progress tracking.
 *
 * @property discoveredAreas - Set of area IDs visited in current race (ephemeral)
 * @property foundHiddenLocations - Set of hidden location IDs found in current race (ephemeral)
 * @property areasCount - Computed count of race area discoveries
 * @property hiddenLocationsCount - Computed count of found hidden locations
 * @property addAreaDiscovery - Function to mark an area as discovered in race
 * @property addHiddenLocation - Function to mark a hidden location as found
 * @property reset - Function to reset all race progress (areas + hidden locations)
 * @property hasAreaDiscovery - Function to check if area was discovered in race
 * @property hasHiddenLocation - Function to check if location was found in race
 * @property getDiscoveries - Function to get all discovered area IDs
 * @property getHiddenLocations - Function to get all found hidden location IDs
 */
export interface UseRaceStoreReturn {
  discoveredAreas: Set<string>
  foundHiddenLocations: Set<string>
  areasCount: number
  hiddenLocationsCount: number
  addAreaDiscovery: (areaId: string) => void
  addHiddenLocation: (locationId: string) => void
  reset: () => void
  hasAreaDiscovery: (areaId: string) => boolean
  hasHiddenLocation: (locationId: string) => boolean
  getDiscoveries: () => Set<string>
  getHiddenLocations: () => Set<string>
}

/**
 * Custom hook for accessing race store state and actions
 *
 * Subscribes component to race store updates and provides reactive
 * state values for ephemeral race progress tracking.
 *
 * Race progress is temporary and resets when starting/restarting races.
 * It does not affect orientation mode discoveries.
 *
 * @returns Object containing reactive state values and action functions
 *
 * @example
 * ```typescript
 * function RaceComponent() {
 *   const race = useRaceStore()
 *
 *   // Track discoveries during race
 *   useEffect(() => {
 *     if (currentArea) {
 *       race.addAreaDiscovery(currentArea.id)
 *     }
 *   }, [currentArea])
 *
 *   // Reset on race start
 *   const handleStartRace = () => {
 *     race.reset()
 *     navigateToStart()
 *   }
 *
 *   // Display race stats
 *   return (
 *     <div>
 *       Areas: {race.areasCount}
 *       Locations: {race.hiddenLocationsCount}
 *     </div>
 *   )
 * }
 * ```
 */
export function useRaceStore(): UseRaceStoreReturn {
  const state = useStore(raceStore)

  return {
    discoveredAreas: state.discoveredAreas,
    foundHiddenLocations: state.foundHiddenLocations,
    areasCount: getRaceAreasCount(),
    hiddenLocationsCount: getRaceHiddenLocationsCount(),
    addAreaDiscovery: addRaceAreaDiscovery,
    addHiddenLocation: addRaceHiddenLocation,
    reset: resetRace,
    hasAreaDiscovery: hasRaceAreaDiscovery,
    hasHiddenLocation: hasRaceHiddenLocation,
    getDiscoveries: getRaceDiscoveries,
    getHiddenLocations: getRaceHiddenLocations
  }
}
