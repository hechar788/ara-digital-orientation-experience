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
 * @property onNavigate - Callback function for handling navigation actions
 * @property isLoading - Whether navigation is currently in progress
 */
interface DirectionalNavigationProps {
  currentPhoto: Photo | null
  cameraLon: number
  onNavigate: (direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down' | 'elevator' | 'floor1' | 'floor2' | 'floor3' | 'floor4') => void
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

  // Determine which directions to show based on camera orientation and available directions
  const showForward = directions.forward && isLookingInDirection(cameraLon, directions.forward.angle)
  const showBack = directions.back && isLookingInDirection(cameraLon, directions.back.angle)
  const showLeft = directions.left && isLookingInDirection(cameraLon, directions.left.angle)
  const showRight = directions.right && isLookingInDirection(cameraLon, directions.right.angle)

  // Always show up/down/elevator if available (not direction dependent)
  const showUp = !!directions.up
  const showDown = !!directions.down
  const showElevator = !!directions.elevator

  // Floor buttons for elevator interior
  const showFloor1 = !!directions.floor1
  const showFloor2 = !!directions.floor2
  const showFloor3 = !!directions.floor3
  const showFloor4 = !!directions.floor4

  // Don't render if no directions are available
  if (!showForward && !showBack && !showLeft && !showRight && !showUp && !showDown && !showElevator && !showFloor1 && !showFloor2 && !showFloor3 && !showFloor4) {
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

        {showElevator && (
          <button
            onClick={() => onNavigate('elevator')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Enter Elevator
          </button>
        )}

        {/* Floor selection buttons for elevator interior */}
        {showFloor1 && (
          <button
            onClick={() => onNavigate('floor1')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Floor 1
          </button>
        )}

        {showFloor2 && (
          <button
            onClick={() => onNavigate('floor2')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Floor 2
          </button>
        )}

        {showFloor3 && (
          <button
            onClick={() => onNavigate('floor3')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Floor 3
          </button>
        )}

        {showFloor4 && (
          <button
            onClick={() => onNavigate('floor4')}
            onTouchStart={() => {}}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] min-h-[44px] touch-manipulation select-none text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Floor 4
          </button>
        )}

      </div>
    </div>
  )
}