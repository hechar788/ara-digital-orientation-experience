/**
 * React hook for subscribing to minimap store state
 *
 * Provides reactive access to minimap UI state.
 * Components automatically re-render when minimap open/closed state changes.
 *
 * @fileoverview Custom React hook for minimap store integration
 */

import { useStore } from '@tanstack/react-store'
import {
  minimapStore,
  setMinimapOpen,
  getMinimapOpen,
  setMinimapActive,
  setMinimapPath,
  clearMinimapPath,
  type MinimapPathNode
} from '../stores/minimapStore'
import type { MinimapCoordinate } from '../data/minimap/minimapUtils'

/**
 * Return type for the useMinimapStore hook
 *
 * Provides reactive state values and action functions for managing
 * minimap open/closed state.
 *
 * @property isOpen - Whether the minimap is currently open (expanded)
 * @property setOpen - Function to update minimap open/closed state
 * @property getOpen - Function to get current open state
 * @property activePhotoId - Photo ID currently highlighted on the minimap
 * @property activeCoordinate - Coordinate of the active photo, null when unavailable
 * @property setActive - Function to update the active minimap photo and coordinate
 * @property pathNodes - Ordered nodes representing the current navigation route
 * @property setPath - Function to replace the active minimap navigation path
 * @property clearPath - Function to clear the active minimap navigation path
 */
export interface UseMinimapStoreReturn {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  getOpen: () => boolean
  activePhotoId: string | null
  activeCoordinate: MinimapCoordinate | null
  setActive: (photoId: string | null, coordinate: MinimapCoordinate | null) => void
  pathNodes: MinimapPathNode[]
  setPath: (photoIds: string[]) => void
  clearPath: () => void
}

/**
 * Custom hook for accessing minimap store state and actions
 *
 * Subscribes component to minimap store updates and provides reactive
 * state values for tracking minimap UI state.
 *
 * This is particularly useful for components that need to adjust their
 * layout or positioning based on whether the minimap is open or closed.
 *
 * @returns Object containing reactive state values and action functions
 *
 * @example
 * ```typescript
 * function OnboardingComponent() {
 *   const minimap = useMinimapStore()
 *
 *   // Check minimap state
 *   const layout = minimap.isOpen ? 'zoom-right' : 'zoom-right-minimap-closed'
 *
 *   // Update minimap state
 *   const handleToggle = () => {
 *     minimap.setOpen(!minimap.isOpen)
 *   }
 *
 *   return <div>{minimap.isOpen ? 'Open' : 'Closed'}</div>
 * }
 * ```
 */
export function useMinimapStore(): UseMinimapStoreReturn {
  const state = useStore(minimapStore)

  return {
    isOpen: state.isOpen,
    setOpen: setMinimapOpen,
    getOpen: getMinimapOpen,
    activePhotoId: state.activePhotoId,
    activeCoordinate: state.activeCoordinate,
    setActive: setMinimapActive,
    pathNodes: state.pathNodes,
    setPath: setMinimapPath,
    clearPath: clearMinimapPath
  }
}
