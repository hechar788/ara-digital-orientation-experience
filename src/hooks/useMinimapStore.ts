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
  getMinimapOpen
} from '../stores/minimapStore'

/**
 * Return type for the useMinimapStore hook
 *
 * Provides reactive state values and action functions for managing
 * minimap open/closed state.
 *
 * @property isOpen - Whether the minimap is currently open (expanded)
 * @property setOpen - Function to update minimap open/closed state
 * @property getOpen - Function to get current open state
 */
export interface UseMinimapStoreReturn {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  getOpen: () => boolean
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
    getOpen: getMinimapOpen
  }
}
