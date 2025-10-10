/**
 * Race mode progress state store
 *
 * Manages ephemeral tracking during The Amazing Race game mode.
 * All state in this store is temporary and resets when starting/restarting races.
 *
 * This store is completely independent from orientation mode tracking.
 *
 * @fileoverview TanStack Store for race mode progress tracking
 */

import { Store } from '@tanstack/store'

/**
 * Race progress state interface
 *
 * Tracks ephemeral progress during The Amazing Race game mode.
 * All data resets when starting/restarting a race.
 *
 * @property discoveredAreas - Set of area IDs visited during current race session
 * @property foundHiddenLocations - Set of hidden location IDs found during current race session
 */
export interface RaceState {
  discoveredAreas: Set<string>
  foundHiddenLocations: Set<string>
}

/**
 * Race store instance
 *
 * Global state for tracking progress during Amazing Race mode.
 * State is ephemeral and resets on race start/restart.
 */
export const raceStore = new Store<RaceState>({
  discoveredAreas: new Set<string>(),
  foundHiddenLocations: new Set<string>()
})

/**
 * Add a discovered area to race progress
 *
 * Records that the user has visited a specific area during the current
 * Amazing Race session. This discovery is ephemeral and will be cleared
 * when the race restarts.
 *
 * @param areaId - Unique identifier of the area being discovered
 *
 * @example
 * ```typescript
 * addRaceAreaDiscovery('a-block-floor-1-main')
 * addRaceAreaDiscovery('library-entrance')
 * ```
 */
export function addRaceAreaDiscovery(areaId: string): void {
  const currentState = raceStore.state
  const newDiscoveredAreas = new Set(currentState.discoveredAreas)
  newDiscoveredAreas.add(areaId)

  raceStore.setState((state) => ({
    ...state,
    discoveredAreas: newDiscoveredAreas
  }))
}

/**
 * Add a found hidden location to race progress
 *
 * Records that the user has discovered a hidden location during the current
 * Amazing Race session. This discovery is ephemeral and will be cleared when
 * the race restarts.
 *
 * @param locationId - Unique identifier of the hidden location being found
 *
 * @example
 * ```typescript
 * addRaceHiddenLocation('dean-office')
 * addRaceHiddenLocation('secret-lab')
 * ```
 */
export function addRaceHiddenLocation(locationId: string): void {
  const currentState = raceStore.state
  const newFoundLocations = new Set(currentState.foundHiddenLocations)
  newFoundLocations.add(locationId)

  raceStore.setState((state) => ({
    ...state,
    foundHiddenLocations: newFoundLocations
  }))
}

/**
 * Reset all race progress to initial state
 *
 * Clears all race-specific discoveries including both discovered areas
 * and found hidden locations. Called when starting or restarting a race.
 *
 * Does not affect orientation mode discoveries.
 *
 * @example
 * ```typescript
 * // User clicks "Start Race" or "Restart Race"
 * resetRace()
 * ```
 */
export function resetRace(): void {
  raceStore.setState(() => ({
    discoveredAreas: new Set<string>(),
    foundHiddenLocations: new Set<string>()
  }))
}

/**
 * Get the count of areas discovered in current race
 *
 * Returns the number of unique areas visited during the current Amazing Race
 * session. This count resets when starting a new race.
 *
 * @returns Number of race area discoveries
 *
 * @example
 * ```typescript
 * const count = getRaceAreasCount()
 * console.log(`Race areas discovered: ${count}`)
 * ```
 */
export function getRaceAreasCount(): number {
  return raceStore.state.discoveredAreas.size
}

/**
 * Get the count of hidden locations found in current race
 *
 * Returns the number of hidden locations discovered during the current
 * Amazing Race session. This count resets when starting a new race.
 *
 * @returns Number of found hidden locations
 *
 * @example
 * ```typescript
 * const count = getRaceHiddenLocationsCount()
 * console.log(`Hidden locations found: ${count}`)
 * ```
 */
export function getRaceHiddenLocationsCount(): number {
  return raceStore.state.foundHiddenLocations.size
}

/**
 * Check if an area has been discovered in current race
 *
 * Determines whether the user has visited a given area during the current
 * Amazing Race session.
 *
 * @param areaId - Unique identifier of the area to check
 * @returns True if area was discovered in current race, false otherwise
 *
 * @example
 * ```typescript
 * if (hasRaceAreaDiscovery('library-entrance')) {
 *   console.log('You have explored this area in the current race')
 * }
 * ```
 */
export function hasRaceAreaDiscovery(areaId: string): boolean {
  return raceStore.state.discoveredAreas.has(areaId)
}

/**
 * Check if a hidden location has been found in current race
 *
 * Determines whether the user has discovered a given hidden location
 * during the current Amazing Race session.
 *
 * @param locationId - Unique identifier of the hidden location to check
 * @returns True if location has been found, false otherwise
 *
 * @example
 * ```typescript
 * if (hasRaceHiddenLocation('dean-office')) {
 *   console.log('You have already found this location')
 * }
 * ```
 */
export function hasRaceHiddenLocation(locationId: string): boolean {
  return raceStore.state.foundHiddenLocations.has(locationId)
}

/**
 * Get all discovered area IDs in current race
 *
 * Returns the complete set of area IDs discovered during the current race.
 * Useful for analytics or detailed progress displays.
 *
 * @returns Set of discovered area IDs
 *
 * @example
 * ```typescript
 * const areas = getRaceDiscoveries()
 * console.log('Visited race areas:', Array.from(areas))
 * ```
 */
export function getRaceDiscoveries(): Set<string> {
  return new Set(raceStore.state.discoveredAreas)
}

/**
 * Get all found hidden location IDs in current race
 *
 * Returns the complete set of hidden location IDs found during the current race.
 * Useful for detailed scoring or achievement systems.
 *
 * @returns Set of found hidden location IDs
 *
 * @example
 * ```typescript
 * const locations = getRaceHiddenLocations()
 * console.log('Found locations:', Array.from(locations))
 * ```
 */
export function getRaceHiddenLocations(): Set<string> {
  return new Set(raceStore.state.foundHiddenLocations)
}
