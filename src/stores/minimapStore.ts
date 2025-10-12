/**
 * Minimap UI state store
 *
 * Manages the open/closed state of the minimap component globally.
 * This allows other components (like OnboardingFlow) to react to
 * minimap state changes for proper UI positioning.
 *
 * @fileoverview TanStack Store for minimap UI state
 */

import { Store } from '@tanstack/store'

/**
 * Minimap UI state interface
 *
 * Tracks whether the minimap is currently open (expanded) or closed (collapsed).
 *
 * @property isOpen - Whether the minimap is currently in the open state
 */
export interface MinimapState {
  isOpen: boolean
}

/**
 * Minimap store instance
 *
 * Global state for tracking minimap open/closed state.
 * Used for coordinating UI layout, particularly during onboarding.
 */
export const minimapStore = new Store<MinimapState>({
  isOpen: false
})

/**
 * Set the minimap open/closed state
 *
 * Updates the global minimap state to reflect whether the minimap
 * is currently expanded or collapsed.
 *
 * @param isOpen - True to mark minimap as open, false for closed
 *
 * @example
 * ```typescript
 * setMinimapOpen(true)  // Minimap is now open
 * setMinimapOpen(false) // Minimap is now closed
 * ```
 */
export function setMinimapOpen(isOpen: boolean): void {
  minimapStore.setState(() => ({
    isOpen
  }))
}

/**
 * Get the current minimap open state
 *
 * Returns the current open/closed state of the minimap.
 *
 * @returns True if minimap is open, false if closed
 *
 * @example
 * ```typescript
 * if (getMinimapOpen()) {
 *   console.log('Minimap is currently open')
 * }
 * ```
 */
export function getMinimapOpen(): boolean {
  return minimapStore.state.isOpen
}
