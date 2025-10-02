/**
 * Custom hook for managing VR tour navigation state and photo transitions.
 * Handles current photo tracking, directional navigation, and loading states.
 *
 * @fileoverview Provides navigation logic for the VR campus tour system.
 */
import { useState, useCallback, useMemo } from 'react'
import { findPhotoById, getAreaForPhoto } from '../data/tourUtilities'
import type { Photo, DirectionType } from '../types/tour'
import { DIRECTION_ANGLES } from '../types/tour'

/**
 * Calculates the absolute angle for a direction based on photo's startingAngle
 *
 * @param photo - Photo containing the direction and startingAngle
 * @param direction - Direction name to calculate angle for
 * @returns Absolute angle in degrees (0-360)
 */
function getDirectionAngle(photo: Photo, direction: DirectionType): number {
  const startingAngle = photo.startingAngle ?? 0
  const offset = DIRECTION_ANGLES[direction] ?? 0
  return (startingAngle + offset) % 360
}

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
  direction: DirectionType
): NavigationAnalysis {
  // Classify direction as forward-based, back-based, or turning
  const isForwardMovement = direction === 'forward' || direction === 'forwardLeft' || direction === 'forwardRight'
  const isBackMovement = direction === 'back' || direction === 'backLeft' || direction === 'backRight'

  // Handle pure turns (left/right) and vertical navigation
  if (!isForwardMovement && !isBackMovement) {
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

  // Determine primary reverse direction (forward-based ↔ back-based)
  const reverseDirection: DirectionType = isForwardMovement ? 'back' : 'forward'
  const destinationConnection = destinationPhoto.directions[reverseDirection]?.connection

  // Not bidirectional connections
  if (currentConnection !== destinationPhoto.id || destinationConnection !== currentPhoto.id) {
    return { navigationType: 'same-building-corner', preserveOrientation: false }
  }

  // Check corridor geometry by comparing the actual connection angles being used
  const currentDirectionAngle = getDirectionAngle(currentPhoto, direction)
  const destinationReverseAngle = getDirectionAngle(destinationPhoto, reverseDirection)

  if (currentDirectionAngle !== undefined && destinationReverseAngle !== undefined) {
    // Helper function to calculate angular difference with wraparound
    const angleDiff = (a1: number, a2: number) => {
      let diff = Math.abs(a1 - a2)
      if (diff > 180) diff = 360 - diff
      return diff
    }

    // Check if connection angles are opposite (180° apart within 15° tolerance)
    if (Math.abs(angleDiff(currentDirectionAngle, destinationReverseAngle) - 180) > 15) {
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
  direction: DirectionType,
  navigationType: NavigationType
): number {
  // Classify movement type
  const isForwardMovement = direction === 'forward' || direction === 'forwardLeft' || direction === 'forwardRight'
  const isBackMovement = direction === 'back' || direction === 'backLeft' || direction === 'backRight'

  switch (navigationType) {
    case 'same-corridor':
      // For bidirectional corridors, preserve directional intent
      if (isForwardMovement) {
        // Forward-based movement: maintain forward-relative orientation
        return calculatePreservedOrientation(currentCameraAngle, currentPhoto, destinationPhoto)
      } else if (isBackMovement) {
        // Back-based movement: face the back direction to maintain backwards orientation
        return destinationPhoto.directions.back ? getDirectionAngle(destinationPhoto, 'back') : calculatePreservedOrientation(currentCameraAngle, currentPhoto, destinationPhoto)
      } else {
        // Other directions: use preserved orientation
        return calculatePreservedOrientation(currentCameraAngle, currentPhoto, destinationPhoto)
      }

    case 'cross-building':
      // Use directional intent: forward movement faces forward, backward movement faces backward
      if (isForwardMovement) {
        return destinationPhoto.directions.forward ? getDirectionAngle(destinationPhoto, 'forward') : destinationPhoto.startingAngle ?? 0
      } else if (isBackMovement) {
        // If destination has back direction, face it. Otherwise face opposite of startingAngle (backward).
        return destinationPhoto.directions.back ? getDirectionAngle(destinationPhoto, 'back') : ((destinationPhoto.startingAngle ?? 0) + 180) % 360
      }
      break

    case 'same-building-corner':
    case 'turn':
    default:
      // For corner navigation, preserve directional intent based on primary direction
      if (isForwardMovement) {
        // Forward-based movement: face the forward direction or use startingAngle
        return destinationPhoto.directions.forward ? getDirectionAngle(destinationPhoto, 'forward') : destinationPhoto.startingAngle ?? 0
      } else if (isBackMovement) {
        // Back-based movement: face the back direction if it exists, otherwise face opposite of startingAngle
        return destinationPhoto.directions.back ? getDirectionAngle(destinationPhoto, 'back') : ((destinationPhoto.startingAngle ?? 0) + 180) % 360
      } else {
        // Pure turns (left/right): use startingAngle
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
  const currentForward = currentPhoto.directions.forward ? getDirectionAngle(currentPhoto, 'forward') : undefined
  const destForward = destinationPhoto.directions.forward ? getDirectionAngle(destinationPhoto, 'forward') : undefined

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
  // const [currentPhotoId, setCurrentPhotoId] = useState<string>('a-f1-north-entrance')
  const [currentPhotoId, setCurrentPhotoId] = useState<string>('outside-n-north-entrance')
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
   * @param direction - Direction to navigate (forward, back, left, right, up, down, elevator, door, floor1-4)
   */
  const navigateDirection = useCallback((direction: DirectionType) => {
    if (!currentPhoto || isLoading) return

    let targetPhotoId: string | string[] | undefined

    // Handle new directions interface for horizontal movement (8 directions)
    if (direction === 'forward' || direction === 'forwardRight' || direction === 'right' || direction === 'backRight' ||
        direction === 'back' || direction === 'backLeft' || direction === 'left' || direction === 'forwardLeft') {
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
    handleCameraChange
  }
}