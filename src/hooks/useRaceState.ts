/**
 * Race state management hook for The Amazing Race game mode
 *
 * Manages tracking of found hidden locations and discovered areas during
 * race mode. Provides state and actions for adding discoveries and resetting
 * the race.
 *
 * @fileoverview Custom hook for managing race progress state
 */

import { useState, useCallback } from 'react'

/**
 * Race state interface
 *
 * Tracks player progress during The Amazing Race including found hidden
 * locations and discovered areas.
 *
 * @property foundHiddenLocations - Set of found hidden location IDs
 * @property discoveredAreas - Set of discovered area IDs
 * @property addHiddenLocation - Function to mark a hidden location as found
 * @property addArea - Function to mark an area as discovered
 * @property reset - Function to reset all race progress
 */
export interface RaceState {
  foundHiddenLocations: Set<string>
  discoveredAreas: Set<string>
  addHiddenLocation: (id: string) => void
  addArea: (areaId: string) => void
  reset: () => void
}

/**
 * Custom hook for managing race state
 *
 * Provides state management for The Amazing Race game mode, tracking
 * which hidden locations have been found and which areas have been
 * discovered during exploration.
 *
 * State is ephemeral and resets when the race is restarted or when
 * the component unmounts.
 *
 * @returns RaceState object with current state and action functions
 *
 * @example
 * ```typescript
 * const raceState = useRaceState()
 *
 * // Mark a hidden location as found
 * raceState.addHiddenLocation('dean-office')
 *
 * // Mark an area as discovered
 * raceState.addArea('a-block-floor-1-main')
 *
 * // Get current counts
 * const hiddenCount = raceState.foundHiddenLocations.size
 * const areaCount = raceState.discoveredAreas.size
 *
 * // Reset race
 * raceState.reset()
 * ```
 */
export function useRaceState(): RaceState {
  const [foundHiddenLocations, setFoundHiddenLocations] = useState<Set<string>>(new Set())
  const [discoveredAreas, setDiscoveredAreas] = useState<Set<string>>(new Set())

  /**
   * Add a hidden location to the found set
   *
   * Marks a hidden location as discovered. Once found, the location
   * will not be rendered again in the panoramic view.
   *
   * @param id - Unique identifier of the hidden location
   */
  const addHiddenLocation = useCallback((id: string) => {
    setFoundHiddenLocations(prev => {
      const newSet = new Set(prev)
      newSet.add(id)
      return newSet
    })
  }, [])

  /**
   * Add an area to the discovered set
   *
   * Marks an area as visited during race navigation. Used to track
   * exploration progress.
   *
   * @param areaId - Unique identifier of the area
   */
  const addArea = useCallback((areaId: string) => {
    setDiscoveredAreas(prev => {
      const newSet = new Set(prev)
      newSet.add(areaId)
      return newSet
    })
  }, [])

  /**
   * Reset all race progress
   *
   * Clears all found hidden locations and discovered areas,
   * returning the race state to initial conditions.
   */
  const reset = useCallback(() => {
    setFoundHiddenLocations(new Set())
    setDiscoveredAreas(new Set())
  }, [])

  return {
    foundHiddenLocations,
    discoveredAreas,
    addHiddenLocation,
    addArea,
    reset
  }
}
