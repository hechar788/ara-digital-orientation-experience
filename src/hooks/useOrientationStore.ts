/**
 * React hook for subscribing to orientation store state
 *
 * Provides reactive access to orientation mode exploration state.
 * Components automatically re-render when discoveries change.
 *
 * @fileoverview Custom React hook for orientation store integration
 */

import { useStore } from '@tanstack/react-store'
import {
  orientationStore,
  addOrientationDiscovery,
  getOrientationDiscoveriesCount,
  hasOrientationDiscovery,
  getOrientationDiscoveries
} from '../stores/orientationStore'

/**
 * Return type for the useOrientationStore hook
 *
 * Provides reactive state values and action functions for managing
 * orientation mode exploration progress.
 *
 * @property discoveredAreas - Set of area IDs visited in orientation mode (persistent)
 * @property discoveriesCount - Computed count of orientation discoveries
 * @property addDiscovery - Function to mark an area as discovered
 * @property hasDiscovery - Function to check if area was discovered
 * @property getDiscoveries - Function to get all discovered area IDs
 */
export interface UseOrientationStoreReturn {
  discoveredAreas: Set<string>
  discoveriesCount: number
  addDiscovery: (areaId: string) => void
  hasDiscovery: (areaId: string) => boolean
  getDiscoveries: () => Set<string>
}

/**
 * Custom hook for accessing orientation store state and actions
 *
 * Subscribes component to orientation store updates and provides reactive
 * state values for persistent campus exploration tracking.
 *
 * Orientation discoveries persist across all mode switches and provide
 * a permanent record of genuine campus exploration.
 *
 * @returns Object containing reactive state values and action functions
 *
 * @example
 * ```typescript
 * function OrientationComponent() {
 *   const orientation = useOrientationStore()
 *
 *   // Track area discovery
 *   useEffect(() => {
 *     if (currentArea) {
 *       orientation.addDiscovery(currentArea.id)
 *     }
 *   }, [currentArea])
 *
 *   // Display progress
 *   return <div>Areas discovered: {orientation.discoveriesCount}</div>
 * }
 * ```
 */
export function useOrientationStore(): UseOrientationStoreReturn {
  const state = useStore(orientationStore)

  return {
    discoveredAreas: state.discoveredAreas,
    discoveriesCount: getOrientationDiscoveriesCount(),
    addDiscovery: addOrientationDiscovery,
    hasDiscovery: hasOrientationDiscovery,
    getDiscoveries: getOrientationDiscoveries
  }
}
