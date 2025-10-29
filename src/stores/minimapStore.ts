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
import { getMinimapCoordinate } from '../data/minimap/minimapUtils'
import type { MinimapCoordinate } from '../data/minimap/minimapUtils'

const MINIMAP_OPEN_STORAGE_KEY = 'minimap:is-open'

function loadMinimapOpenState(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const storedValue = window.sessionStorage.getItem(MINIMAP_OPEN_STORAGE_KEY)
    if (storedValue === null) {
      return false
    }
    return storedValue === 'true'
  } catch (error) {
    console.warn('[MinimapStore] Failed to load minimap open state from sessionStorage.', error)
    return false
  }
}

function persistMinimapOpenState(isOpen: boolean): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(MINIMAP_OPEN_STORAGE_KEY, isOpen ? 'true' : 'false')
  } catch (error) {
    console.warn('[MinimapStore] Failed to persist minimap open state to sessionStorage.', error)
  }
}

/**
 * Minimap UI state interface
 *
 * Tracks whether the minimap is currently open (expanded) or closed (collapsed).
 *
 * @property isOpen - Whether the minimap is currently in the open state
 * @property activePhotoId - Photo ID currently highlighted on the minimap
 * @property activeCoordinate - Coordinate for the active photo, null when unavailable
 * @property pathNodes - Ordered collection of path nodes representing the current navigation route
 */
export interface MinimapState {
  isOpen: boolean
  activePhotoId: string | null
  activeCoordinate: MinimapCoordinate | null
  pathNodes: MinimapPathNode[]
}

/**
 * Represents a single node along the minimap navigation path.
 *
 * Associates the photo identifier with its resolved minimap coordinate. When
 * coordinates are unavailable the value remains null so UI layers can gracefully
 * skip rendering that segment.
 *
 * @property photoId - Tour photo identifier contained in the navigation route
 * @property coordinate - Resolved minimap coordinate or null when not yet mapped
 *
 * @example
 * ```typescript
 * const entry: MinimapPathNode = {
 *   photoId: 'a-f1-north-entrance',
 *   coordinate: { x: 0.52, y: 0.48 }
 * }
 * ```
 */
export interface MinimapPathNode {
  photoId: string
  coordinate: MinimapCoordinate | null
}

/**
 * Minimap store instance
 *
 * Global state for tracking minimap open/closed state.
 * Used for coordinating UI layout, particularly during onboarding.
 */
export const minimapStore = new Store<MinimapState>({
  isOpen: loadMinimapOpenState(),
  activePhotoId: null,
  activeCoordinate: null,
  pathNodes: []
})

/**
 * Set the minimap open/closed state
 *
 * Updates the global minimap state to reflect whether the minimap
 * is currently expanded or collapsed and persists the preference in
 * sessionStorage so it survives page reloads or focus changes.
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
  minimapStore.setState(state => ({
    ...state,
    isOpen
  }))
  persistMinimapOpenState(isOpen)
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

/**
 * Update the active minimap photo and coordinate.
 *
 * @param photoId - Photo identifier to mark as active (null clears the active state)
 * @param coordinate - Coordinate for the active photo, or null if not yet defined
 *
 * @example
 * ```typescript
 * setMinimapActive('a-f1-north-entrance', { x: 0.42, y: 0.18 })
 * setMinimapActive(null, null) // clears the active minimap marker
 * ```
 */
export function setMinimapActive(photoId: string | null, coordinate: MinimapCoordinate | null): void {
  minimapStore.setState(state => ({
    ...state,
    activePhotoId: photoId,
    activeCoordinate: coordinate
  }))
}

/**
 * Replace the minimap navigation path with the provided sequence.
 *
 * Resolves each supplied photo identifier to its minimap coordinate so UI layers
 * can render a polyline highlighting the active navigation route. Unknown coordinate
 * entries are preserved with null values to maintain path order.
 *
 * @param photoIds - Ordered array of photo identifiers describing the navigation path
 *
 * @example
 * ```typescript
 * setMinimapPath(['a-f1-north-entrance', 'a-f1-mid-5', 'library-f1-entrance'])
 * ```
 */
export function setMinimapPath(photoIds: string[]): void {
  const nodes: MinimapPathNode[] = Array.isArray(photoIds)
    ? photoIds.map(photoId => ({
        photoId,
        coordinate: getMinimapCoordinate(photoId)
      }))
    : []

  minimapStore.setState(state => ({
    ...state,
    pathNodes: nodes
  }))
}

/**
 * Clear the active minimap navigation path.
 *
 * Removes any previously stored path nodes so the minimap renders without
 * route highlights.
 *
 * @example
 * ```typescript
 * clearMinimapPath()
 * ```
 */
export function clearMinimapPath(): void {
  minimapStore.setState(state => ({
    ...state,
    pathNodes: []
  }))
}
