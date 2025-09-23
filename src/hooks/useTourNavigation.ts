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
  const [cameraLon, setCameraLon] = useState(0)
  const [cameraLat, setCameraLat] = useState(0)

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
   * @param direction - Direction to navigate (forward, back, left, right, up, down)
   */
  const navigateDirection = useCallback((direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down') => {
    if (!currentPhoto || isLoading) return

    const targetPhotoId = currentPhoto.connections[direction]
    if (targetPhotoId) {
      setIsLoading(true)

      // Handle array of connections (multi-floor elevators)
      const finalTargetId = Array.isArray(targetPhotoId) ? targetPhotoId[0] : targetPhotoId

      // Preload image before navigation
      const targetPhoto = findPhotoById(finalTargetId)
      if (targetPhoto) {
        const img = new Image()
        img.onload = () => {
          setTimeout(() => {
            setCurrentPhotoId(finalTargetId)
            setIsLoading(false)
          }, 200) // Smooth transition delay
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
  }, [currentPhoto, isLoading])

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
        setTimeout(() => {
          setCurrentPhotoId(photoId)
          setIsLoading(false)
        }, 300)
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

    const { connections } = currentPhoto
    return {
      forward: !!connections.forward,
      back: !!connections.back,
      left: !!connections.left,
      right: !!connections.right,
      up: !!connections.up,
      down: !!connections.down,
      elevator: !!connections.elevator
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

    // Navigation functions
    navigateDirection,
    jumpToPhoto,
    getAvailableDirections,
    handleCameraChange
  }
}