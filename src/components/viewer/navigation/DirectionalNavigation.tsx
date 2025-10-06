/**
 * Simple directional navigation component for mobile-friendly VR tour navigation
 *
 * Shows clickable direction buttons based on camera orientation and available connections.
 * Positioned above the control bar for easy access on mobile devices.
 */
import React from 'react'
import type { Photo } from '../../types/tour'
import { DIRECTION_ANGLES } from '../../types/tour'

/**
 * Props for DirectionalNavigation component
 *
 * @property currentPhoto - Currently displayed photo with direction data
 * @property cameraLon - Current camera horizontal rotation in degrees
 * @property onNavigate - Callback function for handling HORIZONTAL navigation actions (8 directions)
 * @property isLoading - Whether navigation is currently in progress
 */
interface DirectionalNavigationProps {
  currentPhoto: Photo | null
  cameraLon: number
  onNavigate: (direction: 'forward' | 'forwardRight' | 'right' | 'backRight' | 'back' | 'backLeft' | 'left' | 'forwardLeft') => void
  isLoading: boolean
}

/**
 * Determines if user is looking in a specific direction based on camera orientation
 *
 * @param cameraLon - Current camera horizontal rotation in degrees
 * @param targetAngle - The angle where the direction button should appear
 * @returns Whether user is looking in that direction (within 20° threshold for 8-directional navigation)
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

  // Show button if within 20° of target direction (8-directional with 5° gaps)
  return angleDiff <= 20
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
  const startingAngle = currentPhoto.startingAngle ?? 0

  // Calculate actual angles for each direction based on startingAngle + offset
  const getAngle = (direction: string) => {
    const offset = DIRECTION_ANGLES[direction] ?? 0
    return (startingAngle + offset) % 360
  }

  // Determine which HORIZONTAL directions to show based on camera orientation and available directions (8-directional)
  const showForward = directions.forward && isLookingInDirection(cameraLon, getAngle('forward'))
  const showForwardRight = directions.forwardRight && isLookingInDirection(cameraLon, getAngle('forwardRight'))
  const showRight = directions.right && isLookingInDirection(cameraLon, getAngle('right'))
  const showBackRight = directions.backRight && isLookingInDirection(cameraLon, getAngle('backRight'))
  const showBack = directions.back && isLookingInDirection(cameraLon, getAngle('back'))
  const showBackLeft = directions.backLeft && isLookingInDirection(cameraLon, getAngle('backLeft'))
  const showLeft = directions.left && isLookingInDirection(cameraLon, getAngle('left'))
  const showForwardLeft = directions.forwardLeft && isLookingInDirection(cameraLon, getAngle('forwardLeft'))

  // Don't render if no horizontal directions are available
  if (!showForward && !showForwardRight && !showRight && !showBackRight &&
      !showBack && !showBackLeft && !showLeft && !showForwardLeft) {
    return null
  }

  return (
    <div
      className="fixed left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto"
      style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex gap-2 justify-center flex-wrap max-w-md">
        {showForward && (
          <button
            onClick={() => onNavigate('forward')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Forward
          </button>
        )}

        {showForwardRight && (
          <button
            onClick={() => onNavigate('forwardRight')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Forward ↗
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
            Right
          </button>
        )}

        {showBackRight && (
          <button
            onClick={() => onNavigate('backRight')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Back ↘
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
            Back
          </button>
        )}

        {showBackLeft && (
          <button
            onClick={() => onNavigate('backLeft')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Back ↙
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
            Left
          </button>
        )}

        {showForwardLeft && (
          <button
            onClick={() => onNavigate('forwardLeft')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Forward ↖
          </button>
        )}
      </div>
    </div>
  )
}