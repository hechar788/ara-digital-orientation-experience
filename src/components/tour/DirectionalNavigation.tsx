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
 * @property currentPhoto - Currently displayed photo with direction data
 * @property cameraLon - Current camera horizontal rotation in degrees
 * @property onNavigate - Callback function for handling HORIZONTAL navigation actions only
 * @property isLoading - Whether navigation is currently in progress
 */
interface DirectionalNavigationProps {
  currentPhoto: Photo | null
  cameraLon: number
  onNavigate: (direction: 'forward' | 'back' | 'left' | 'right') => void
  isLoading: boolean
}

/**
 * Determines if user is looking in a specific direction based on camera orientation
 *
 * @param cameraLon - Current camera horizontal rotation in degrees
 * @param targetAngle - The angle where the direction button should appear
 * @returns Whether user is looking in that direction (within 45° threshold)
 */
function isLookingInDirection(
  cameraLon: number,
  targetAngle: number
): boolean {
  // Normalize camera longitude to 0-360 range
  const normalizedLon = ((cameraLon % 360) + 360) % 360

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

  const { directions } = currentPhoto

  // Determine which HORIZONTAL directions to show based on camera orientation and available directions
  const showForward = directions.forward && isLookingInDirection(cameraLon, directions.forward.angle)
  const showBack = directions.back && isLookingInDirection(cameraLon, directions.back.angle)
  const showLeft = directions.left && isLookingInDirection(cameraLon, directions.left.angle)
  const showRight = directions.right && isLookingInDirection(cameraLon, directions.right.angle)

  // Don't render if no horizontal directions are available
  if (!showForward && !showBack && !showLeft && !showRight) {
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
      </div>
    </div>
  )
}