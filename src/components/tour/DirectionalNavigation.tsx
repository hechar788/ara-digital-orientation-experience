/**
 * Simple directional navigation component for mobile-friendly VR tour navigation
 *
 * Shows clickable direction buttons based on camera orientation and available connections.
 * Positioned above the control bar for easy access on mobile devices.
 */
import React from 'react'
import type { Photo } from '../../types/tour'

/**
 * Props for DirectionalNavigation component
 *
 * @property currentPhoto - Currently displayed photo with connection data
 * @property cameraLon - Current camera horizontal rotation in degrees
 * @property onNavigate - Callback function for handling navigation actions
 * @property isLoading - Whether navigation is currently in progress
 */
interface DirectionalNavigationProps {
  currentPhoto: Photo | null
  cameraLon: number
  onNavigate: (direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down') => void
  isLoading: boolean
}

/**
 * Determines if user is looking in a specific direction based on camera orientation
 *
 * @param cameraLon - Current camera horizontal rotation in degrees
 * @param direction - Direction to check
 * @param orientationOffset - Photo's orientation offset in degrees (default 0)
 * @returns Whether user is looking in that direction (within 45° threshold)
 */
function isLookingInDirection(cameraLon: number, direction: 'forward' | 'back' | 'left' | 'right', orientationOffset: number = 0): boolean {
  // Apply orientation offset to camera longitude
  const adjustedCameraLon = cameraLon + orientationOffset

  // Normalize adjusted camera longitude to 0-360 range
  const normalizedLon = ((adjustedCameraLon % 360) + 360) % 360

  // Define target angles for each direction
  const directionAngles = {
    forward: 0,    // Looking straight ahead
    right: 90,     // Looking right
    back: 180,     // Looking backward
    left: 270      // Looking left
  }

  const targetAngle = directionAngles[direction]
  let angleDiff = Math.abs(normalizedLon - targetAngle)

  // Handle wraparound (e.g., 350° to 10° should be 20°, not 340°)
  if (angleDiff > 180) {
    angleDiff = 360 - angleDiff
  }

  // Show button if within 45° of target direction
  return angleDiff <= 45
}

/**
 * DirectionalNavigation component providing clickable direction buttons
 *
 * Features:
 * - Shows only when looking in valid directions with available connections
 * - Mobile-optimized touch targets
 * - Positioned above control bar
 * - Simple text-based buttons for clarity
 *
 * @param props - Component props
 * @returns JSX element with directional navigation buttons
 */
export const DirectionalNavigation: React.FC<DirectionalNavigationProps> = ({
  currentPhoto,
  cameraLon,
  onNavigate,
  isLoading
}) => {
  if (!currentPhoto) return null

  const { connections } = currentPhoto

  // Get orientation offset for this photo (if available)
  const orientationOffset = currentPhoto.orientationOffset || 0

  // Determine which directions to show based on camera orientation and available connections
  const showForward = connections.forward && isLookingInDirection(cameraLon, 'forward', orientationOffset)
  const showBack = connections.back && isLookingInDirection(cameraLon, 'back', orientationOffset)
  const showLeft = connections.left && isLookingInDirection(cameraLon, 'left', orientationOffset)
  const showRight = connections.right && isLookingInDirection(cameraLon, 'right', orientationOffset)

  // Always show up/down if available (not direction dependent)
  const showUp = !!connections.up
  const showDown = !!connections.down

  // Don't render if no directions are available
  if (!showForward && !showBack && !showLeft && !showRight && !showUp && !showDown) {
    return null
  }

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex gap-2 justify-center">
        {showForward && (
          <button
            onClick={() => onNavigate('forward')}
            onTouchStart={() => {}} // Ensure touch events are handled
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Go Forward
          </button>
        )}

        {showBack && (
          <button
            onClick={() => onNavigate('back')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Go Back
          </button>
        )}

        {showLeft && (
          <button
            onClick={() => onNavigate('left')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Go Left
          </button>
        )}

        {showRight && (
          <button
            onClick={() => onNavigate('right')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Go Right
          </button>
        )}

        {showUp && (
          <button
            onClick={() => onNavigate('up')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Go Up
          </button>
        )}

        {showDown && (
          <button
            onClick={() => onNavigate('down')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Go Down
          </button>
        )}
      </div>
    </div>
  )
}