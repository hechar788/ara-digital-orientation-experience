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
 * Finds which direction on the destination photo connects back to the origin photo
 *
 * This is crucial for corner navigation - by finding the reverse connection,
 * we know where the user came from and can calculate where they should face.
 *
 * @param fromPhoto - Origin photo being navigated from
 * @param toPhoto - Destination photo being navigated to
 * @returns Direction name on destination that connects back to origin, or null if not found
 *
 * @example
 * ```typescript
 * // User going from a-f1-south-6 to x-f1-east-1
 * // x-f1-east-1.directions.back.connection = 'a-f1-south-6'
 * const reverseDir = findReverseConnection(fromPhoto, toPhoto)
 * // Returns: 'back'
 * ```
 */
function findReverseConnection(fromPhoto: Photo, toPhoto: Photo): DirectionType | null {
  const horizontalDirections: DirectionType[] = [
    'forward', 'forwardRight', 'right', 'backRight',
    'back', 'backLeft', 'left', 'forwardLeft'
  ]

  for (const dir of horizontalDirections) {
    const dirDef = toPhoto.directions[dir]
    if (dirDef && dirDef.connection === fromPhoto.id) {
      return dir
    }
  }

  return null
}

/**
 * Calculates the angular difference between two angles with proper wraparound
 *
 * Always returns the smallest angle difference (0-180 degrees).
 *
 * @param angle1 - First angle in degrees (0-360)
 * @param angle2 - Second angle in degrees (0-360)
 * @returns Angular difference in degrees (0-180)
 *
 * @example
 * ```typescript
 * calculateAngularDifference(350, 10) // Returns: 20 (not 340)
 * calculateAngularDifference(90, 270) // Returns: 180
 * ```
 */
function calculateAngularDifference(angle1: number, angle2: number): number {
  let diff = Math.abs(angle1 - angle2)
  if (diff > 180) {
    diff = 360 - diff
  }
  return diff
}

/**
 * Gets available horizontal directions from a photo filtered by movement type compatibility
 *
 * Forward movement looks for forward-family directions, backward for back-family.
 * This ensures we only consider directions that match the user's movement intent.
 *
 * @param photo - Photo to get directions from
 * @param movementType - Type of movement ('forward' or 'backward')
 * @returns Array of compatible direction names available on the photo
 *
 * @example
 * ```typescript
 * // Photo has: forward, left, right
 * getAvailableDirections(photo, 'forward')  // Returns: ['forward']
 * getAvailableDirections(photo, 'backward') // Returns: ['left', 'right']
 * ```
 */
function getAvailableDirections(
  photo: Photo,
  movementType: 'forward' | 'backward'
): DirectionType[] {
  const forwardFamily: DirectionType[] = ['forward', 'forwardLeft', 'forwardRight']
  const backwardFamily: DirectionType[] = ['back', 'backLeft', 'backRight']
  const neutralDirections: DirectionType[] = ['left', 'right']

  const available: DirectionType[] = []

  if (movementType === 'forward') {
    // Priority: forward-family directions, then neutral
    for (const dir of [...forwardFamily, ...neutralDirections]) {
      if (photo.directions[dir]) {
        available.push(dir)
      }
    }
  } else {
    // Priority: backward-family directions, then neutral
    for (const dir of [...backwardFamily, ...neutralDirections]) {
      if (photo.directions[dir]) {
        available.push(dir)
      }
    }
  }

  return available
}

/**
 * Finds the closest available direction to a target angle
 *
 * Searches through available directions filtered by movement type and returns
 * the one with the smallest angular difference from the target.
 *
 * @param photo - Photo containing available directions
 * @param targetAngle - Desired angle in degrees (0-360)
 * @param movementType - Type of movement to filter compatible directions
 * @returns Closest direction name, or null if no compatible directions available
 *
 * @example
 * ```typescript
 * // Photo has: right (90°), back (180°)
 * // Looking for 0° with forward movement
 * findClosestAvailableDirection(photo, 0, 'forward')
 * // Returns: 'right' (90° is closer to 0° than 180°)
 * ```
 */
function findClosestAvailableDirection(
  photo: Photo,
  targetAngle: number,
  movementType: 'forward' | 'backward'
): DirectionType | null {
  const availableDirs = getAvailableDirections(photo, movementType)
  console.log(`    [findClosest] Target: ${targetAngle}°, Type: ${movementType}, Available: [${availableDirs.join(', ')}]`)

  if (availableDirs.length === 0) {
    console.log(`    [findClosest] No available directions!`)
    return null
  }

  let closestDir: DirectionType | null = null
  let minDiff = Infinity

  for (const dir of availableDirs) {
    const dirAngle = getDirectionAngle(photo, dir)
    const diff = calculateAngularDifference(dirAngle, targetAngle)
    console.log(`      ${dir}: ${dirAngle}° (diff: ${diff}°)`)

    if (diff < minDiff) {
      minDiff = diff
      closestDir = dir
    }
  }

  console.log(`    [findClosest] Result: ${closestDir} at ${closestDir ? getDirectionAngle(photo, closestDir) : 'N/A'}°`)
  return closestDir
}

/**
 * Determines user's current orientation (forward or backward) based on camera angle and arrival context
 *
 * Uses a multi-strategy approach to handle all navigation scenarios correctly:
 * 1. **Direction matching**: If camera matches a specific direction, classify by direction family
 * 2. **Reverse connection analysis**: For perpendicular turns (left/right), check how the direction
 *    was used in the previous navigation by examining the reverse connection
 * 3. **Hemisphere fallback**: Calculate orientation based on angular difference from forward
 *
 * Critical for maintaining orientation continuity during corner navigation and pure turns.
 *
 * @param currentCameraAngle - User's current camera angle in degrees
 * @param photo - Current photo providing direction and connection context
 * @returns User's orientation relative to photo's forward direction
 *
 * @example
 * ```typescript
 * // Forward-family direction: immediately forward oriented
 * getUserOrientation(260, x-f2-east-13) // Camera at 'forward' → 'forward'
 *
 * // Back-family direction: immediately backward oriented
 * getUserOrientation(80, x-f2-east-13) // Camera at 'back' → 'backward'
 *
 * // Perpendicular (left/right): check reverse connection for arrival context
 * // x-f2-east-13.right → a-f2-south-5, a-f2-south-5.forward → x-f2-east-13
 * getUserOrientation(350, x-f2-east-13) // Camera at 'right', reverse 'forward' → 'backward'
 * ```
 */
function getUserOrientation(currentCameraAngle: number, photo: Photo): 'forward' | 'backward' {
  // First, check if camera matches a specific direction
  const horizontalDirections: DirectionType[] = [
    'forward', 'forwardLeft', 'forwardRight',
    'back', 'backLeft', 'backRight',
    'left', 'right'
  ]

  for (const dir of horizontalDirections) {
    const dirDef = photo.directions[dir]
    if (dirDef) {
      const dirAngle = getDirectionAngle(photo, dir)
      const angleDiff = Math.abs(currentCameraAngle - dirAngle)
      // 15° tolerance accounts for VR navigation imprecision
      if (angleDiff < 15 || angleDiff > 345) {
        // Camera matches this direction - determine orientation based on direction type

        // Forward-family directions = forward oriented
        if (dir === 'forward' || dir === 'forwardLeft' || dir === 'forwardRight') {
          console.log(`[getUserOrientation] Camera ${currentCameraAngle}° matches ${dir} at ${dirAngle}° (diff: ${angleDiff.toFixed(1)}°) → forward`)
          return 'forward'
        }

        // Back-family directions = backward oriented
        if (dir === 'back' || dir === 'backLeft' || dir === 'backRight') {
          console.log(`[getUserOrientation] Camera ${currentCameraAngle}° matches ${dir} at ${dirAngle}° (diff: ${angleDiff.toFixed(1)}°) → backward`)
          return 'backward'
        }

        // Perpendicular directions (left/right) - check how it was used in previous nav
        if (dir === 'left' || dir === 'right') {
          const connectionId = dirDef.connection
          const destinationPhoto = findPhotoById(connectionId)

          if (destinationPhoto) {
            // Find reverse connection from destination back to current
            const reverseDir = findReverseConnection(photo, destinationPhoto)

            if (reverseDir) {
              // If reverse is forward-family, this direction was backward continuation
              if (reverseDir === 'forward' || reverseDir === 'forwardLeft' || reverseDir === 'forwardRight') {
                console.log(`[getUserOrientation] Camera ${currentCameraAngle}° at ${dir} at ${dirAngle}° (diff: ${angleDiff.toFixed(1)}°), reverse is ${reverseDir} → backward`)
                return 'backward'
              }
              // If reverse is back-family, this direction was forward continuation
              if (reverseDir === 'back' || reverseDir === 'backLeft' || reverseDir === 'backRight') {
                console.log(`[getUserOrientation] Camera ${currentCameraAngle}° at ${dir} at ${dirAngle}° (diff: ${angleDiff.toFixed(1)}°), reverse is ${reverseDir} → forward`)
                return 'forward'
              }
            }
          }
        }
      }
    }
  }

  // Fallback: calculate based on hemisphere
  let forwardAngle: number

  if (photo.directions.forward) {
    forwardAngle = getDirectionAngle(photo, 'forward')
  } else if (photo.directions.back) {
    const backAngle = getDirectionAngle(photo, 'back')
    forwardAngle = (backAngle + 180) % 360
  } else {
    forwardAngle = photo.startingAngle ?? 0
  }

  const diff = calculateAngularDifference(currentCameraAngle, forwardAngle)
  const result = diff < 90 ? 'forward' : 'backward'

  console.log(`[getUserOrientation] Photo: ${photo.id}, Camera: ${currentCameraAngle}°, Forward ref: ${forwardAngle}°, Diff: ${diff}° → ${result}`)

  return result
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
 * Calculates camera orientation based on navigation context and reverse connection analysis
 *
 * Uses reverse connection detection to determine proper orientation for corner images
 * and other complex navigation scenarios. This ensures users always face the logical
 * continuation direction regardless of how the destination photo is configured.
 *
 * @param currentCameraAngle - User's current camera angle in degrees
 * @param currentPhoto - Source photo with corridor direction info
 * @param destinationPhoto - Target photo with corridor direction info
 * @param direction - Navigation direction being used
 * @param navigationType - Type of navigation being performed
 * @returns New camera angle that respects directional intent
 *
 * @example
 * ```typescript
 * // User navigates forward from a-f1-south-6 to x-f1-east-1 (corner)
 * // x-f1-east-1 only has 'right' and 'back' directions
 * // Reverse connection: x-f1-east-1.back → a-f1-south-6
 * // Target angle: opposite of 'back' = 0°
 * // Closest forward direction: 'right' at 90°
 * // Result: User faces right (the continuation direction)
 * ```
 */
function calculateNavigationAngle(
  currentCameraAngle: number,
  currentPhoto: Photo,
  destinationPhoto: Photo,
  direction: DirectionType,
  navigationType: NavigationType
): number {
  console.log(`\n[calculateNavigationAngle] ${currentPhoto.id} →(${direction})→ ${destinationPhoto.id}`)
  console.log(`  Camera: ${currentCameraAngle}°, NavType: ${navigationType}`)

  const isForwardMovement = direction === 'forward' || direction === 'forwardLeft' || direction === 'forwardRight'
  const isBackMovement = direction === 'back' || direction === 'backLeft' || direction === 'backRight'
  const isPureTurn = direction === 'left' || direction === 'right'

  // Determine effective movement type based on user's actual orientation
  let effectiveMovementType: 'forward' | 'backward' | null = null
  if (isForwardMovement) {
    effectiveMovementType = 'forward'
  } else if (isBackMovement) {
    effectiveMovementType = 'backward'
  } else if (isPureTurn) {
    // For pure turns, use user's current orientation to maintain directional continuity
    effectiveMovementType = getUserOrientation(currentCameraAngle, currentPhoto)
  }

  console.log(`  Movement type: ${effectiveMovementType}`)

  // Strategy 1: Reverse Connection Analysis (Primary - handles corners perfectly)
  const reverseDirection = findReverseConnection(currentPhoto, destinationPhoto)
  console.log(`  Reverse connection: ${reverseDirection || 'none'}`)

  if (reverseDirection) {
    const reverseAngle = getDirectionAngle(destinationPhoto, reverseDirection)
    const targetAngle = (reverseAngle + 180) % 360
    console.log(`  Reverse angle: ${reverseAngle}°, Target angle: ${targetAngle}°`)

    // For same-corridor bidirectional movement, preserve relative orientation
    // BUT only when there's an EXACT primary direction match (forward/back, not diagonal variants)
    if (navigationType === 'same-corridor') {
      const hasExactPrimaryDirection =
        (isForwardMovement && destinationPhoto.directions.forward) ||
        (isBackMovement && destinationPhoto.directions.back)

      if (hasExactPrimaryDirection) {
        console.log(`  Using preserved orientation (same-corridor with exact primary direction)`)
        // Use preserved orientation for smooth corridor movement
        return calculatePreservedOrientation(currentCameraAngle, currentPhoto, destinationPhoto)
      }
    }

    // Find closest available direction matching movement intent (including inferred for pure turns)
    if (effectiveMovementType) {
      const closestDirection = findClosestAvailableDirection(destinationPhoto, targetAngle, effectiveMovementType)
      console.log(`  Closest direction: ${closestDirection || 'none'}`)

      if (closestDirection) {
        const result = getDirectionAngle(destinationPhoto, closestDirection)
        console.log(`  ✓ Returning: ${result}° (${closestDirection})`)
        return result
      }
    }
  }

  // Strategy 2: Direct Direction Matching (Fallback for cases without reverse connection)
  if (isForwardMovement) {
    if (destinationPhoto.directions.forward) {
      const result = getDirectionAngle(destinationPhoto, 'forward')
      console.log(`  Strategy 2: Using forward at ${result}°`)
      return result
    } else if (destinationPhoto.directions.forwardLeft) {
      const result = getDirectionAngle(destinationPhoto, 'forwardLeft')
      console.log(`  Strategy 2: Using forwardLeft at ${result}°`)
      return result
    } else if (destinationPhoto.directions.forwardRight) {
      const result = getDirectionAngle(destinationPhoto, 'forwardRight')
      console.log(`  Strategy 2: Using forwardRight at ${result}°`)
      return result
    }
  } else if (isBackMovement) {
    if (destinationPhoto.directions.back) {
      const result = getDirectionAngle(destinationPhoto, 'back')
      console.log(`  Strategy 2: Using back at ${result}°`)
      return result
    } else if (destinationPhoto.directions.backLeft) {
      const result = getDirectionAngle(destinationPhoto, 'backLeft')
      console.log(`  Strategy 2: Using backLeft at ${result}°`)
      return result
    } else if (destinationPhoto.directions.backRight) {
      const result = getDirectionAngle(destinationPhoto, 'backRight')
      console.log(`  Strategy 2: Using backRight at ${result}°`)
      return result
    }
  }

  // Strategy 3: Same-Corridor Preservation (for pure turns and edge cases)
  if (navigationType === 'same-corridor' && !isPureTurn) {
    return calculatePreservedOrientation(currentCameraAngle, currentPhoto, destinationPhoto)
  }

  // Strategy 4: Final Fallback - Use startingAngle or opposite for backward movement
  if (isBackMovement) {
    const result = ((destinationPhoto.startingAngle ?? 0) + 180) % 360
    console.log(`  ✗ Fallback (backward): ${result}°`)
    return result
  }

  const result = destinationPhoto.startingAngle ?? 0
  console.log(`  ✗ Fallback (default): ${result}°`)
  return result
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
  const [currentPhotoId, setCurrentPhotoId] = useState<string>('x-f3-east-7')
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