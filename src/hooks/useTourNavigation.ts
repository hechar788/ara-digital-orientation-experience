/**
 * Custom hook for managing VR tour navigation state and photo transitions.
 * Handles current photo tracking, directional navigation, and loading states.
 *
 * @fileoverview Provides navigation logic for the VR campus tour system.
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { findPhotoById, getAreaForPhoto } from '../data/blockUtils'
import type { Photo, DirectionType, DirectionDefinition } from '../types/tour'
import { getArrowAngle } from '../components/viewer/navigation/arrowRegistry'
import {
  getDirectionAngle as computeDirectionAngle,
  findDirectionToTarget,
  isHorizontalDirection
} from './utils/directionUtils'

/**
 * Starting photo location for the VR tour
 *
 * This is the default location where users begin their tour and where
 * they are reset to when starting/restarting The Amazing Race.
 */
// export const TOUR_START_PHOTO_ID = 'a-f1-north-entrance'
export const TOUR_START_PHOTO_ID = 'outside-a-east-1'


/**
 * Calculates the absolute angle for a direction based on photo's startingAngle
 *
 * @param photo - Photo containing the direction and startingAngle
 * @param direction - Direction name to calculate angle for
 * @returns Absolute angle in degrees (0-360)
 */
/**
 * Type guard verifying a direction definition contains a connection object
 *
 * Horizontal navigation directions are stored as objects with a connection id,
 * while vertical navigation can use raw strings or string arrays. This guard
 * lets TypeScript safely treat dynamic lookups as `DirectionDefinition`.
 *
 * @param direction - Direction value pulled from photo.directions
 * @returns True when the value is a DirectionDefinition
 *
 * @example
 * ```typescript
 * const rawDirection = photo.directions.forward
 * if (isDirectionDefinition(rawDirection)) {
 *   navigate(rawDirection.connection)
 * }
 * ```
 */
function isDirectionDefinition(
  direction: Photo['directions'][DirectionType] | undefined
): direction is DirectionDefinition {
  return typeof direction === 'object' && direction !== null && 'connection' in direction
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
    if (isDirectionDefinition(dirDef) && dirDef.connection === fromPhoto.id) {
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

  if (availableDirs.length === 0) {
    return null
  }

  let closestDir: DirectionType | null = null
  let minDiff = Infinity

  for (const dir of availableDirs) {
    const dirAngle = computeDirectionAngle(photo, dir)
    const diff = calculateAngularDifference(dirAngle, targetAngle)

    if (diff < minDiff) {
      minDiff = diff
      closestDir = dir
    }
  }

  return closestDir
}

/**
 * Finds the direction on a photo that leads to the specified target photo ID.
 *
 * Checks horizontal directions first (which include connection metadata),
 * then falls back to vertical and special navigation entries that may be
 * stored as strings or arrays.
 *
 * @param photo - Photo containing navigation directions
 * @param targetPhotoId - Destination photo identifier to search for
 * @returns Direction that connects to the target, or null if none connect
 *
 * @example
 * ```typescript
 * const direction = findDirectionToTarget(currentPhoto, 'library-f1-entrance')
 * // Returns: 'forwardRight'
 * ```
 */
function getHotspotHeading(
  photo: Photo,
  direction: DirectionType,
  destinationId?: string
): number | undefined {
  const hotspots = photo.hotspots ?? []

  for (const hotspot of hotspots) {
    if (hotspot.direction !== direction) {
      continue
    }
    if (destinationId && hotspot.destination && hotspot.destination !== destinationId) {
      continue
    }

    const { x, z } = hotspot.position
    const angleRad = Math.atan2(z, x)
    const angleDeg = angleRad * (180 / Math.PI)
    return normalizeAngle(angleDeg)
  }

  return undefined
}

/**
 * Optional configuration applied when jumping directly to a photo.
 *
 * @property previewDirection - When true, rotates the camera toward the outgoing direction before moving
 * @property previewDelayMs - Duration to wait after the preview rotation before navigating (defaults to 1000 ms)
 * @property nextPhotoId - Optional upcoming photo ID used to pre-orient the camera after arrival
 */
export interface JumpToPhotoOptions {
  previewDirection?: boolean
  previewDelayMs?: number
  nextPhotoId?: string
}

function normalizeAngle(angle: number): number {
  let result = angle % 360
  if (result < 0) {
    result += 360
  }
  return result
}

/**
 * Resolve the camera orientation to apply immediately after arriving at a destination photo.
 *
 * Maintains the heading used during the movement whenever available so the user
 * keeps facing the travelled direction. Falls back to the upcoming orientation
 * suggestion when the movement heading cannot be determined, and finally to the
 * provided fallback angle (typically the photo's starting angle or current camera heading).
 *
 * @param movementAngle - Angle used while travelling to the destination (0-360 degrees)
 * @param postArrivalAngle - Optional suggested angle for the next movement (0-360 degrees)
 * @param fallbackAngle - Angle to use when no other data is available (0-360 degrees)
 * @returns Normalized absolute angle in degrees (0-360) to apply after arrival
 *
 * @example
 * ```typescript
 * const arrival = resolveArrivalOrientation({
 *   movementAngle: 180,
 *   postArrivalAngle: 90,
 *   fallbackAngle: 0
 * })
 * // arrival === 180
 * ```
 */
export function resolveArrivalOrientation({
  navigationAngle,
  postArrivalAngle,
  movementAngle,
  fallbackAngle
}: {
  navigationAngle?: number
  postArrivalAngle?: number
  movementAngle?: number
  fallbackAngle: number
}): number {
  if (typeof navigationAngle === 'number') {
    return normalizeAngle(navigationAngle)
  }

  if (typeof postArrivalAngle === 'number') {
    return normalizeAngle(postArrivalAngle)
  }

  if (typeof movementAngle === 'number') {
    return normalizeAngle(movementAngle)
  }

  return normalizeAngle(fallbackAngle)
}

function clampLatitude(lat: number): number {
  return Math.max(-25, Math.min(85, lat))
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
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
    if (isDirectionDefinition(dirDef)) {
      const dirAngle = computeDirectionAngle(photo, dir)
      const angleDiff = Math.abs(currentCameraAngle - dirAngle)
      // 15° tolerance accounts for VR navigation imprecision
      if (angleDiff < 15 || angleDiff > 345) {
        // Camera matches this direction - determine orientation based on direction type

        // Forward-family directions = forward oriented
        if (dir === 'forward' || dir === 'forwardLeft' || dir === 'forwardRight') {
          return 'forward'
        }

        // Back-family directions = backward oriented
        if (dir === 'back' || dir === 'backLeft' || dir === 'backRight') {
          return 'backward'
        }

        // Perpendicular directions (left/right) - check how it was used in previous nav
        if ((dir === 'left' || dir === 'right') && isDirectionDefinition(dirDef)) {
          const connectionId = dirDef.connection
          const destinationPhoto = findPhotoById(connectionId)

          if (destinationPhoto) {
            // Find reverse connection from destination back to current
            const reverseDir = findReverseConnection(photo, destinationPhoto)

            if (reverseDir) {
              // If reverse is forward-family, this direction was backward continuation
              if (reverseDir === 'forward' || reverseDir === 'forwardLeft' || reverseDir === 'forwardRight') {
                return 'backward'
              }
              // If reverse is back-family, this direction was forward continuation
              if (reverseDir === 'back' || reverseDir === 'backLeft' || reverseDir === 'backRight') {
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
    forwardAngle = computeDirectionAngle(photo, 'forward')
  } else if (photo.directions.back) {
    const backAngle = computeDirectionAngle(photo, 'back')
    forwardAngle = (backAngle + 180) % 360
  } else {
    forwardAngle = photo.startingAngle ?? 0
  }

  const diff = calculateAngularDifference(currentCameraAngle, forwardAngle)
  const result = diff < 90 ? 'forward' : 'backward'

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

interface OrientationOverride {
  matches(current: Photo, destination: Photo): boolean
  offsetDegrees?: number
  absoluteAngle?: number
}

const ORIENTATION_OVERRIDES: OrientationOverride[] = [
  {
    matches: (current, destination) =>
      current.id === 'n-f1-sandys-office' && destination.id === 'n-f1-west-9',
    offsetDegrees: -90
  },
  {
    matches: (current, destination) =>
      destination.id === 'n-f1-mid-7' && current.id === 'outside-n-north-entrance',
    offsetDegrees: -100
  },
  {
    matches: (current, destination) =>
      destination.id === 'n-f1-mid-7' && current.id === 'outside-s-north-entrance',
    offsetDegrees: -100
  },
  {
    matches: (current, destination) =>
      destination.id === 'n-f1-mid-7' && current.id === 'outside-s-north-1',
    offsetDegrees: -100
  },
  {
    matches: (current, destination) =>
      destination.id === 'library-f1-entrance' &&
      (current.id === 'x-f1-mid-6' || current.id === 'x-f1-mid-6-library'),
    offsetDegrees: 90
  },
  {
    matches: (current, destination) =>
      (current.id === 'library-f1-entrance' || current.id === 'library-f1-1') &&
      (destination.id === 'x-f1-mid-6' || destination.id === 'x-f1-mid-6-library'),
    offsetDegrees: 115,
  },
  {
    matches: (current, destination) =>
      current.id === 'outside-x-north-entrance' && destination.id === 'x-f1-west-12',
    offsetDegrees: -80
  },
  {
    matches: (current, destination) =>
      current.id === 'x-f2-north-entry' && destination.id === 'x-f2-west-1',
    offsetDegrees: -100
  },
  {
    matches: (current, destination) =>
      current.id === 'x-f2-west-1' && destination.id === 'x-f2-north-entry',
    offsetDegrees: -100
  },
  {
    matches: (current, destination) =>
      current.id === 'x-f2-north-entry' && destination.id === 'x-f3-west-entry',
    offsetDegrees: -180
  },
  {
    matches: (current, destination) =>
      current.id === 'outside-g-mid-5' && destination.id === 'outside-g-mid-4',
    offsetDegrees: 35
  },
  {
    matches: (current, destination) =>
      current.id === 'outside-n-north-1-aside' && destination.id === 'outside-n-north-1',
    offsetDegrees: 160
  },
  {
    matches: (current, destination) =>
      current.id === 'outside-s-north-1-aside-1' && destination.id === 'outside-s-north-1-aside-2',
    offsetDegrees: 0
  },
  {
    matches: (current, destination) =>
      current.id === 'outside-g-mid-4' && destination.id === 'outside-x-north-1',
    offsetDegrees: 140
  },
  {
    matches: (current, destination) =>
      current.id === 'outside-x-north-1' && destination.id === 'outside-x-north-2',
    offsetDegrees: 90
  }
]

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
  const currentDirectionDefinition = currentPhoto.directions[direction]
  const currentConnection = isDirectionDefinition(currentDirectionDefinition)
    ? currentDirectionDefinition.connection
    : undefined

  // Determine primary reverse direction (forward-based ↔ back-based)
  const reverseDirection: DirectionType = isForwardMovement ? 'back' : 'forward'
  const destinationDirectionDefinition = destinationPhoto.directions[reverseDirection]
  const destinationConnection = isDirectionDefinition(destinationDirectionDefinition)
    ? destinationDirectionDefinition.connection
    : undefined

  // Not bidirectional connections
  if (currentConnection !== destinationPhoto.id || destinationConnection !== currentPhoto.id) {
    return { navigationType: 'same-building-corner', preserveOrientation: false }
  }

  // Check corridor geometry by comparing the actual connection angles being used
  const currentDirectionAngle = computeDirectionAngle(currentPhoto, direction)
  const destinationReverseAngle = computeDirectionAngle(destinationPhoto, reverseDirection)

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
  const isForwardMovement = direction === 'forward' || direction === 'forwardLeft' || direction === 'forwardRight'
  const isBackMovement = direction === 'back' || direction === 'backLeft' || direction === 'backRight'
  const isPureTurn = direction === 'left' || direction === 'right'

  // Check for orientation overrides first (applies to all directions)
  const override = ORIENTATION_OVERRIDES.find(entry => entry.matches(currentPhoto, destinationPhoto))
  if (override) {
    if (typeof override.absoluteAngle === 'number') {
      return normalizeAngle(override.absoluteAngle)
    }

    // For door directions, use hotspot headings
    if (direction === 'door') {
      const destinationHeading =
        getHotspotHeading(destinationPhoto, 'door', currentPhoto.id) ??
        getHotspotHeading(destinationPhoto, 'door')
      const offset = override.offsetDegrees ?? 0

      if (typeof destinationHeading === 'number') {
        return normalizeAngle(destinationHeading + offset)
      }
    } else {
      // For non-door directions, use destination photo's direction angle
      const destinationAngle = computeDirectionAngle(destinationPhoto, direction)
      const offset = override.offsetDegrees ?? 0

      if (typeof destinationAngle === 'number') {
        return normalizeAngle(destinationAngle + offset)
      }
    }
  }

  // Handle door-specific logic when no override matches
  if (direction === 'door') {
    const destinationHeading =
      getHotspotHeading(destinationPhoto, 'door', currentPhoto.id) ??
      getHotspotHeading(destinationPhoto, 'door')
    const originHeading =
      getHotspotHeading(currentPhoto, 'door', destinationPhoto.id) ??
      getHotspotHeading(currentPhoto, 'door')

    if (typeof destinationHeading === 'number') {
      return normalizeAngle(destinationHeading + 180)
    }

    if (typeof originHeading === 'number') {
      return normalizeAngle(originHeading + 180)
    }
  }

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

  // Strategy 1: Reverse Connection Analysis (Primary - handles corners perfectly)
  const reverseDirection = findReverseConnection(currentPhoto, destinationPhoto)

  if (reverseDirection) {
    const reverseAngle = computeDirectionAngle(destinationPhoto, reverseDirection)
    const targetAngle = (reverseAngle + 180) % 360

    // For same-corridor bidirectional movement, preserve relative orientation
    // BUT only when there's an EXACT primary direction match (forward/back, not diagonal variants)
    if (navigationType === 'same-corridor') {
      const hasExactPrimaryDirection =
        (isForwardMovement && destinationPhoto.directions.forward) ||
        (isBackMovement && destinationPhoto.directions.back)

      if (hasExactPrimaryDirection) {
        // Use preserved orientation for smooth corridor movement
        return calculatePreservedOrientation(currentCameraAngle, currentPhoto, destinationPhoto)
      }
    }

    // Find closest available direction matching movement intent (including inferred for pure turns)
    if (effectiveMovementType) {
      const closestDirection = findClosestAvailableDirection(destinationPhoto, targetAngle, effectiveMovementType)

      if (closestDirection) {
      const result = computeDirectionAngle(destinationPhoto, closestDirection)
        return result
      }
    }
  }

  // Strategy 2: Direct Direction Matching (Fallback for cases without reverse connection)
  if (isForwardMovement) {
    if (destinationPhoto.directions.forward) {
      const result = computeDirectionAngle(destinationPhoto, 'forward')
      return result
    } else if (destinationPhoto.directions.forwardLeft) {
      const result = computeDirectionAngle(destinationPhoto, 'forwardLeft')
      return result
    } else if (destinationPhoto.directions.forwardRight) {
      const result = computeDirectionAngle(destinationPhoto, 'forwardRight')
      return result
    }
  } else if (isBackMovement) {
    if (destinationPhoto.directions.back) {
      const result = computeDirectionAngle(destinationPhoto, 'back')
      return result
    } else if (destinationPhoto.directions.backLeft) {
      const result = computeDirectionAngle(destinationPhoto, 'backLeft')
      return result
    } else if (destinationPhoto.directions.backRight) {
      const result = computeDirectionAngle(destinationPhoto, 'backRight')
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
    return result
  }

  const result = destinationPhoto.startingAngle ?? 0
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
  const currentForward = currentPhoto.directions.forward ? computeDirectionAngle(currentPhoto, 'forward') : undefined
  const destForward = destinationPhoto.directions.forward ? computeDirectionAngle(destinationPhoto, 'forward') : undefined

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
  const [currentPhotoId, setCurrentPhotoId] = useState<string>(TOUR_START_PHOTO_ID)
  const [isLoading, setIsLoading] = useState(false)
  const [cameraLon, setCameraLon] = useState(180)
  const [cameraLat, setCameraLat] = useState(0)
  const [cameraCommandId, setCameraCommandId] = useState(0)
  const [calculatedCameraAngle, setCalculatedCameraAngle] = useState<number | undefined>(undefined)
  const [currentPhotoImage, setCurrentPhotoImage] = useState<HTMLImageElement | null>(null)
  const currentPhotoRef = useRef<Photo | null>(null)
  const currentPhotoIdRef = useRef<string>(currentPhotoId)
  const cameraLonRef = useRef<number>(cameraLon)
  const isLoadingRef = useRef<boolean>(isLoading)
  const isProcessingRef = useRef<boolean>(false)
  // Get current photo using centralized lookup
  const currentPhoto = useMemo(() => {
    return findPhotoById(currentPhotoId)
  }, [currentPhotoId])

  // Get current area context
  const currentArea = useMemo(() => {
    return getAreaForPhoto(currentPhotoId)
  }, [currentPhotoId])

  useEffect(() => {
    currentPhotoRef.current = currentPhoto
  }, [currentPhoto])

  useEffect(() => {
    currentPhotoIdRef.current = currentPhotoId
  }, [currentPhotoId])

  useEffect(() => {
    cameraLonRef.current = cameraLon
  }, [cameraLon])

  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  const issueCameraOrientation = useCallback((lon: number, lat: number) => {
    const normalizedLon = normalizeAngle(lon)
    const clampedLat = clampLatitude(lat)
    setCameraLon(normalizedLon)
    setCameraLat(clampedLat)
    setCameraCommandId(prev => prev + 1)
  }, [])

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
      if (isDirectionDefinition(directionDef)) {
        targetPhotoId = directionDef.connection
      }
    } else {
      // Handle vertical movement (up/down), elevator, and floor selection
      targetPhotoId = currentPhoto.directions[direction]
    }

    if (targetPhotoId) {
      setIsLoading(true)
      isLoadingRef.current = true


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
          setCurrentPhotoImage(img)
          setCurrentPhotoId(finalTargetId)
          setCalculatedCameraAngle(calculatedAngle)
          issueCameraOrientation(calculatedAngle, 0)
          setIsLoading(false)
          isLoadingRef.current = false
        }
        img.onerror = () => {
          setCurrentPhotoImage(null)
          setIsLoading(false)
          isLoadingRef.current = false
          console.error('Failed to load image:', targetPhoto.imageUrl)
        }
        img.src = targetPhoto.imageUrl
      } else {
        setIsLoading(false)
        isLoadingRef.current = false
        console.error('Target photo not found:', finalTargetId)
      }
    }
  }, [currentPhoto, isLoading, cameraLon, issueCameraOrientation])

  /**
   * Jump directly to a specific photo by ID
   *
   * Navigates directly to any photo in the tour system without
   * following connection paths. Useful for location menu and search.
   *
   * @param photoId - Target photo ID to navigate to
   * @param options - Optional configuration for direction preview behaviour
   * @returns Promise that resolves once the navigation finishes loading
   */
  const jumpToPhoto = useCallback(async (photoId: string, options?: JumpToPhotoOptions) => {
    const activeCurrentPhoto = currentPhotoRef.current ?? currentPhoto
    const activeCurrentPhotoId = currentPhotoIdRef.current ?? currentPhotoId
    const activeCameraLon = cameraLonRef.current ?? cameraLon

    if (isProcessingRef.current || isLoadingRef.current || photoId === activeCurrentPhotoId) {
      return
    }
    isProcessingRef.current = true

    const targetPhoto = findPhotoById(photoId)
    if (!targetPhoto) {
      console.error('Photo not found:', photoId)
      isProcessingRef.current = false
      return
    }

    let resolvedDirection: DirectionType | null = null
    let navigationAnalysis: NavigationAnalysis | null = null
    let movementAngle: number | undefined
    const upcomingPhotoId = options?.nextPhotoId
    let postArrivalAngle: number | undefined

    if (activeCurrentPhoto) {
      resolvedDirection = findDirectionToTarget(activeCurrentPhoto, photoId)
      if (resolvedDirection) {
        navigationAnalysis = analyzeNavigation(activeCurrentPhoto, targetPhoto, resolvedDirection)
        const arrowAngle = getArrowAngle(activeCurrentPhoto.id, resolvedDirection)
        if (arrowAngle !== undefined) {
          movementAngle = arrowAngle
        } else if (isHorizontalDirection(resolvedDirection)) {
          movementAngle = computeDirectionAngle(activeCurrentPhoto, resolvedDirection)
        } else {
          movementAngle = getHotspotHeading(activeCurrentPhoto, resolvedDirection, photoId)
        }
      }
    }

    if (upcomingPhotoId) {
      const nextDirection = findDirectionToTarget(targetPhoto, upcomingPhotoId)
      if (nextDirection) {
        const arrowAngle = getArrowAngle(targetPhoto.id, nextDirection)
        if (arrowAngle !== undefined) {
          postArrivalAngle = arrowAngle
        } else if (isHorizontalDirection(nextDirection)) {
          postArrivalAngle = computeDirectionAngle(targetPhoto, nextDirection)
        } else {
          postArrivalAngle = getHotspotHeading(targetPhoto, nextDirection, upcomingPhotoId)
        }
      }
    }

    if (options?.previewDirection) {
      const currentFacing = normalizeAngle(activeCameraLon)
      const targetAngleCandidate = movementAngle ?? targetPhoto.startingAngle ?? activeCameraLon
      const normalizedTarget = normalizeAngle(targetAngleCandidate)
      const rotationNeeded = calculateAngularDifference(currentFacing, normalizedTarget)

      issueCameraOrientation(normalizedTarget, 0)
      movementAngle = normalizedTarget

      if (rotationNeeded > 5) {
        await delay(options.previewDelayMs ?? 1000)
      }
    } else if (movementAngle === undefined) {
      movementAngle = targetPhoto.startingAngle ?? activeCameraLon
    }

    setIsLoading(true)
    isLoadingRef.current = true

    const navigationArrivalAngle =
      activeCurrentPhoto && resolvedDirection && navigationAnalysis
        ? calculateNavigationAngle(
            movementAngle ?? activeCameraLon,
            activeCurrentPhoto,
            targetPhoto,
            resolvedDirection,
            navigationAnalysis.navigationType
          )
        : undefined


    try {
      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          setCurrentPhotoImage(img)
          setCurrentPhotoId(photoId)

          const normalizedFinal = resolveArrivalOrientation({
            navigationAngle: navigationArrivalAngle,
            postArrivalAngle,
            movementAngle,
            fallbackAngle: targetPhoto.startingAngle ?? activeCameraLon
          })

          setCalculatedCameraAngle(normalizedFinal)
          issueCameraOrientation(normalizedFinal, 0)
          isLoadingRef.current = false

          resolve()
        }
        img.onerror = () => {
          setCurrentPhotoImage(null)
          isLoadingRef.current = false
          reject(new Error(`Failed to load image: ${targetPhoto.imageUrl}`))
        }
        img.src = targetPhoto.imageUrl
      })
    } catch (error) {
      console.error('Failed to load image:', targetPhoto.imageUrl, error)
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
      isProcessingRef.current = false
    }
  }, [cameraLon, currentPhoto, currentPhotoId, isLoading, issueCameraOrientation])


  return {
    // State
    currentPhotoId,
    currentPhoto,
    currentPhotoImage,
    currentArea,
    isLoading,
    cameraLon,
    cameraLat,
    cameraCommandId,
    calculatedCameraAngle,

    // Navigation functions
    navigateDirection,
    jumpToPhoto,
    handleCameraChange
  }
}
