/**
 * Custom hook for managing VR tour navigation state and photo transitions.
 * Handles current photo tracking, directional navigation, and loading states.
 *
 * @fileoverview Provides navigation logic for the VR campus tour system.
 */
import { useState, useCallback, useMemo } from 'react'
import { findPhotoById, getAreaForPhoto } from '../data/tourUtilities'
import type { Photo, Area } from '../types/tour'

/**
 * Navigation type classification for orientation handling
 */
type NavigationType = 'same-corridor' | 'same-building-corner' | 'cross-building' | 'turn'

/**
 * Navigation analysis result
 */
interface NavigationAnalysis {
  navigationType: NavigationType
  preserveOrientation: boolean
}

/**
 * Analyzes navigation context to determine orientation handling approach
 *
 * Uses bidirectional connection analysis and corridor geometry to classify
 * navigation types for appropriate orientation handling.
 *
 * @param currentPhoto - Source photo being navigated from
 * @param destinationPhoto - Target photo being navigated to
 * @param direction - Navigation direction being used
 * @returns Navigation analysis with type classification
 */
function analyzeNavigation(
  currentPhoto: Photo,
  destinationPhoto: Photo,
  direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down' | 'elevator' | 'floor1' | 'floor2' | 'floor3' | 'floor4'
): NavigationAnalysis {
  // Handle turns and vertical navigation
  if (direction !== 'forward' && direction !== 'back') {
    return { navigationType: 'turn', preserveOrientation: false }
  }

  // Extract building prefixes from photo IDs (e.g., 'a-f1' from 'a-f1-north-1')
  const currentBuilding = currentPhoto.id.split('-').slice(0, 2).join('-')
  const destinationBuilding = destinationPhoto.id.split('-').slice(0, 2).join('-')

  // Cross-building navigation
  if (currentBuilding !== destinationBuilding) {
    return { navigationType: 'cross-building', preserveOrientation: false }
  }

  // Check for bidirectional forward/back connections
  const currentConnection = currentPhoto.directions[direction]?.connection
  const reverseDirection = direction === 'forward' ? 'back' : 'forward'
  const destinationConnection = destinationPhoto.directions[reverseDirection]?.connection

  // Not bidirectional connections
  if (currentConnection !== destinationPhoto.id || destinationConnection !== currentPhoto.id) {
    return { navigationType: 'same-building-corner', preserveOrientation: false }
  }

  // Check corridor geometry by comparing the actual connection angles being used
  const currentDirectionAngle = currentPhoto.directions[direction]?.angle
  const destinationReverseAngle = destinationPhoto.directions[reverseDirection]?.angle

  if (currentDirectionAngle !== undefined && destinationReverseAngle !== undefined) {
    // Helper function to calculate angular difference with wraparound
    const angleDiff = (a1: number, a2: number) => {
      let diff = Math.abs(a1 - a2)
      if (diff > 180) diff = 360 - diff
      return diff
    }

    // For true bidirectional corridors, the angles should be opposite (180° apart)
    const connectionAngleDiff = angleDiff(currentDirectionAngle, destinationReverseAngle)


    // If connection angles are not opposite (within 15° tolerance), it's a corner/geometry change
    if (Math.abs(connectionAngleDiff - 180) > 15) {
      return { navigationType: 'same-building-corner', preserveOrientation: false }
    }
  }

  // Same corridor with consistent geometry
  return { navigationType: 'same-corridor', preserveOrientation: true }
}

/**
 * Calculates camera orientation based on navigation context and directional intent
 *
 * Provides unified orientation calculation for all navigation types, ensuring
 * consistent directional intent preservation across different scenarios.
 *
 * @param currentCameraAngle - User's current camera angle in degrees
 * @param currentPhoto - Source photo with corridor direction info
 * @param destinationPhoto - Target photo with corridor direction info
 * @param direction - Navigation direction being used
 * @param navigationType - Type of navigation being performed
 * @returns New camera angle that respects directional intent
 */
function calculateNavigationAngle(
  currentCameraAngle: number,
  currentPhoto: Photo,
  destinationPhoto: Photo,
  direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down' | 'elevator' | 'floor1' | 'floor2' | 'floor3' | 'floor4',
  navigationType: NavigationType
): number {
  switch (navigationType) {
    case 'same-corridor':
      // For bidirectional corridors, preserve directional intent
      if (direction === 'forward') {
        // Forward movement: maintain forward-relative orientation
        return calculatePreservedOrientation(currentCameraAngle, currentPhoto, destinationPhoto)
      } else if (direction === 'back') {
        // Backward movement: face the back direction to maintain backwards orientation
        return destinationPhoto.directions.back?.angle ?? calculatePreservedOrientation(currentCameraAngle, currentPhoto, destinationPhoto)
      } else {
        // Other directions: use preserved orientation
        return calculatePreservedOrientation(currentCameraAngle, currentPhoto, destinationPhoto)
      }

    case 'cross-building':
      // Use directional intent: forward movement faces forward, backward movement faces backward
      if (direction === 'forward') {
        return destinationPhoto.directions.forward?.angle ?? destinationPhoto.startingAngle ?? 0
      } else if (direction === 'back') {
        return destinationPhoto.directions.back?.angle ?? destinationPhoto.startingAngle ?? 0
      }
      break

    case 'same-building-corner':
    case 'turn':
    default:
      // For corner navigation, preserve directional intent when possible
      if (direction === 'forward') {
        // Forward movement: face the forward direction or use startingAngle
        return destinationPhoto.directions.forward?.angle ?? destinationPhoto.startingAngle ?? 0
      } else if (direction === 'back') {
        // Backward movement: face the back direction or use startingAngle
        return destinationPhoto.directions.back?.angle ?? destinationPhoto.startingAngle ?? 0
      } else {
        // Other directions: use startingAngle
        return destinationPhoto.startingAngle ?? 0
      }
  }

  // Fallback
  return destinationPhoto.startingAngle ?? 0
}

/**
 * Calculates preserved camera orientation for same-corridor navigation
 *
 * Maintains the user's relative orientation to the corridor direction when
 * moving between photos with bidirectional connections.
 *
 * @param currentCameraAngle - User's current camera angle in degrees
 * @param currentPhoto - Source photo with corridor direction info
 * @param destinationPhoto - Target photo with corridor direction info
 * @returns New camera angle that preserves relative orientation
 */
function calculatePreservedOrientation(
  currentCameraAngle: number,
  currentPhoto: Photo,
  destinationPhoto: Photo
): number {
  const currentForward = currentPhoto.directions.forward?.angle
  const destForward = destinationPhoto.directions.forward?.angle

  // Fallback to simple preservation if direction data is missing
  if (currentForward === undefined || destForward === undefined) {
    return currentCameraAngle
  }

  // Calculate user's relative orientation to current corridor
  let relativeAngle = currentCameraAngle - currentForward

  // Normalize angle to -180 to 180 range
  while (relativeAngle > 180) relativeAngle -= 360
  while (relativeAngle < -180) relativeAngle += 360

  // Apply same relative orientation to destination corridor
  let newAngle = destForward + relativeAngle

  // Normalize result to 0-360 range
  while (newAngle < 0) newAngle += 360
  while (newAngle >= 360) newAngle -= 360


  return newAngle
}

/**
 * Hook for managing VR tour navigation state
 *
 * Provides state management for current photo, navigation between photos,
 * loading states, and area context. Handles all navigation logic including
 * directional movement and direct photo jumping.
 *
 * @returns Navigation state and control functions
 *
 * @example
 * ```typescript
 * const { currentPhoto, navigateDirection, isLoading } = useTourNavigation()
 *
 * // Navigate forward
 * navigateDirection('forward')
 *
 * // Jump to specific location
 * jumpToPhoto('x-f2-mid-7')
 * ```
 */
export function useTourNavigation() {
  const [currentPhotoId, setCurrentPhotoId] = useState<string>('a-f1-north-entrance')
  const [isLoading, setIsLoading] = useState(false)
  const [cameraLon, setCameraLon] = useState(180)
  const [cameraLat, setCameraLat] = useState(0)
  const [calculatedCameraAngle, setCalculatedCameraAngle] = useState<number | undefined>(undefined)

  // Get current photo using centralized lookup
  const currentPhoto = useMemo(() => {
    return findPhotoById(currentPhotoId)
  }, [currentPhotoId])

  // Get current area context
  const currentArea = useMemo(() => {
    return getAreaForPhoto(currentPhotoId)
  }, [currentPhotoId])

  /**
   * Handle camera orientation changes from the panoramic viewer
   *
   * Stores the current camera orientation for persistence during navigation.
   * Called whenever the user drags to look around in the 360° view.
   *
   * @param lon - Camera longitude (horizontal rotation)
   * @param lat - Camera latitude (vertical rotation)
   */
  const handleCameraChange = useCallback((lon: number, lat: number) => {
    setCameraLon(lon)
    setCameraLat(lat)
  }, [])

  /**
   * Navigate in a specific direction based on current photo connections
   *
   * Checks if the requested direction is available from the current photo
   * and navigates to the target photo with loading state management.
   *
   * @param direction - Direction to navigate (forward, back, left, right, up, down, elevator, floor1-4)
   */
  const navigateDirection = useCallback((direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down' | 'elevator' | 'floor1' | 'floor2' | 'floor3' | 'floor4') => {
    if (!currentPhoto || isLoading) return

    let targetPhotoId: string | string[] | undefined

    // Handle new directions interface for horizontal movement
    if (direction === 'forward' || direction === 'back' || direction === 'left' || direction === 'right') {
      const directionDef = currentPhoto.directions[direction]
      targetPhotoId = directionDef?.connection
    } else {
      // Handle vertical movement (up/down), elevator, and floor selection
      targetPhotoId = currentPhoto.directions[direction]
    }

    if (targetPhotoId) {
      setIsLoading(true)


      // Handle array of connections if needed
      const finalTargetId = Array.isArray(targetPhotoId) ? targetPhotoId[0] : targetPhotoId

      // Preload image before navigation
      const targetPhoto = findPhotoById(finalTargetId)
      if (targetPhoto) {
        // Calculate camera orientation for navigation using comprehensive analysis
        const navigationAnalysis = analyzeNavigation(currentPhoto, targetPhoto, direction)
        const calculatedAngle = calculateNavigationAngle(
          cameraLon,
          currentPhoto,
          targetPhoto,
          direction,
          navigationAnalysis.navigationType
        )

        const img = new Image()
        img.onload = () => {
          setCurrentPhotoId(finalTargetId)
          setCalculatedCameraAngle(calculatedAngle)
          setIsLoading(false)
        }
        img.onerror = () => {
          setIsLoading(false)
          console.error('Failed to load image:', targetPhoto.imageUrl)
        }
        img.src = targetPhoto.imageUrl
      } else {
        setIsLoading(false)
        console.error('Target photo not found:', finalTargetId)
      }
    }
  }, [currentPhoto, isLoading, cameraLon])

  /**
   * Jump directly to a specific photo by ID
   *
   * Navigates directly to any photo in the tour system without
   * following connection paths. Useful for location menu and search.
   *
   * @param photoId - Target photo ID to navigate to
   */
  const jumpToPhoto = useCallback((photoId: string) => {
    if (isLoading || photoId === currentPhotoId) return

    const targetPhoto = findPhotoById(photoId)
    if (targetPhoto) {
      setIsLoading(true)

      const img = new Image()
      img.onload = () => {
        setCurrentPhotoId(photoId)
        // For direct jumps, always use startingAngle if available
        setCalculatedCameraAngle(targetPhoto.startingAngle)
        setIsLoading(false)
      }
      img.onerror = () => {
        setIsLoading(false)
        console.error('Failed to load image:', targetPhoto.imageUrl)
      }
      img.src = targetPhoto.imageUrl
    } else {
      console.error('Photo not found:', photoId)
    }
  }, [currentPhotoId, isLoading])

  /**
   * Get available navigation directions from current photo
   *
   * Returns an object indicating which directions are available
   * for navigation from the current location.
   *
   * @returns Object with boolean flags for each direction
   */
  const getAvailableDirections = useCallback(() => {
    if (!currentPhoto) return {}

    const { directions } = currentPhoto
    return {
      forward: !!directions.forward,
      back: !!directions.back,
      left: !!directions.left,
      right: !!directions.right,
      up: !!directions.up,
      down: !!directions.down,
      elevator: !!directions.elevator
    }
  }, [currentPhoto])

  return {
    // State
    currentPhotoId,
    currentPhoto,
    currentArea,
    isLoading,
    cameraLon,
    cameraLat,
    calculatedCameraAngle,

    // Navigation functions
    navigateDirection,
    jumpToPhoto,
    getAvailableDirections,
    handleCameraChange
  }
}