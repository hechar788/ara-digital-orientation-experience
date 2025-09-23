/**
 * Interactive hotspot component for VR tour navigation.
 * Renders clickable elements positioned in 3D space on the panoramic image.
 *
 * @fileoverview Provides 3D-positioned hotspots for stairs, elevators, and navigation elements.
 */
import React from 'react'
import type { NavigationHotspot } from '../../types/tour'

/**
 * Stairs icon component using existing stairs.svg
 *
 * Renders the project's stairs.svg icon for stair hotspots.
 * Maintains design consistency with existing assets.
 *
 * @param className - CSS classes for styling customization
 * @param direction - Direction for rotation (up/down)
 */
const StairsIcon: React.FC<{ className?: string; direction: 'up' | 'down' }> = ({
  className = "w-8 h-8",
  direction
}) => (
  <svg
    className={`${className} ${direction === 'down' ? 'rotate-180' : ''}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 5h-5v5h-5v5h-5v5h-5" />
  </svg>
)

interface TourHotspotProps {
  hotspot: NavigationHotspot
  onClick: () => void
  containerWidth: number
  containerHeight: number
  cameraLon: number
  cameraLat: number
  className?: string
}

/**
 * Convert spherical coordinates to screen position
 *
 * Converts theta/phi coordinates from the hotspot data to screen pixel positions
 * based on current camera orientation and viewport dimensions.
 *
 * @param theta - Horizontal angle in degrees (0-360)
 * @param phi - Vertical angle in degrees (0-180, 90 = horizon)
 * @param cameraLon - Current camera horizontal rotation
 * @param cameraLat - Current camera vertical rotation
 * @param width - Container width in pixels
 * @param height - Container height in pixels
 * @returns Screen coordinates {x, y} or null if behind camera
 */
function sphericalToScreen(
  theta: number,
  phi: number,
  cameraLon: number,
  cameraLat: number,
  width: number,
  height: number
): { x: number; y: number } | null {
  // Convert degrees to radians
  const thetaRad = (theta * Math.PI) / 180
  const phiRad = (phi * Math.PI) / 180
  const cameraLonRad = (cameraLon * Math.PI) / 180
  const cameraLatRad = (cameraLat * Math.PI) / 180

  // Calculate relative position from camera
  const relativeLon = thetaRad - cameraLonRad
  const relativeLat = phiRad - (Math.PI / 2 - cameraLatRad)

  // Check if hotspot is in front of camera (simplified check)
  const dotProduct = Math.cos(relativeLon) * Math.cos(relativeLat)
  if (dotProduct < 0.1) return null // Behind camera or too far to side

  // Project to screen coordinates
  const fov = 75 * Math.PI / 180 // Field of view in radians
  const tanHalfFov = Math.tan(fov / 2)

  const x = (Math.sin(relativeLon) / tanHalfFov) * (width / 2) + (width / 2)
  const y = (Math.sin(relativeLat) / tanHalfFov) * (height / 2) + (height / 2)

  // Check if within screen bounds
  if (x < 0 || x > width || y < 0 || y > height) return null

  return { x, y }
}

/**
 * Tour hotspot component for 3D navigation elements
 *
 * Renders interactive hotspots positioned at specific coordinates in the 360° image.
 * Handles click events for navigation and provides visual feedback.
 *
 * @param hotspot - Hotspot data with position and direction
 * @param onClick - Function to call when hotspot is clicked
 * @param containerWidth - Width of the panoramic viewer container
 * @param containerHeight - Height of the panoramic viewer container
 * @param cameraLon - Current camera horizontal rotation
 * @param cameraLat - Current camera vertical rotation
 * @param className - Additional CSS classes
 */
export const TourHotspot: React.FC<TourHotspotProps> = ({
  hotspot,
  onClick,
  containerWidth,
  containerHeight,
  cameraLon,
  cameraLat,
  className = ''
}) => {
  const screenPos = sphericalToScreen(
    hotspot.position.theta,
    hotspot.position.phi,
    cameraLon,
    cameraLat,
    containerWidth,
    containerHeight
  )

  // Don't render if hotspot is not visible
  if (!screenPos) return null

  const renderHotspotContent = () => {
    switch (hotspot.direction) {
      case 'up':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-green-600/90 backdrop-blur-sm rounded-full animate-pulse"></div>
            <div className="relative bg-white rounded-full p-2 shadow-lg">
              <StairsIcon className="w-6 h-6 text-gray-800" direction="up" />
            </div>
          </div>
        )
      case 'down':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-green-600/90 backdrop-blur-sm rounded-full animate-pulse"></div>
            <div className="relative bg-white rounded-full p-2 shadow-lg">
              <StairsIcon className="w-6 h-6 text-gray-800" direction="down" />
            </div>
          </div>
        )
      case 'elevator':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/90 backdrop-blur-sm rounded-lg animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-2 shadow-lg">
              <div className="w-6 h-6 flex items-center justify-center text-gray-800 font-bold text-sm">
                E
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 hover:scale-110 transition-transform duration-200 ${className}`}
      style={{
        left: screenPos.x,
        top: screenPos.y,
      }}
      onClick={onClick}
      title={`Go ${hotspot.direction}${hotspot.direction === 'elevator' ? ' (elevator)' : 'stairs'}`}
    >
      {renderHotspotContent()}
    </div>
  )
}